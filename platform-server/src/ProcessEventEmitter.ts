
const cluster = require('cluster');

class ProcessSubscription {
    constructor(private emitter: { unsubscribe(listener: (value: any) => void): void }, private listener: (value: any) => Promise<void>) {
        //
    }
    unsubscribe() {
        this.emitter.unsubscribe(this.listener);
    }
}

class ProcessEventEmitter<T> {
    listener: any;
    constructor() {

    }

    emit(value: T): void {
        if (cluster.isWorker == false && typeof process.emit === 'function') {
            process.emit('message', value, null);
        } else if (typeof process.send === 'function') {
            process.send(value);
        }
    }

    subscribe(next: (value: T) => void): ProcessSubscription {
        // create new listener
        this.listener = (value: any) => {
            void next(value);
        };
        // attach listener
        process.on('message', this.listener);
        // and return subscription
        return new ProcessSubscription(this, this.listener);
    }

    unsubscribe() {
        process.removeListener('message', this.listener);
    }

}

export {
    ProcessEventEmitter
}