import { after, before, beforeAsync, afterAsync } from "./Decorators";

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
            public addAync(a: number, b: number) {
                return Promise.resolve(a + b);
            }
        }
        const item = new MyClass();
        expect(await item.addAync(5, 5)).toBe(10);
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

});