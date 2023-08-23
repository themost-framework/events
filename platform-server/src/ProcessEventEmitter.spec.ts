import {ProcessEventEmitter} from './ProcessEventEmitter';

describe('ProcessEventEmitter', () => {

    it('should use ProcessEventEmitter.subscribe()', async ()=> {
        new ProcessEventEmitter<any>().subscribe(async (value: any) => {
            expect(value).toBeTruthy();
        });
    });
});
