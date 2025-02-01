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
});