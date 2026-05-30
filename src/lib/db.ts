import fs from 'fs';
import path from 'path';
import { Plugin, FeedItem, User } from '@/types';
import { ALL_DEFAULT_PLUGINS } from '@/plugins/registry';

// JSON database file in the workspace to act as our live DB backend
const DB_FILE = path.join(process.cwd(), 'stackhub_db.json');

interface DatabaseSchema {
  user: User | null;
  plugins: Plugin[];
  feed: FeedItem[];
  awsInstances: any[];
  dockerContainers: any[];
}

const INITIAL_DB: DatabaseSchema = {
  user: {
    email: 'dev@stackhub.sh',
    name: 'Lead Developer',
    role: 'Full Stack Engineer',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dev',
  },
  plugins: ALL_DEFAULT_PLUGINS,
  feed: [
    { id: 'f-1', pluginId: 'github', title: 'New PR opened: feat: docker console logs', description: 'pr #114 created in repo stackhub-core', timestamp: '5m ago', type: 'info' },
    { id: 'f-2', pluginId: 'aws', title: 'EC2 production-web-server-01 CPU alert', description: 'CPU utilization reached 89.2% on inst i-03fa2cd91e843a', timestamp: '12m ago', type: 'warning' },
    { id: 'f-3', pluginId: 'docker', title: 'Container stackhub-postgresql-db booted', description: 'Port 5432 successfully bound', timestamp: '20m ago', type: 'success' },
  ],
  awsInstances: [
    { id: 'i-03fa2cd91e843a', name: 'production-web-server-01', type: 't3.medium', status: 'running', ip: '54.210.12.89', region: 'us-east-1' },
    { id: 'i-08cb92fa942c11', name: 'staging-api-server-01', type: 't3.small', status: 'running', ip: '34.200.45.101', region: 'us-east-1' },
    { id: 'i-09ef912ad21c9b', name: 'analytics-worker-spot', type: 'c6g.large', status: 'stopped', ip: '-', region: 'us-west-2' },
    { id: 'i-0aa4f8b91a27e0', name: 'test-sandbox-env', type: 't2.nano', status: 'stopped', ip: '-', region: 'us-west-2' },
  ],
  dockerContainers: [
    { id: 'c-8af21d9b', name: 'stackhub-postgresql-db', image: 'postgres:16-alpine', status: 'running', ports: '5432:5432', cpu: '1.2%', memory: '42 MB', logs: [
      '2026-05-30 19:10:02 UTC [1] LOG:  starting PostgreSQL 16.2 on x86_64-pc-linux-musl, compiled by gcc',
      '2026-05-30 19:10:02 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432',
      '2026-05-30 19:10:02 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"',
      '2026-05-30 19:10:03 UTC [22] LOG:  database system was shut down at 2026-05-30 19:08:44 UTC',
      '2026-05-30 19:10:03 UTC [1] LOG:  database system is ready to accept connections',
    ]},
    { id: 'c-d9c28bf1', name: 'stackhub-redis-cache', image: 'redis:7.2-alpine', status: 'running', ports: '6379:6379', cpu: '0.4%', memory: '18 MB', logs: [
      '1:C 30 May 2026 19:10:02.100 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo',
      '1:C 30 May 2026 19:10:02.101 # Redis version=7.2.4, pid=1, just started',
      '1:M 30 May 2026 19:10:02.103 * Running mode=standalone, port=6379.',
      '1:M 30 May 2026 19:10:02.103 # Server initialized',
    ]},
    { id: 'c-f4b23d9b', name: 'stackhub-fastapi-backend', image: 'stackhub/backend:latest', status: 'running', ports: '8000:8000', cpu: '2.4%', memory: '112 MB', logs: [
      'INFO:     Started server process [1]',
      'INFO:     Waiting for application startup.',
      'INFO:     Application startup complete.',
      'INFO:     Uvicorn running on http://0.0.0.0:8000',
    ]},
  ]
};

export function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read db file, resetting', e);
    return INITIAL_DB;
  }
}

export function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write db file', e);
  }
}
