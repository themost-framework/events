

function wrapAsyncListener(asyncListener: (...arg: any) => Promise<void>,
                           error?: (err: Error) => void,
                           complete?: () => void) {
    const wrapListener = function() {
        return asyncListener.apply(null, Array.from(arguments)).then(() => {
            if (typeof complete === 'function') {
                return complete();
            }
        }).catch((err) => {
            if (typeof error === 'function') {
                return error(err);
            }
        });
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(wrapListener, '_listener', {
        configurable: true,
        enumerable: true,
        value: asyncListener
    });
    return wrapListener;
}

function wrapOnceAsyncListener(asyncListener: (arg: any) => Promise<void>,
                               error?: (err: Error) => void,
                               complete?: () => void) {
    const wrapOnceListener = function() {
        return asyncListener.apply(null, Array.from(arguments)).then(() => {
            // set state of subscriber (completed)
            Object.defineProperty(wrapOnceListener, 'once', {
                configurable: true,
                enumerable: true,
                value: 'completed'
            });
            if (typeof complete === 'function') {
                return complete();
            }
        }).catch((err) => {
            // set state of subscriber (rejected)
            Object.defineProperty(wrapOnceListener, 'once', {
                configurable: true,
                enumerable: true,
                value: 'rejected'
            });
            if (typeof error === 'function') {
                return error(err);
            }
        });
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(wrapOnceListener, '_listener', {
        configurable: true,
        enumerable: true,
        value: asyncListener
    });
    // set waiting state
    Object.defineProperty(wrapOnceListener, 'once', {
        configurable: true,
        enumerable: true,
        value: 'waiting'
    });
    return wrapOnceListener;
}

class AsyncEventEmitter<T> {
    private readonly listeners: ((value?: T) => void)[] = [];

    emit(value?: T): void {
        for (const eventListener of this.listeners) {
            const listener = eventListener as any;
            if (typeof listener.once === 'string') {
                if (listener.once !== 'waiting') {
                    continue;
                }
                Object.defineProperty(listener, 'once', {
                    configurable: true,
                    enumerable: true,
                    value: 'pending'
                });
                listener(value);
            } else {
                listener(value);
            }
        }
    }

    subscribe(next: (value?: T) => Promise<void>, error?: (err: Error) => void, complete?: () => void): void {
        this.listeners.push(wrapAsyncListener(next, error, complete));
    }

    subscribeOnce(next: (value?: T) => Promise<void>, error?: (err: Error) => void, complete?: () => void): void {
        this.listeners.push(wrapOnceAsyncListener(next, error, complete));
    }

    unsubscribe(listener: (value?: T) => Promise<void>): void {
        for (let i = 0; i < this.listeners.length; i++) {
            const eventListener = this.listeners[i] as any;
            if (eventListener._listener === listener) {
                this.listeners.splice(i , 1);
                break;
            }
        }
    }
}

export {
    AsyncEventEmitter
}
