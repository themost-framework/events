import {AsyncEventEmitter} from './AsyncEventEmitter';
import {SyncSeriesEventEmitter} from './SyncSeriesEventEmitter';
import {AsyncSeriesEventEmitter} from './AsyncSeriesEventEmitter';

describe('Subscription', () => {

    it('should use AsyncSubscription.unsubscribe()', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribe(async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 400);
        });
        const second = newItem.load.subscribe(async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 500);
        });
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(100);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(eventArgs.value).toBe(102);
                return resolve(true);
            }, 1000);
        });

        second.unsubscribe();
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(eventArgs.value).toBe(103);
                return resolve(true);
            }, 1000);
        });
    });

    it('should use SyncSubscription.unsubscribe()', async ()=> {
        class MyClass {
            public readonly load = new SyncSeriesEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribe((event: { value: number }) => {
            event.value += 1;
        });
        const second = newItem.load.subscribe((event: { value: number }) => {
            event.value += 2;
        });;
        const eventArgs = {
            value: 1
        }
        newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(4);
        second.unsubscribe();
        newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(5);
    });

    it('should use AsyncSubscription.unsubscribe()', async ()=> {
        class MyClass {
            public readonly load = new AsyncSeriesEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });
        const second = newItem.load.subscribe(async (event: { value: number }) => {
            event.value += 2;
        });;
        const eventArgs = {
            value: 1
        }
        await newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(4);
        second.unsubscribe();
        newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(5);
    });

});
