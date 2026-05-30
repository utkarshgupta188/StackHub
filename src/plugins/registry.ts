import { Plugin } from '@/types';
import { githubPlugin } from './github';
import { awsPlugin } from './aws';
import { dockerPlugin } from './docker';
import { cloudflarePlugin } from './cloudflare';
import { vercelPlugin } from './vercel';

export const ALL_DEFAULT_PLUGINS: Plugin[] = [
  githubPlugin,
  awsPlugin,
  dockerPlugin,
  cloudflarePlugin,
  vercelPlugin,
];

export function getPluginById(id: string): Plugin | undefined {
  return ALL_DEFAULT_PLUGINS.find(p => p.id === id);
}
