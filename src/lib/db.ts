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
  feed: [], // Starts completely empty. Only real logs allowed!
  awsInstances: [],
  dockerContainers: []
};

export function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(data);
    
    // Clear out any stale mock feed logs if they survived from previous versions
    if (db.feed && db.feed.some((f: any) => ['f-1', 'f-2', 'f-3'].includes(f.id))) {
      db.feed = [];
    }

    // Force upgrade AWS plugin region choices in existing db records
    const awsPlugin = db.plugins?.find((p: any) => p.id === 'aws');
    if (awsPlugin && awsPlugin.settings?.defaultRegion) {
      awsPlugin.settings.defaultRegion.choices = [
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
        'ca-central-1',
        'eu-west-1',
        'eu-west-2',
        'eu-west-3',
        'eu-central-1',
        'eu-north-1',
        'eu-south-1',
        'ap-east-1',
        'ap-south-1',
        'ap-northeast-1',
        'ap-northeast-2',
        'ap-northeast-3',
        'ap-southeast-1',
        'ap-southeast-2',
        'ap-southeast-3',
        'sa-east-1',
        'me-south-1',
        'af-south-1',
      ];
    }

    // Force backfill newly added plugins (Cloudflare, Vercel)
    if (db.plugins) {
      ALL_DEFAULT_PLUGINS.forEach(defaultP => {
        if (!db.plugins.some((p: any) => p.id === defaultP.id)) {
          db.plugins.push(defaultP);
        }
      });
    }
    
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
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
