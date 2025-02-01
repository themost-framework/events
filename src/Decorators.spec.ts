import { before, after, beforeAsync, afterAsync, BeforeAfterEvent, BeforeAfterCallback } from "./Decorators";

describe('Decorators', () => {
    it('should use @before() and @after()', async ()=> {
        class MyClass {
            @before((event) => {
                expect(event.target).toBeInstanceOf(MyClass);
                expect(event.args).toEqual([5, 5]);
            })
            @after((event) => {
                expect(event.target).toBeInstanceOf(MyClass);
                expect(event.args).toEqual([5, 5]);
                expect(event.result).toBe(10);
            })
            public add(a: number, b: number) {
                return a + b;
            }
        }
        const item = new MyClass();
        expect(item.add(5, 5)).toBe(10);
    });

    it('should use @before() and @after() and return result', async ()=> {
        class UserAction {
            public status: string;
            constructor() {
                this.status = 'unknown';
            }
            @before(() => {
                return {
                    value: 'loaded'
                }
            })
            load() {
                return 'loading';
            }
        }
        const item = new UserAction();
        const result = item.load();
        expect(result).toBe('loaded');
    });

    it('should use @beforeAsync() and @afterAsync()', async ()=> {
        class MyClass {
            @beforeAsync(async (event) => {
                expect(event.target).toBeInstanceOf(MyClass);
                expect(event.args).toEqual([5, 5]);
            })
            @afterAsync(async (event) => {
                expect(event.target).toBeInstanceOf(MyClass);
                expect(event.args).toEqual([5, 5]);
                expect(event.result).toBe(10);
            })
            public addAsync(a: number, b: number) {
                return Promise.resolve(a + b);
            }
        }
        const item = new MyClass();
        expect(await item.addAsync(5, 5)).toBe(10);
    });

    it('should use @beforeAsync() and @afterAsync() and return result', async ()=> {
        class UserAction {
            public status: string;
            constructor() {
                this.status = 'unknown';
            }
            @beforeAsync(async () => {
                return await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            value: 'loaded'
                        });
                    }, 1000);
                });
            })
            async load() {
                return 'loading';
            }
        }
        const item = new UserAction();
        const result = await item.load();
        expect(result).toBe('loaded');
    });


    it('should use @before() and @after() with callbacks', async ()=> {
        class UserAction {
            public status: string;
            constructor() {
                this.status = 'unknown';
            }
            @before((_event: BeforeAfterEvent<any>, callback: BeforeAfterCallback<any>) => {
                void setTimeout(() => {
                    return callback(null, {
                        value: 'loaded'
                    });
                }, 1000);
            })
            async load(callback: (err: Error | unknown, result?: string) => void) {
                return callback(null, 'loading');
            }
        }
        await new Promise((resolve, reject) => {
            const item = new UserAction();
            item.load((err, result) => {
                if (err) {
                    reject(err);
                }
                expect(result).toBe('loaded');
                resolve(void 0);
            });
        });
    });

});