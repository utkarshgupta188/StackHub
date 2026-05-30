import { Plugin } from '@/types';
import { githubPlugin } from './github';
import { awsPlugin } from './aws';
import { dockerPlugin } from './docker';

export const ALL_DEFAULT_PLUGINS: Plugin[] = [
  githubPlugin,
  awsPlugin,
  dockerPlugin,
];

export function getPluginById(id: string): Plugin | undefined {
  return ALL_DEFAULT_PLUGINS.find(p => p.id === id);
}
