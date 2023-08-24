import cluster from 'cluster';
if (cluster.isMaster || cluster.isPrimary) {
    cluster.on('message', (worker: any, data: any) => {
        Object.keys(cluster.workers).forEach((id) => {
            cluster.workers[id].send(data);
         });
    });
}