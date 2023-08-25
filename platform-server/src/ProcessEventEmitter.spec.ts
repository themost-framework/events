import {ProcessEventEmitter} from './ProcessEventEmitter';

describe('ProcessEventEmitter', () => {

    it('should use ProcessEventEmitter.subscribe()', async ()=> {
        let result = 0;
        function onValue(value: any) {
            expect(value).toBeTruthy();
            result = value.counter;
        }
        let subscription = new ProcessEventEmitter<any>().subscribe(onValue);
        new ProcessEventEmitter<any>().emit({
            counter: 1
        });
        subscription.unsubscribe();
        new ProcessEventEmitter<any>().emit({
            counter: 2
        });
        expect(result).toEqual(1);
        subscription = new ProcessEventEmitter<any>().subscribe(onValue);
        new ProcessEventEmitter<any>().emit({
            counter: 3
        });
        expect(result).toEqual(3);
    });
});
