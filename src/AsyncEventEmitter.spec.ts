import {AsyncEventEmitter} from './AsyncEventEmitter';

describe('AsyncEventEmitter', () => {

    it('should use AsyncEventEmitter.subscribe()', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribe(async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 400);
        });
        newItem.load.subscribe(async (event: { value: number }) => {
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
    });

    it('should use AsyncEventEmitter.subscribe() with error', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        const handler = {
            handleError(err: Error) {
                expect(err).toBeTruthy();
            }
        }
        spyOn(handler, 'handleError');
        newItem.load.subscribe(async () => {
            throw new Error('The operation was cancelled');
        }, handler.handleError);
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(100);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(handler.handleError).toHaveBeenCalled();
                return resolve(true);
            }, 500);
        });
    });

    it('should use AsyncEventEmitter.subscribe() with complete', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        const handler = {
            handleComplete() {
                //
            }
        }
        spyOn(handler, 'handleComplete');
        newItem.load.subscribe(async () => {
            eventArgs.value += 1;
        }, undefined, handler.handleComplete);
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(handler.handleComplete).toHaveBeenCalled();
                expect(eventArgs.value).toBe(101);
                return resolve(true);
            }, 500);
        });
    });


    it('should use AsyncEventEmitter.subscribeOnce()', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribeOnce(async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 250);
        });
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(eventArgs.value).toBe(101);
                return resolve(true);
            }, 1000);
        });
    });

    it('should use AsyncEventEmitter.subscribeOnce() with error', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        const handler = {
            handleError(err: Error) {
                expect(err).toBeTruthy();
            }
        }
        spyOn(handler, 'handleError');
        newItem.load.subscribeOnce(async () => {
            throw new Error('The operation was cancelled');
        }, handler.handleError);
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        expect(eventArgs.value).toBe(100);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(handler.handleError).toHaveBeenCalled();
                return resolve(true);
            }, 500);
        });
    });

    it('should use AsyncEventEmitter.subscribeOnce() with complete', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        const handler = {
            handleComplete() {
                //
            }
        }
        spyOn(handler, 'handleComplete');
        newItem.load.subscribeOnce(async () => {
            eventArgs.value += 1;
        }, undefined, handler.handleComplete);
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(handler.handleComplete).toHaveBeenCalled();
                expect(eventArgs.value).toBe(101);
                return resolve(true);
            }, 500);
        });
    });

    it('should use AsyncEventEmitter.unsubscribe()', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribe(async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 400);
        });

        const secondSubscriber = async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 500);
        };
        newItem.load.subscribe(secondSubscriber);
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

        newItem.load.unsubscribe(secondSubscriber);
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(eventArgs.value).toBe(103);
                return resolve(true);
            }, 1000);
        });
    });


    it('should use AsyncEventEmitter.unsubscribe() with runtime error', async ()=> {
        class MyClass {
            public readonly load = new AsyncEventEmitter<{value: number}>();
        }
        const newItem = new MyClass();
        newItem.load.subscribe(async (event: { value: number }) => {
            setTimeout(() => {
                event.value += 1;
            }, 400);
        });

        const secondSubscriber = async (event: { value: number }) => {
            event.value += 1;
            throw new Error('A runtime error during execution');
        };
        newItem.load.subscribe(secondSubscriber);
        const eventArgs = {
            value: 100
        }
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(eventArgs.value).toBe(102);
                return resolve(true);
            }, 1000);
        });

        newItem.load.unsubscribe(secondSubscriber);
        newItem.load.emit(eventArgs);
        await new Promise((resolve) => {
            setTimeout(() => {
                expect(eventArgs.value).toBe(103);
                return resolve(true);
            }, 1000);
        });
    });

});
