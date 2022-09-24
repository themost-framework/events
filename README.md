[![npm](https://img.shields.io/npm/v/@themost%2Fevents.svg)](https://www.npmjs.com/package/@themost%2Fevents)
![GitHub top language](https://img.shields.io/github/languages/top/themost-framework/events)
[![License](https://img.shields.io/npm/l/@themost/events)](https://github.com/themost-framework/events/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/themost-framework/events)
![GitHub Release Date](https://img.shields.io/github/release-date/themost-framework/events)
[![npm](https://img.shields.io/npm/dw/@themost/events)](https://www.npmjs.com/package/@themost%2Fevents)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@themost/events)

![MOST Web Framework Logo](https://github.com/themost-framework/common/raw/master/docs/img/themost_framework_v3_128.png)

# @themost/events
Sync and async event emitters for both browser and node.js

## Usage

    npm i @themost/events

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
