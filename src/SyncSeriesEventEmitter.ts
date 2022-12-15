import {SyncSubscription} from './Subscription';

function wrapSyncListener<T>(syncListener: (arg: T) => void): (arg: T) => void {
    // tslint:disable-next-line:only-arrow-functions
    const wrapListener = function() {
        syncListener.apply(null, Array.from(arguments));
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(wrapListener, '_listener', {
        configurable: true,
        enumerable: true,
        value: syncListener
    });
    return wrapListener;
}

function wrapOnceSyncListener<T>(syncListener: (arg: T) => void): (arg: T) => void {
    // tslint:disable-next-line:only-arrow-functions
    const wrapOnceListener = function() {
        syncListener.apply(null, Array.from(arguments));
        Object.defineProperty(wrapOnceListener, 'fired', {
            configurable: true,
            enumerable: true,
            value: true
        });
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(wrapOnceListener, '_listener', {
        configurable: true,
        enumerable: true,
        value: syncListener
    });
    return wrapOnceListener;
}

class SyncSeriesEventEmitter<T> {

    private readonly listeners: ((value?: T) => void)[] = [];

    emit(value: T): void {
        for (const syncListener of this.listeners) {
            const listener = syncListener as any;
            const fired = (typeof listener.fired === 'boolean' && listener.fired);
            if (fired === false) {
                listener(value);
            }
        }
    }

    subscribe(next: (value: T) => void): SyncSubscription {
        this.listeners.push(wrapSyncListener(next));
        return new SyncSubscription(this, next);
    }

    subscribeOnce(next: (value: T) => void): void {
        this.listeners.push(wrapOnceSyncListener(next));
    }

    unsubscribe(listener: (value: T) => void): void {
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
    SyncSeriesEventEmitter
}
