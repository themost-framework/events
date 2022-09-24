import {AsyncSeriesEventEmitter} from './AsyncSeriesEventEmitter';

describe('AsyncSeriesEventEmitter', () => {

    it('should use AsyncSeriesEventEmitter.subscribe()', async ()=> {
        class MyClass {
            public readonly load = new AsyncSeriesEventEmitter<{value: number}>();
        }
        const item = new MyClass();
        item.load.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });
        item.load.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });
        const eventArgs = {
            value: 100
        }
        await item.load.emit(eventArgs);
        expect(eventArgs.value).toBe(102);
    });

    it('should use AsyncSeriesEventEmitter.subscribe() with delay', async ()=> {
        class MyClass {
            public readonly load = new AsyncSeriesEventEmitter<{status: string}>();
        }
        const item = new MyClass();
        item.load.subscribe(async (event: { status: string }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    event.status = 'active';
                    resolve();
                }, 1000);
            });
        });
        item.load.subscribe(async (event: { status: string }) => {
            event.status = 'completed';
        });
        const eventArgs = {
            status: 'unknown'
        }
        await item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('completed');
    });

    it('should use AsyncSeriesEventEmitter.unsubscribe()', async ()=> {
        class MyClass {
            public readonly load = new AsyncSeriesEventEmitter<{value: number}>();
        }
        const item = new MyClass();
        item.load.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });

        const secondSubscriber = async (event: { value: number }) => {
            event.value += 1;
        };

        item.load.subscribe(secondSubscriber);
        const eventArgs = {
            value: 100
        }
        await item.load.emit(eventArgs);
        expect(eventArgs.value).toBe(102);
        item.load.unsubscribe(secondSubscriber);
        await item.load.emit(eventArgs);
        expect(eventArgs.value).toBe(103);
    });

    it('should use AsyncSeriesEventEmitter.subscribeOnce()', async ()=> {
        class MyClass {
            public readonly load = new AsyncSeriesEventEmitter<{value: number}>();
        }
        const item = new MyClass();
        item.load.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });
        item.load.subscribeOnce(async (event: { value: number }) => {
            event.value += 1;
        });
        const eventArgs = {
            value: 100
        }
        await item.load.emit(eventArgs);
        expect(eventArgs.value).toBe(102);
        await item.load.emit(eventArgs);
        expect(eventArgs.value).toBe(103);
    });

});
