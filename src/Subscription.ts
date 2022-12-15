

class AsyncSubscription {
    constructor(private emitter: { unsubscribe(listener: (value: any) => Promise<void>): void }, private listener: (value: any) => Promise<void>) {
        //
    }
    unsubscribe() {
        this.emitter.unsubscribe(this.listener);
    }
}

class SyncSubscription {
    constructor(private emitter: { unsubscribe(listener: (value: any) => void): void }, private listener: (value: any) => void) {
        //
    }
    unsubscribe() {
        this.emitter.unsubscribe(this.listener);
    }
}

export {
    AsyncSubscription,
    SyncSubscription
}