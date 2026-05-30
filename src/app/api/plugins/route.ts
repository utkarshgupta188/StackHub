import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.plugins);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, pluginId, key, value } = body;

    const db = readDb();

    if (action === 'toggle') {
      db.plugins = db.plugins.map(p =>
        p.id === pluginId ? { ...p, enabled: !p.enabled } : p
      );
      
      const target = db.plugins.find(p => p.id === pluginId);
      db.feed.unshift({
        id: `f-${Date.now()}`,
        pluginId,
        title: `${target?.name} ${target?.enabled ? 'Enabled' : 'Disabled'}`,
        description: `Successfully modified workspace active components via system API.`,
        timestamp: 'Just now',
        type: target?.enabled ? 'success' : 'info',
      });
    } else if (action === 'updateSetting') {
      db.plugins = db.plugins.map(p => {
        if (p.id !== pluginId) return p;
        return {
          ...p,
          settings: {
            ...p.settings,
            [key]: {
              ...p.settings[key],
              value,
            },
          },
        };
      });
    }

    writeDb(db);
    return NextResponse.json({ success: true, plugins: db.plugins });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process plugin update request' }, { status: 500 });
  }
}
