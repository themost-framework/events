
declare type BeforeAfterResult<T> = void | {
    value: T
} 

/**
 * A decorator function that executes a given callback function before the original method is called.
 *
 * @param callable - A function that takes an event object containing the target and arguments of the original method.
 * @returns A decorator function that modifies the original method to call the provided callback function before executing the original method.
 *
 * @example
 * ```typescript
 * class Example {
 *     @before((event) => {
 *         console.log('Before method call', event);
 *     })
 *     someMethod(arg1: string, arg2: number) {
 *         console.log('Original method', arg1, arg2);
 *     }
 * }
 * 
 * const example = new Example();
 * example.someMethod('test', 42);
 * // Output:
 * // Before method call { target: Example, args: ['test', 42] }
 * // Original method test 42
 * ```
 */
function before(callable: (event: { target: any, args: any[] }) => BeforeAfterResult<any>): any {
    return function (target: Object, 
        propertyKey: string, 
        descriptor: TypedPropertyDescriptor<any>) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const target = this;
            const res = callable({
                target,
                args
            });
            // If the callback returns an object with a 'value' property, return the value
            // instead of executing the original method.
            if (res && Object.prototype.hasOwnProperty.call(res, 'value')) {
                return res.value;
            }
            return originalMethod.apply(this, args);
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
    return function (target: Object, 
        propertyKey: string, 
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
 * A decorator function that executes a given callback function after the original method is called.
 *
 * @param callable - A callback function that receives an event object containing the target object, 
 * the arguments passed to the original method, and the result of the original method.
 * @returns A decorator function that wraps the original method and calls the callback function after the method execution.
 */
function after(callable: (event: { target: any, args: any, result?: any }) => BeforeAfterResult<any>): any {
    return function (target: Object, 
        propertyKey: string, 
        descriptor: TypedPropertyDescriptor<any>): any {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);
            const target = this;
            const res = callable({
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
    return function (target: Object, 
        propertyKey: string, 
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
    BeforeAfterResult,
    before,
    beforeAsync,
    after,
    afterAsync
}