import { NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand, StartInstancesCommand, StopInstancesCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { readDb, writeDb } from '@/lib/db';

const AWS_REGIONS = [
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'instances';

    const db = readDb();
    const awsPlugin = db.plugins.find(p => p.id === 'aws');
    const accessKey = awsPlugin?.settings.accessKeyId.value;
    const secretKey = awsPlugin?.settings.secretAccessKey.value;
    const defaultRegion = awsPlugin?.settings.defaultRegion.value || 'us-east-1';

    // Verify configuration
    if (!accessKey || accessKey === 'AKIAIOSFODNN7EXAMPLE' || accessKey.trim() === '') {
      return NextResponse.json({ error: 'AWS Access Key ID not configured.' }, { status: 400 });
    }
    if (!secretKey || secretKey === 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' || secretKey.trim() === '') {
      return NextResponse.json({ error: 'AWS Secret Access Key not configured.' }, { status: 400 });
    }

    const credentials = {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    };

    if (type === 'instances') {
      try {
        // Query ALL AWS Regions in parallel with an aggressive timeout to prevent hangs!
        const promises = AWS_REGIONS.map(async (region) => {
          const fetchPromise = (async () => {
            try {
              const client = new EC2Client({ region, credentials });
              const command = new DescribeInstancesCommand({});
              const response = await client.send(command);
              
              const list = response.Reservations?.flatMap(r => r.Instances || []) || [];
              return list.map(ins => {
                const nameTag = ins.Tags?.find(t => t.Key === 'Name');
                return {
                  id: ins.InstanceId || 'unknown-id',
                  name: nameTag?.Value || 'unnamed-instance',
                  type: ins.InstanceType || 'unknown',
                  status: ins.State?.Name || 'unknown',
                  ip: ins.PublicIpAddress || '-',
                  region: region,
                };
              });
            } catch (err) {
              return [];
            }
          })();

          // Strict 1.5s timeout: if a region is disabled or hangs, skip it instantly!
          const timeoutPromise = new Promise<any[]>((resolve) => 
            setTimeout(() => resolve([]), 1500)
          );

          return Promise.race([fetchPromise, timeoutPromise]);
        });

        const results = await Promise.allSettled(promises);
        const allInstances = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

        return NextResponse.json({ instances: allInstances });
      } catch (e: any) {
        return NextResponse.json({ error: `AWS EC2 connection failed: ${e.message}` }, { status: 400 });
      }
    }

    if (type === 'buckets') {
      try {
        const client = new S3Client({ region: defaultRegion, credentials });
        const command = new ListBucketsCommand({});
        
        const fetchPromise = (async () => {
          const response = await client.send(command);
          return (response.Buckets || []).map(b => ({
            name: b.Name || 'unknown-bucket',
            region: defaultRegion,
            size: 'Calculating...',
            files: 0,
          }));
        })();

        // S3 2.0s timeout
        const timeoutPromise = new Promise<any[]>((resolve) => 
          setTimeout(() => resolve([]), 2000)
        );

        const buckets = await Promise.race([fetchPromise, timeoutPromise]);
        return NextResponse.json({ buckets });
      } catch (e: any) {
        return NextResponse.json({ error: `AWS S3 connection failed: ${e.message}` }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to communicate with AWS.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, action, region } = await req.json();
    const db = readDb();
    
    const awsPlugin = db.plugins.find(p => p.id === 'aws');
    const accessKey = awsPlugin?.settings.accessKeyId.value;
    const secretKey = awsPlugin?.settings.secretAccessKey.value;
    const targetRegion = region || awsPlugin?.settings.defaultRegion.value || 'us-east-1';

    if (!accessKey || accessKey === 'AKIAIOSFODNN7EXAMPLE' || !secretKey) {
      return NextResponse.json({ error: 'AWS Credentials not configured.' }, { status: 400 });
    }

    const credentials = {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    };
    
    // Connect to the specific region the instance belongs to
    const client = new EC2Client({ region: targetRegion, credentials });

    if (action === 'start') {
      const command = new StartInstancesCommand({ InstanceIds: [id] });
      await client.send(command);
    } else if (action === 'stop') {
      const command = new StopInstancesCommand({ InstanceIds: [id] });
      await client.send(command);
    }

    db.feed.unshift({
      id: `f-${Date.now()}`,
      pluginId: 'aws',
      title: `AWS: EC2 Power State`,
      description: `Sent signal ${action} to machine ${id} (${targetRegion}) successfully using AWS JavaScript SDK.`,
      timestamp: 'Just now',
      type: action === 'stop' ? 'warning' : 'success',
    });
    writeDb(db);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to run EC2 power operations.' }, { status: 500 });
  }
}
