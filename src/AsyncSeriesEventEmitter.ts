import {AsyncSubscription} from './Subscription';

function wrapAsyncListener(asyncListener: (...arg: any) => Promise<void>) {
    const wrapListener = function() {
        return asyncListener.apply(null, Array.from(arguments));
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(wrapListener, '_listener', {
        configurable: true,
        enumerable: true,
        value: asyncListener
    });
    return wrapListener;
}

/**
 * Wraps an async listener and returns a callback-like function
 * @param {function(...*):Promise<void>} asyncListener
 */
 function wrapOnceAsyncListener(asyncListener: (arg: any) => Promise<void>) {
    const wrapOnceListener = function() {
        return asyncListener.apply(null, Array.from(arguments)).then(() => {
            Object.defineProperty(wrapOnceListener, 'once', {
                configurable: true,
                enumerable: true,
                value: 'completed'
            });
        }).catch(() => {
            Object.defineProperty(wrapOnceListener, 'once', {
                configurable: true,
                enumerable: true,
                value: 'rejected'
            });
        });
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(wrapOnceListener, '_listener', {
        configurable: true,
        enumerable: true,
        value: asyncListener
    });
    return wrapOnceListener;
}

class AsyncSeriesEventEmitter<T> {

    private readonly listeners: ((value?: T) => void)[] = [];

    async emit(value: T): Promise<void> {
        for (const asyncListener of this.listeners) {
            const listener = asyncListener as any;
            if (typeof listener.once === 'string') {
                if (listener.once !== 'waiting') {
                    continue;
                }
                Object.defineProperty(listener, 'once', {
                    configurable: true,
                    enumerable: true,
                    value: 'pending'
                });
                await listener(value);
            } else {
                await listener(value);
            }
        }
    }

    subscribe(next: (value: T) => Promise<void>): AsyncSubscription {
        this.listeners.push(wrapAsyncListener(next));
        return new AsyncSubscription(this, next);
    }

    subscribeOnce(next: (value: T) => Promise<void>): void {
        this.listeners.push(wrapOnceAsyncListener(next));
    }

    unsubscribe(listener: (value: T) => Promise<void>): void {
        for (let i = 0; i < this.listeners.length; i++) {
            const syncListener = this.listeners[i] as any;
            if (syncListener._listener === listener) {
                this.listeners.splice(i , 1);
                break;
            }
        }
    }
}

export {
    AsyncSeriesEventEmitter
}
