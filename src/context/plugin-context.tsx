'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plugin, FeedItem, WidgetDefinition, CommandDefinition } from '@/types';

interface PluginContextType {
  plugins: Plugin[];
  feed: FeedItem[];
  enabledWidgets: (WidgetDefinition & { pluginId: string })[];
  allCommands: CommandDefinition[];
  activePage: string;
  setActivePage: (page: string) => void;
  togglePlugin: (pluginId: string) => void;
  updatePluginSetting: (pluginId: string, key: string, value: any) => void;
  addFeedNotification: (notification: Omit<FeedItem, 'id' | 'timestamp'>) => void;
  clearFeed: () => void;
  runCommandAction: (commandId: string, context: any) => Promise<string | void>;
  refreshAllData: () => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [activePage, setActivePage] = useState<string>('/dashboard');

  const refreshAllData = async () => {
    try {
      const [pluginsRes, feedRes] = await Promise.all([
        fetch('/api/plugins'),
        fetch('/api/feed')
      ]);
      if (pluginsRes.ok) {
        const data = await pluginsRes.json();
        setPlugins(data);
      }
      if (feedRes.ok) {
        const data = await feedRes.json();
        setFeed(data);
      }
    } catch (e) {
      console.error('Failed to sync with StackHub REST API backend', e);
    }
  };

  useEffect(() => {
    refreshAllData();
    // Keep feed log updated every 10 seconds
    const interval = setInterval(refreshAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const togglePlugin = async (pluginId: string) => {
    try {
      const res = await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', pluginId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlugins(data.plugins);
        // Refresh feed logs instantly
        const feedRes = await fetch('/api/feed');
        if (feedRes.ok) setFeed(await feedRes.json());
      }
    } catch (e) {
      console.error('Failed to toggle plugin status via backend API', e);
    }
  };

  const updatePluginSetting = async (pluginId: string, key: string, value: any) => {
    // Instantly update state locally for smooth UX feedback
    setPlugins(prev =>
      prev.map(p => {
        if (p.id !== pluginId) return p;
        return {
          ...p,
          settings: { ...p.settings, [key]: { ...p.settings[key], value } }
        };
      })
    );

    try {
      await fetch('/api/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSetting', pluginId, key, value }),
      });
    } catch (e) {
      console.error('Failed to update config key via backend API', e);
    }
  };

  const addFeedNotification = async (notification: Omit<FeedItem, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      if (res.ok) {
        const data = await res.json();
        setFeed(data.feed);
      }
    } catch (e) {
      console.error('Failed to write backend notification', e);
    }
  };

  const clearFeed = async () => {
    try {
      const res = await fetch('/api/feed', { method: 'DELETE' });
      if (res.ok) {
        setFeed([]);
      }
    } catch (e) {
      console.error('Failed to clean backend notifications', e);
    }
  };

  // Compile active widgets dynamically
  const enabledWidgets = plugins
    .filter(p => p.enabled)
    .flatMap(p => p.widgets.map(w => ({ ...w, pluginId: p.id })));

  // Setup commands mapping on current schema
  const getCommandAction = (cmdId: string) => {
    // Actions are execution hooks. We dynamically link client triggers or api runs.
    if (cmdId === 'github-sync') {
      return async (ctx: any) => {
        await addFeedNotification({
          pluginId: 'github',
          title: 'GitHub repositories synchronized',
          description: 'Fetched 4 repositories and 3 open pull requests.',
          type: 'success',
        });
        return 'GitHub repositories synced successfully!';
      };
    }
    if (cmdId === 'aws-ec2-start') {
      return async (ctx: any) => {
        await addFeedNotification({
          pluginId: 'aws',
          title: 'EC2 Instances Booting',
          description: 'i-09ef912ad21c9b & i-0aa4f8b91a27e0 status updating to booting.',
          type: 'info',
        });
        return 'AWS: Started 2 instances!';
      };
    }
    if (cmdId === 'docker-prune') {
      return async (ctx: any) => {
        await addFeedNotification({
          pluginId: 'docker',
          title: 'Docker System Prune completed',
          description: 'Reclaimed 4.82 GB of local disk storage space.',
          type: 'success',
        });
        return 'Docker: System pruned successfully! Reclaimed 4.82 GB.';
      };
    }
    // fallbacks
    return async (ctx: any) => {
      ctx.setActivePage('/dashboard');
    };
  };

  const allCommands = plugins
    .filter(p => p.enabled)
    .flatMap(p =>
      p.commands.map(cmd => ({
        ...cmd,
        action: getCommandAction(cmd.id),
      }))
    );

  const runCommandAction = async (commandId: string, context: any): Promise<string | void> => {
    const cmd = allCommands.find(c => c.id === commandId);
    if (cmd) {
      return await cmd.action(context);
    }
    throw new Error('Command not found or disabled');
  };

  return (
    <PluginContext.Provider
      value={{
        plugins,
        feed,
        enabledWidgets,
        allCommands,
        activePage,
        setActivePage,
        togglePlugin,
        updatePluginSetting,
        addFeedNotification,
        clearFeed,
        runCommandAction,
        refreshAllData,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
}

export function usePlugins() {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
}
