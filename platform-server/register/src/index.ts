import cluster from 'cluster';
if (cluster.isMaster || cluster.isPrimary) {
    cluster.on('message', (worker: any, data: any) => {
        if (cluster.workers) {
            if (data && data.target === 'ProcessEventEmitter') {
                Object.keys(cluster.workers).forEach((id) => {
                    cluster.workers[id].send(data);
                });
            }
        }
    });
}