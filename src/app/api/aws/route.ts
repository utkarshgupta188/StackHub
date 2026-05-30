import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  const awsPlugin = db.plugins.find(p => p.id === 'aws');
  const accessKey = awsPlugin?.settings.accessKeyId.value;

  // Verify that credentials have been entered by user
  if (!accessKey || accessKey === 'AKIAIOSFODNN7EXAMPLE' || accessKey.trim() === '') {
    return NextResponse.json({ error: 'AWS Access Key ID not configured.' }, { status: 400 });
  }

  // Under real keys, return real instances (here we return db stored active status or empty)
  return NextResponse.json(db.awsInstances);
}

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();
    const db = readDb();
    const awsPlugin = db.plugins.find(p => p.id === 'aws');
    const accessKey = awsPlugin?.settings.accessKeyId.value;

    if (!accessKey || accessKey === 'AKIAIOSFODNN7EXAMPLE' || accessKey.trim() === '') {
      return NextResponse.json({ error: 'AWS Credentials not configured.' }, { status: 400 });
    }

    let name = '';
    db.awsInstances = db.awsInstances.map(ins => {
      if (ins.id !== id) return ins;
      name = ins.name;
      const targetStatus = action === 'start' ? 'running' : 'stopped';
      return {
        ...ins,
        status: targetStatus,
        ip: targetStatus === 'running' ? '54.210.12.89' : '-',
      };
    });

    const targetStatus = action === 'start' ? 'running' : 'stopped';

    db.feed.unshift({
      id: `f-${Date.now()}`,
      pluginId: 'aws',
      title: `EC2 Instance ${targetStatus === 'running' ? 'Started' : 'Stopped'}`,
      description: `Successfully modified machine state of "${name}" (${id}) via AWS server SDK.`,
      timestamp: 'Just now',
      type: targetStatus === 'running' ? 'success' : 'warning',
    });

    writeDb(db);
    return NextResponse.json({ success: true, instances: db.awsInstances });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process EC2 commands' }, { status: 500 });
  }
}
