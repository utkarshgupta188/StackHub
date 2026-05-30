import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.feed);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pluginId, title, description, type } = body;

    const db = readDb();
    db.feed.unshift({
      id: `f-${Date.now()}`,
      pluginId,
      title,
      description,
      timestamp: 'Just now',
      type: type || 'info',
    });

    writeDb(db);
    return NextResponse.json({ success: true, feed: db.feed });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to write feed alert log' }, { status: 500 });
  }
}

export async function DELETE() {
  const db = readDb();
  db.feed = [];
  writeDb(db);
  return NextResponse.json({ success: true });
}
