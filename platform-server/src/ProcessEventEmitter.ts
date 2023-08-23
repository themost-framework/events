
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
        if (cluster.isPrimary) {
            if (cluster.workers == null) {
                this.listener = (value: any) => {
                    void next(value);
                }
                process.on('message', this.listener);
            } else {
                this.listener = (worker: any, data: any) => {
                    if (cluster.workers) {
                        const workers = cluster.workers;
                        Object.keys(workers).forEach((id) => {
                            const worker = workers[id];
                            if (worker) {
                                worker.send(data);
                            }
                         });
                    }
                };
                cluster.on('message', this.listener);
            }
        } else {
            this.listener = (value: any) => {
                void next(value);
            }
            process.on('message', this.listener);
        }
        return new ProcessSubscription(this, this.listener);
    }

    unsubscribe() {
        if (cluster.isPrimary  && cluster.workers) {
            cluster.removeListener('message', this.listener);
        }
        process.removeListener('message', this.listener);
    }

}

export {
    ProcessEventEmitter
}