[![npm](https://img.shields.io/npm/v/@themost%2Fevents.svg)](https://www.npmjs.com/package/@themost%2Fevents)
![GitHub top language](https://img.shields.io/github/languages/top/themost-framework/events)
[![License](https://img.shields.io/npm/l/@themost/events)](https://github.com/themost-framework/events/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/themost-framework/events)
![GitHub Release Date](https://img.shields.io/github/release-date/themost-framework/events)
[![npm](https://img.shields.io/npm/dw/@themost/events)](https://www.npmjs.com/package/@themost%2Fevents)

![MOST Web Framework Logo](https://github.com/themost-framework/common/raw/master/docs/img/themost_framework_v3_128.png)

# @themost/events
Sync and async event emitters for both browser and node.js

## Usage

    npm i @themost/events

### AsyncSeriesEventEmitter

Use `AsyncSeriesEventEmitter` for executing a collection of async event subscribers in series. 
The following example demonstrates a before load event which executes event subscribers and continues.


    const { AsyncSeriesEventEmitter } = require('@themost/events');
    class UserAction {
        
        constructor() {
            this.beforeLoad = new AsyncSeriesEventEmitter();
        }
        
        async load() {
            await this.beforeLoad.emit({
                target: this
            });
            this.dateCreated = new Date();
        }        
    }

    (async function () {
        const item = new UserAction();
        item.beforeLoad.subscribe((event) => {
            event.target.status = 'waiting';
        });
    
        item.beforeLoad.subscribe((event) => {
            return new Promise((resolve) => {
                // wait for something
                setTimeout(() => {
                    event.target.status = 'active';
                    resolve();
                }, 1000);
            });
        });
        await item.load();
        console.log('Loaded', 'status', item.status);
    })().then(() => {
        //
    });

### AsyncEventEmitter

Use `AsyncEventEmitter` for executing a collection of async event subscribers in parallel.

    const { AsyncEventEmitter } = require('@themost/events');
    class UserAction {
        
        constructor() {
            this.beforeLoad = new AsyncEventEmitter();
        }
        
        async load() {
            this.beforeLoad.emit({
                target: this
            });
            this.dateCreated = new Date();
        }        
    }

    const item = new UserAction();
    item.beforeLoad.subscribe((event) => {
        event.target.status = 'waiting';
    });

    item.beforeLoad.subscribe((event) => {
        return new Promise((resolve) => {
            // wait for something
            setTimeout(() => {
                event.target.status = 'active';
                resolve();
            }, 1000);
        });
    });
    item.load();

### SyncSeriesEventEmitter

Use `SyncSeriesEventEmitter` for executing a collection of sync event subscribers in series.
The following example demonstrates an after load event which executes event subscribers and continues.


    const { SyncSeriesEventEmitter } = require('@themost/events');
    class UserAction {
        constructor() {
            this.afterLoad = new SyncSeriesEventEmitter();
        }
        
        load() {
            this.status = 'unknown';
            this.afterLoad.emit({
                target: this
            });
        }        
    }

    const item = new UserAction();

    item.afterLoad.subscribe((event) => {
        event.target.status = 'waiting';
        event.target.dateCreated = new Date();
    });

    item.afterLoad.subscribe((event) => {
        if (event.target.status === 'waiting') {
            event.target.status = 'active';
        }
    });
    
    // perform load
    item.load();
    console.log('Loaded', 'status', item.status);
    console.log('Loaded', 'dateCreated', item.dateCreated);

### ProcessEventEmitter

Use `ProcessEventEmitter` for sending and receiving process messages in both fork and cluster mode under node.js.

Import `@themost/events/platform-server/register` in your startup script

    import '@themost/events/platform-server/register'

If your application is running in cluster mode, each message received by the primary process will be forwarded to each worker of a cluster. This operation is very important when you are implementing shared services across cluster workers and enables the communication between of them.

Start sending and receiving messages:

    new ProcessEventEmitter().emit(msg);

    ...

    new ProcessEventEmitter().subscribe((value) => {
        // write your code here
    });

### @before and @after decorators

Use `@before` and `@after` decorators for decorating any class method and execute a procedure before and after method execution.

```javascript
    import { before, after } from '@themost/events';

    class UserAction {
        
        constructor() {
            this.status = 'unknown';
        }
        
        @before((event) => {
            event.target.status = 'waiting';
        })
        @after((event) => {
            event.target.status = 'active';
        })
        load() {
            //
        }        
    }
    const item = new UserAction();
    item.load();
    console.log('Loaded', 'status', item.status);
```

The `event` object contains the following properties:

- `target` - the target object which the method is called
- `args` - the method arguments
- `result` - the method return value for `@after` and `@afterAsync` decorators

`@before` and `@after` callables may return a value which overrides the original method return value. The following example demonstrates how to override the original method return value.

```javascript
    import { before, after } from '@themost/events';

    class UserAction {
        constructor() {
            this.status = 'unknown';
        }
        
        @before((event) => {
            event.target.status = 'waiting';
            return {
                value: 'loaded'
            };
        })
        load() {
            return 'loading';
        }
    }
    const item = new UserAction();
    const result = item.load();
    console.log('Loaded', 'status', item.status, 'result', result);
```

### @before and @after decorators with callback

Use `@before` and `@after` decorators with callback for decorating any class method and execute a procedure before and after method execution.

```javascript
    import { before, after } from '@themost/events';

    class UserAction {
        
        constructor() {
            this.status = 'unknown';
        }
        
        @before((event, callback) => {
            void setTimeout(() => {
                event.target.status = 'loaded';
                return callback();
            }, 1000);
        })
        load(callback) {
            this.status = 'loading';
            return callback();
        }        
    }
    const item = new UserAction();
    item.load(() => {
        console.log('Loaded', 'status', item.status);
    });
```

### @beforeAsync and @afterAsync decorators

Use `@beforeAsync` and `@afterAsync` decorators for decorating any class method and execute an async procedure before and after method execution.

```javascript
    import { beforeAsync, afterAsync } from '@themost/events';

    class UserAction {
        
        constructor() {
            this.status = 'unknown';
        }
        
        @beforeAsync(async (event) => {
            await new Promise((resolve) => {
                setTimeout(() => {
                    event.target.status = 'waiting';
                    resolve();
                }, 1000);
            });
        })
        @afterAsync(async (event) => {
            event.target.status = 'active';
        })
        async load() {
            return this.status;
        }        
    }
    (async function () {
        const item = new UserAction();
        await item.load();
        console.log('Loaded', 'status', item.status);
    })();
```

`@beforeAsync` and `@afterAsync` callables may return a value which overrides the original method return value. The following example demonstrates how to override the original method return value.

```javascript
    import { beforeAsync, afterAsync } from '@themost/events';

    class UserAction {
        constructor() {
            this.status = 'unknown';
        }
        
        @beforeAsync(async (event) => {
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
    (async function () {
        const item = new UserAction();
        const result = await item.load();
        console.log('Loaded', 'status', item.status, 'result', result);
    })();
```