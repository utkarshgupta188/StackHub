import { Plugin } from '@/types';

export const mockDockerContainers = [
  { id: 'c-8af21d9b', name: 'stackhub-postgresql-db', image: 'postgres:16-alpine', status: 'running', ports: '5432:5432', cpu: '1.2%', memory: '42 MB', logs: [
    '2026-05-30 19:10:02 UTC [1] LOG:  starting PostgreSQL 16.2 on x86_64-pc-linux-musl, compiled by gcc',
    '2026-05-30 19:10:02 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432',
    '2026-05-30 19:10:02 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"',
    '2026-05-30 19:10:03 UTC [22] LOG:  database system was shut down at 2026-05-30 19:08:44 UTC',
    '2026-05-30 19:10:03 UTC [1] LOG:  database system is ready to accept connections',
    '2026-05-30 19:11:15 UTC [48] LOG:  connection received: host=172.17.0.4 port=49882',
    '2026-05-30 19:11:15 UTC [48] LOG:  connection authorized: user=stackhub database=stackhub_prod',
    '2026-05-30 19:12:45 UTC [48] LOG:  temporary file: path="base/pgsql_tmp/pgsql_tmp48.0", size=489203 bytes',
    '2026-05-30 19:14:00 UTC [1] LOG:  received SIGHUP, reloading configuration files',
    '2026-05-30 19:14:00 UTC [1] LOG:  parameter "max_connections" changed to 200',
  ]},
  { id: 'c-d9c28bf1', name: 'stackhub-redis-cache', image: 'redis:7.2-alpine', status: 'running', ports: '6379:6379', cpu: '0.4%', memory: '18 MB', logs: [
    '1:C 30 May 2026 19:10:02.100 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo',
    '1:C 30 May 2026 19:10:02.101 # Redis version=7.2.4, bits=64, commit=00000000, modified=0, pid=1, just started',
    '1:M 30 May 2026 19:10:02.103 * Running mode=standalone, port=6379.',
    '1:M 30 May 2026 19:10:02.103 # Server initialized',
    '1:M 30 May 2026 19:10:02.104 * Loading RDB produced by version 7.2.4',
    '1:M 30 May 2026 19:10:02.104 * RDB age 129 seconds',
    '1:M 30 May 2026 19:10:02.104 * RDB memory usage when created 1.10 Mb',
    '1:M 30 May 2026 19:10:02.108 * DB loaded from disk: 0.004 seconds',
    '1:M 30 May 2026 19:10:02.108 * Ready to accept connections tcp',
    '1:M 30 May 2026 19:11:15.542 * 10000 changes in 60 seconds. Saving...',
    '1:M 30 May 2026 19:11:15.556 * Background saving started by pid 14',
    '1:M 30 May 2026 19:11:15.620 * DB saved on disk',
    '1:M 30 May 2026 19:11:15.623 * Background saving terminated with success',
  ]},
  { id: 'c-f4b23d9b', name: 'stackhub-fastapi-backend', image: 'stackhub/backend:latest', status: 'running', ports: '8000:8000', cpu: '2.4%', memory: '112 MB', logs: [
    'INFO:     Started server process [1]',
    'INFO:     Waiting for application startup.',
    'INFO:     Application startup complete.',
    'INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)',
    'INFO:     172.17.0.1:52112 - "GET /healthz HTTP/1.1" 200 OK',
    'INFO:     172.17.0.1:52118 - "GET /api/v1/plugins HTTP/1.1" 200 OK',
    'INFO:     172.17.0.1:52125 - "POST /api/v1/auth/session HTTP/1.1" 200 OK',
    'INFO:     172.17.0.1:52132 - "GET /api/v1/aws/costs HTTP/1.1" 200 OK',
  ]},
  { id: 'c-91e84a2c', name: 'local-mailhog-test', image: 'mailhog/mailhog:latest', status: 'paused', ports: '1025:1025, 8025:8025', cpu: '0.0%', memory: '8 MB', logs: [
    '2026/05/30 19:10:02 Using in-memory storage',
    '2026/05/30 19:10:02 [SMTP] Binding to address: 0.0.0.0:1025',
    '2026/05/30 19:10:02 [HTTP] Binding to address: 0.0.0.0:8025',
    'Creating API v1 with BasePath /api/v1',
    'Creating API v2 with BasePath /api/v2',
  ]},
];

export const mockDockerImages = [
  { id: 'sha256:d8c91a', repository: 'postgres', tag: '16-alpine', size: '243 MB', created: '3 days ago' },
  { id: 'sha256:f51b2c', repository: 'redis', tag: '7.2-alpine', size: '34 MB', created: '1 week ago' },
  { id: 'sha256:a1b2c3', repository: 'stackhub/backend', tag: 'latest', size: '482 MB', created: '2 hours ago' },
  { id: 'sha256:2f8b4c', repository: 'node', tag: '20-alpine', size: '135 MB', created: '2 weeks ago' },
];

export const dockerPlugin: Plugin = {
  id: 'docker',
  name: 'Docker Desktop',
  description: 'Inspect image structures, monitor dynamic active processes, stream logs, and cycle container lifecycles.',
  icon: 'Terminal',
  enabled: true,
  settings: {
    socketUrl: {
      label: 'Docker Daemon Socket',
      type: 'text',
      value: 'npipe:////./pipe/docker_engine',
      placeholder: 'e.g. unix:///var/run/docker.sock',
    },
    pruneOnExit: {
      label: 'Prune Unused Networks on Exit',
      type: 'boolean',
      value: false,
    },
    bufferLines: {
      label: 'Console Logs Buffer Limits',
      type: 'select',
      value: '100',
      choices: ['50', '100', '500', '1000'],
    },
  },
  widgets: [
    { id: 'docker-containers', title: 'Running Containers', size: 'lg', component: 'DockerContainers' },
    { id: 'docker-images', title: 'Docker Host Images', size: 'sm', component: 'DockerImages' },
  ],
  commands: [
    {
      id: 'docker-prune',
      name: 'Docker: Prune system cache & volumes',
      description: 'Cleans out all unused builder caches, dangling images, and closed networks.',
      category: 'Docker',
      action: (ctx) => {
        ctx.addFeedNotification({
          pluginId: 'docker',
          title: 'Docker System Prune completed',
          description: 'Reclaimed 4.82 GB of local disk storage space.',
          type: 'success',
        });
        return 'Docker: System pruned successfully! Reclaimed 4.82 GB.';
      },
    },
    {
      id: 'docker-restart-all',
      name: 'Docker: Restart all running containers',
      description: 'Performs a rolling reboot on all running docker container processes.',
      category: 'Docker',
      action: (ctx) => {
        ctx.addFeedNotification({
          pluginId: 'docker',
          title: 'Docker rolling restart triggered',
          description: 'Gracefully rebooting 3 containers.',
          type: 'info',
        });
        return 'Docker: Restarting container pool...';
      },
    },
  ],
};
