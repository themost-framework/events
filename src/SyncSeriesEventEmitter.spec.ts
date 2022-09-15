import { SyncSeriesEventEmitter } from './SyncSeriesEventEmitter';
describe('SyncSeriesEventEmitter', () => {

    it('should use SeriesEventEmitter.subscribe()', async ()=> {
        class MySyncClass {
            public readonly load = new SyncSeriesEventEmitter<{status: string}>();
        }
        const item = new MySyncClass();
        item.load.subscribe((event: { status: string }) => {
            event.status = 'active';
        });
        item.load.subscribe( (event: { status: string }) => {
            event.status = 'completed';
        });
        const eventArgs = {
            status: 'unknown'
        }
        item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('completed');
        item.load.subscribe( (event: { status: string }) => {
            event.status = 'pending';
        });
        item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('pending');
    });

    it('should use SeriesEventEmitter.subscribeOnce()', async ()=> {
        class MySyncClass {
            public readonly load = new SyncSeriesEventEmitter<{status: string}>();
        }
        const item = new MySyncClass();
        item.load.subscribe((event: { status: string }) => {
            event.status = 'active';
        });
        item.load.subscribeOnce( (event: { status: string }) => {
            event.status = 'completed';
        });
        const eventArgs = {
            status: 'unknown'
        }
        item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('completed');
        item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('active');
    });

    it('should use SeriesEventEmitter.unsubscribe()', async ()=> {
        class MySyncClass {
            public readonly load = new SyncSeriesEventEmitter<{status: string}>();
        }
        const item = new MySyncClass();
        item.load.subscribe(function setActive(event: { status: string }) {
            event.status = 'active';
        });
        function setCompleted(event: { status: string }) {
            event.status = 'completed';
        }
        item.load.subscribe(setCompleted);
        const eventArgs = {
            status: 'unknown'
        }
        item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('completed');
        item.load.unsubscribe(setCompleted);
        item.load.emit(eventArgs);
        expect(eventArgs.status).toBe('active');
    });


});
