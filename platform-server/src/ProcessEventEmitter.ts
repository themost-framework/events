
import cluster from 'cluster';

class ProcessSubscription {
    constructor(private emitter: { unsubscribe(listener: (value: any) => Promise<void>): void }, private listener: (value: any) => Promise<void>) {
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

    async emit(value: T): Promise<void> {
        if (typeof process.send === 'function') {
            process.send(value);
        } else if (typeof process.emit === 'function') {
            process.emit('message', value, null);
        } else {
            throw new TypeError('Missing method for emitting events');
        }
    }

    subscribe(next: (value: T) => Promise<void>): ProcessSubscription {
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