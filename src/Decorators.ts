
declare type BeforeAfterResult<T> = void | {
    value: T
} 

declare type BeforeAfterEvent<T> = {
    target: any,
    args: any[],
    result?: T
}

declare type BeforeAfterCallback<T> = (err: Error | unknown, result?: { value: T }) => void;


/**
 * A decorator function that executes a specified callable function before the original method.
 * The callable function can modify the arguments or prevent the original method from being called.
 *
 * @param callable - A function that takes an event object and a callback function as arguments.
 *                   The event object contains the target object and the arguments of the original method.
 *                   The callback function should be called with an error or a result object.
 *                   If the result object contains a 'value' property, the original method will not be called.
 *                   Otherwise, the original method will be called with the modified arguments.
 * @returns A decorator function that can be applied to a method.
 */
function before(callable: (event: BeforeAfterEvent<any>, ...callback: [BeforeAfterCallback<any>]) => BeforeAfterResult<any>): any {
    return function (_target: Object,
                     _propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const target = this;
            // get callback function from arguments
            let callback = args.pop();
            if (typeof callback !== 'function') {
                // if the last argument is not a function, push it back to the arguments
                args.push(callback);
                // and set original callback to null which indicates that the callback is missing
                // and the original method should be called without a callback
                callback = null;
            }
            if (callback === null) {
                // if the callback is missing, execute callable
                const res = callable({
                    target,
                    args
                }, undefined);
                // If the callback returns an object with a 'value' property, return the value
                // instead of executing the original method.
                if (res && Object.prototype.hasOwnProperty.call(res, 'value')) {
                    return res.value;
                }
                return originalMethod.apply(this, args);
            }
            // execute callable function
            return callable({
                target,
                args
            }, (err, result) => {
                if (err) {
                    return callback(err);
                }
                if (result && Object.prototype.hasOwnProperty.call(result, 'value')) {
                    // execute original callback function with the result
                    return callback(null, result.value);
                }
                // push callback function back to arguments
                args.push(callback);
                // execute original method
                return originalMethod.apply(this, args);
            });
        };
        return descriptor;
    };
}

/**
 * A decorator that executes an asynchronous function before the decorated method is called.
 * 
 * @param callable - An asynchronous function that takes an event object containing the target and arguments of the method call.
 * @returns A decorator function that modifies the method to call the provided asynchronous function before executing the original method.
 * 
 * @example
 * ```typescript
 * class Example {
 *     @beforeAsync(async (event) => {
 *         console.log('Before method call', event);
 *     })
 *     async myMethod(arg1: string, arg2: number) {
 *         console.log('Original method', arg1, arg2);
 *     }
 * }
 * ```
 */
function beforeAsync(callable: (event: { target: any, args: any[] }) => Promise<BeforeAfterResult<any>>): any {
    return function (_target: Object,
                     _propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>): any {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const target = this;
            const res = await callable({
                target,
                args
            });
            if (res && Object.prototype.hasOwnProperty.call(res, 'value')) {
                return res.value;
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}

/**
 * A decorator function that executes a callable function after the original method.
 * The callable function can modify the result of the original method.
 *
 * @param callable - A function that takes an event object and an optional callback, 
 * and returns a result object. The event object contains the target object, 
 * the arguments passed to the original method, and the result of the original method.
 * The callback is used to handle asynchronous operations.
 * 
 * @returns A decorator function that wraps the original method.
 *
 * @example
 * ```typescript
 * class Example {
 *     @after((event, callback) => {
 *         console.log('After method execution:', event.result);
 *         if (callback) {
 *             callback(null, event.result);
 *         }
 *         return { value: event.result };
 *     })
 *     someMethod(arg1: string, arg2: number, callback: (err: Error, result: any) => void) {
 *         // original method implementation
 *         callback(null, 'result');
 *     }
 * }
 * ```
 */
function after(callable: (event: BeforeAfterEvent<any>, ...callback: [BeforeAfterCallback<any>]) => BeforeAfterResult<any>): any {
    return function (_target: Object,
                     _propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const target = this;
            // get the original callback function
            let originalCallback = args.pop();
            if (typeof originalCallback !== 'function') {
                // if the last argument is not a function, push it back to the arguments
                args.push(originalCallback);
                // and set original callback to null which indicates that the callback is missing
                // and the original method should be called without a callback
                originalCallback = null;
            }
            if (originalCallback === null) {
                // execute callable function and return the result
                const result = originalMethod.apply(this, args);
                const res = callable({
                    target,
                    args,
                    result
                }, null);
                if (res && Object.prototype.hasOwnProperty.call(res, 'value')) {
                    return res.value;
                }
                return result;
            }
            void originalMethod.apply(this, args.concat((err: Error, result: any) => {
                if (err) {
                    return originalCallback(err);
                }
                return callable({
                    target,
                    args,
                    result
                }, (err, res) => {
                    if (err) {
                        return originalCallback(err);
                    }
                    if (res && Object.prototype.hasOwnProperty.call(res, 'value')) {
                        return originalCallback(null, res.value);
                    }
                    return originalCallback(null, result);
                });
            }));
        };
        return descriptor;
    };
}

/**
 * A decorator that executes an asynchronous callback function after the original method is called.
 * 
 * @param callable - An asynchronous function that takes an event object containing the target object,
 *                   the arguments passed to the original method, and the result of the original method.
 * @returns A decorator function that wraps the original method and executes the callback after the method completes.
 * 
 * @example
 * ```typescript
 * class Example {
 *     @afterAsync(async (event) => {
 *         console.log('After method call:', event);
 *     })
 *     async someMethod(arg1: string, arg2: number) {
 *         // method implementation
 *     }
 * }
 * ```
 */
function afterAsync(callable: (event: { target: any, args: any, result?: any }) => Promise<BeforeAfterResult<any>>): any {
    return function (_target: Object,
                     _propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>): any {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);
            const target = this;
            const res = await callable({
                target,
                args,
                result
            });
            if (res && Object.prototype.hasOwnProperty.call(res, 'value')) {
                return res.value;
            }
            return result;
        };
        return descriptor;
    };
}

export {
    BeforeAfterEvent,
    BeforeAfterResult,
    BeforeAfterCallback,
    before,
    after,
    beforeAsync,
    afterAsync
}