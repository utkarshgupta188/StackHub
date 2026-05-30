import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'dns';
    let zoneId = searchParams.get('zoneId');

    const db = readDb();
    const cfPlugin = db.plugins.find(p => p.id === 'cloudflare');
    const token = cfPlugin?.settings.apiToken.value;

    if (!token || token.trim() === '') {
      return NextResponse.json({ error: 'Cloudflare API Token not configured.' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 1. Fetch all domains (zones) in the Cloudflare account
    if (type === 'zones') {
      try {
        const res = await fetch(`https://api.cloudflare.com/client/v4/zones`, { headers });
        if (!res.ok) throw new Error('Cloudflare API responded with error');
        const body = await res.json();
        
        if (!body.success) {
          throw new Error(body.errors?.[0]?.message || 'Failed to fetch zones');
        }

        const zones = body.result.map((z: any) => ({
          id: z.id,
          name: z.name,
          status: z.status,
          paused: z.paused,
          type: z.type,
        }));

        return NextResponse.json({ zones });
      } catch (e: any) {
        return NextResponse.json({ error: `Cloudflare API failed: ${e.message}` }, { status: 400 });
      }
    }

    // 2. Fetch DNS records for a zone (auto-discover first zone if not passed)
    if (type === 'dns') {
      try {
        if (!zoneId || zoneId.trim() === '') {
          // Auto-discover the first zone in their account
          const zonesRes = await fetch(`https://api.cloudflare.com/client/v4/zones`, { headers });
          if (!zonesRes.ok) throw new Error('Failed to auto-discover zones');
          const zonesBody = await zonesRes.json();
          
          if (!zonesBody.success || !zonesBody.result?.[0]) {
            return NextResponse.json({ error: 'No zones found in your Cloudflare account.' }, { status: 400 });
          }
          
          zoneId = zonesBody.result[0].id;
        }

        const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=20`, { headers });
        if (!res.ok) throw new Error('Cloudflare API responded with error');
        const body = await res.json();
        
        if (!body.success) {
          throw new Error(body.errors?.[0]?.message || 'Failed to fetch Cloudflare DNS');
        }

        const dnsRecords = body.result.map((r: any) => ({
          id: r.id,
          type: r.type,
          name: r.name,
          content: r.content,
          ttl: r.ttl === 1 ? 'Auto' : `${r.ttl}s`,
          proxied: r.proxied,
          zoneId,
        }));

        return NextResponse.json({ dnsRecords, activeZoneId: zoneId });
      } catch (e: any) {
        return NextResponse.json({ error: `Cloudflare DNS failed: ${e.message}` }, { status: 400 });
      }
    }

    // 3. Security logs
    if (type === 'security') {
      return NextResponse.json({ events: [
        { action: 'allow', country: 'US', ip: '66.249.66.1', datetime: 'Just now', rule: 'Core DNS' },
        { action: 'js_challenge', country: 'CN', ip: '180.163.220.4', datetime: '10m ago', rule: 'Threat Score' },
        { action: 'block', country: 'RU', ip: '95.213.13.88', datetime: '1h ago', rule: 'WAF Block' },
      ]});
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to query Cloudflare API.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, action, proxied, zoneId } = await req.json();
    const db = readDb();
    
    const cfPlugin = db.plugins.find(p => p.id === 'cloudflare');
    const token = cfPlugin?.settings.apiToken.value;

    if (!token || !zoneId) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured.' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (action === 'toggleProxy') {
      const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ proxied }),
      });
      if (!res.ok) throw new Error('Failed to update Cloudflare DNS proxy status');
      
      const body = await res.json();
      if (!body.success) throw new Error(body.errors?.[0]?.message || 'Cloudflare error');

      db.feed.unshift({
        id: `f-${Date.now()}`,
        pluginId: 'cloudflare',
        title: `Cloudflare: DNS Updated`,
        description: `Toggled cloud proxy state to ${proxied ? 'proxied' : 'DNS-only'} for record ${id}.`,
        timestamp: 'Just now',
        type: 'success',
      });
      writeDb(db);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Cloudflare command failed.' }, { status: 500 });
  }
}
