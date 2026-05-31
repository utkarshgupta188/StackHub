import { NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand, StartInstancesCommand, StopInstancesCommand, DescribeSecurityGroupsCommand, DescribeVpcsCommand, DescribeSubnetsCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import { LambdaClient, ListFunctionsCommand, InvokeCommand } from '@aws-sdk/client-lambda';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { IAMClient, ListUsersCommand, GetAccountSummaryCommand } from '@aws-sdk/client-iam';
import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import { readDb, writeDb, resolveSecret } from '@/lib/db';

const AWS_REGIONS = [
  'us-east-1','us-east-2','us-west-1','us-west-2','ca-central-1',
  'eu-west-1','eu-west-2','eu-west-3','eu-central-1','eu-north-1',
  'ap-south-1','ap-northeast-1','ap-northeast-2','ap-southeast-1','ap-southeast-2',
  'sa-east-1',
];

function race<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(r => setTimeout(() => r(fallback), ms)),
  ]);
}

function monthLabel(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function mapCostService(service: string) {
  const normalized = service.toLowerCase();
  if (normalized.includes('elastic compute cloud') || normalized.includes('ec2')) return 'EC2';
  if (normalized.includes('simple storage service') || normalized === 's3') return 'S3';
  if (normalized.includes('relational database service') || normalized.includes('rds')) return 'RDS';
  if (normalized.includes('lambda')) return 'Lambda';
  return 'Other';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'instances';

    const db = readDb();
    const awsPlugin = db.plugins.find(p => p.id === 'aws');
    const accessKey = resolveSecret(awsPlugin?.settings.accessKeyId.value || '');
    const secretKey = resolveSecret(awsPlugin?.settings.secretAccessKey.value || '');
    const defaultRegion = awsPlugin?.settings.defaultRegion.value || 'us-east-1';

    if (!accessKey || accessKey === 'AKIAIOSFODNN7EXAMPLE' || accessKey.trim() === '') {
      return NextResponse.json({ error: 'AWS Access Key ID not configured.' }, { status: 400 });
    }
    if (!secretKey || secretKey === 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' || secretKey.trim() === '') {
      return NextResponse.json({ error: 'AWS Secret Access Key not configured.' }, { status: 400 });
    }

    const credentials = { accessKeyId: accessKey, secretAccessKey: secretKey };

    // ── EC2 INSTANCES (all regions) ────────────────────────────────
    if (type === 'instances') {
      const promises = AWS_REGIONS.map(async (region) => {
        return race(
          (async () => {
            try {
              const client = new EC2Client({ region, credentials });
              const response = await client.send(new DescribeInstancesCommand({}));
              const list = response.Reservations?.flatMap(r => r.Instances || []) || [];
              return list.map(ins => ({
                id: ins.InstanceId || 'unknown',
                name: ins.Tags?.find(t => t.Key === 'Name')?.Value || 'Unnamed',
                type: ins.InstanceType || 'unknown',
                status: ins.State?.Name || 'unknown',
                ip: ins.PublicIpAddress || '-',
                privateIp: ins.PrivateIpAddress || '-',
                region,
                launchTime: ins.LaunchTime ? new Date(ins.LaunchTime).toISOString() : '',
                keyName: ins.KeyName || '-',
                vpcId: ins.VpcId || '-',
                subnetId: ins.SubnetId || '-',
                architecture: ins.Architecture || '-',
                platform: ins.Platform || 'linux',
                imageId: ins.ImageId || '-',
                securityGroups: ins.SecurityGroups?.map((sg: any) => sg.GroupName) || [],
              }));
            } catch { return []; }
          })(),
          2000, []
        );
      });

      const results = await Promise.allSettled(promises);
      const allInstances = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
      return NextResponse.json({ instances: allInstances });
    }

    // ── S3 BUCKETS ─────────────────────────────────────────────────
    if (type === 'buckets') {
      const client = new S3Client({ region: defaultRegion, credentials });
      const buckets = await race(
        (async () => {
          const response = await client.send(new ListBucketsCommand({}));
          const bucketList = response.Buckets || [];
          const withRegions = await Promise.all(
            bucketList.map(async (b: any) => {
              let region = defaultRegion;
              try {
                const loc = await client.send(new GetBucketLocationCommand({ Bucket: b.Name }));
                region = loc.LocationConstraint || 'us-east-1';
              } catch {}
              return {
                name: b.Name || 'unknown',
                region,
                creationDate: b.CreationDate ? new Date(b.CreationDate).toISOString() : '',
              };
            })
          );
          return withRegions;
        })(),
        5000, []
      );
      return NextResponse.json({ buckets });
    }

    // ── COST EXPLORER ─────────────────────────────────────────────
    if (type === 'costs') {
      const client = new CostExplorerClient({ region: 'us-east-1', credentials });
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 5, 1);
      const startDate = start.toISOString().slice(0, 10);
      const endDate = end.toISOString().slice(0, 10);

      const result = await race(
        client.send(new GetCostAndUsageCommand({
          TimePeriod: { Start: startDate, End: endDate },
          Granularity: 'MONTHLY',
          Metrics: ['UnblendedCost'],
          GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
        })),
        6000,
        { ResultsByTime: [] } as any
      );

      const costs = (result.ResultsByTime || []).map((period: any) => {
        const row: Record<string, any> = {
          month: monthLabel(period.TimePeriod?.Start || startDate),
          EC2: 0,
          S3: 0,
          RDS: 0,
          Lambda: 0,
          Other: 0,
          Total: 0,
        };

        period.Groups?.forEach((group: any) => {
          const service = mapCostService(group.Keys?.[0] || 'Other');
          const value = parseFloat(group.Metrics?.UnblendedCost?.Amount || '0');
          row[service] = (row[service] || 0) + value;
          row.Total += value;
        });

        Object.keys(row).forEach(key => {
          if (typeof row[key] === 'number') {
            row[key] = Number(row[key].toFixed(2));
          }
        });

        return row;
      });

      return NextResponse.json({ costs, currency: result.ResultsByTime?.[0]?.Total?.UnblendedCost?.Unit || 'USD' });
    }

    // ── LAMBDA FUNCTIONS ───────────────────────────────────────────
    if (type === 'lambda') {
      const promises = AWS_REGIONS.slice(0, 8).map(async (region) => {
        return race(
          (async () => {
            try {
              const client = new LambdaClient({ region, credentials });
              const response = await client.send(new ListFunctionsCommand({ MaxItems: 50 }));
              return (response.Functions || []).map(f => ({
                name: f.FunctionName || 'unknown',
                runtime: f.Runtime || '-',
                region,
                memory: f.MemorySize || 0,
                timeout: f.Timeout || 0,
                codeSize: f.CodeSize || 0,
                lastModified: f.LastModified || '',
                description: f.Description || '',
                handler: f.Handler || '-',
                arn: f.FunctionArn || '',
                state: f.State || 'Active',
                layers: f.Layers?.length || 0,
              }));
            } catch { return []; }
          })(),
          2000, []
        );
      });
      const results = await Promise.allSettled(promises);
      const functions = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
      return NextResponse.json({ functions });
    }

    // ── SECURITY GROUPS ────────────────────────────────────────────
    if (type === 'security-groups') {
      const client = new EC2Client({ region: defaultRegion, credentials });
      const sgs = await race(
        (async () => {
          const response = await client.send(new DescribeSecurityGroupsCommand({}));
          return (response.SecurityGroups || []).map(sg => ({
            id: sg.GroupId || '',
            name: sg.GroupName || '',
            description: sg.Description || '',
            vpcId: sg.VpcId || '',
            inboundRules: sg.IpPermissions?.length || 0,
            outboundRules: sg.IpPermissionsEgress?.length || 0,
            tags: sg.Tags?.find(t => t.Key === 'Name')?.Value || '',
          }));
        })(),
        3000, []
      );
      return NextResponse.json({ securityGroups: sgs });
    }

    // ── VPCS ───────────────────────────────────────────────────────
    if (type === 'vpcs') {
      const client = new EC2Client({ region: defaultRegion, credentials });
      const vpcs = await race(
        (async () => {
          const response = await client.send(new DescribeVpcsCommand({}));
          return (response.Vpcs || []).map(v => ({
            id: v.VpcId || '',
            cidr: v.CidrBlock || '',
            isDefault: v.IsDefault || false,
            state: v.State || '',
            tenancy: v.InstanceTenancy || 'default',
            name: v.Tags?.find(t => t.Key === 'Name')?.Value || 'default',
          }));
        })(),
        3000, []
      );
      return NextResponse.json({ vpcs });
    }

    // ── IAM SUMMARY ────────────────────────────────────────────────
    if (type === 'iam') {
      const client = new IAMClient({ region: 'us-east-1', credentials });
      const [summary, users] = await Promise.all([
        race(
          client.send(new GetAccountSummaryCommand({})).then(r => r.SummaryMap || {}),
          4000, {}
        ),
        race(
          client.send(new ListUsersCommand({ MaxItems: 20 })).then(r =>
            (r.Users || []).map((u: any) => ({
              username: u.UserName,
              userId: u.UserId,
              createdAt: u.CreateDate ? new Date(u.CreateDate).toISOString() : '',
              arn: u.Arn,
              passwordLastUsed: u.PasswordLastUsed ? new Date(u.PasswordLastUsed).toISOString() : 'Never',
            }))
          ),
          4000, []
        ),
      ]);
      return NextResponse.json({ summary, users });
    }

    // ── CLOUDWATCH (CPU for first N instances) ─────────────────────
    if (type === 'cloudwatch') {
      const instanceId = searchParams.get('instanceId');
      const region = searchParams.get('region') || defaultRegion;
      if (!instanceId) return NextResponse.json({ data: [] });

      const client = new CloudWatchClient({ region, credentials });
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 3600 * 1000);

      const metrics = await race(
        (async () => {
          const res = await client.send(new GetMetricStatisticsCommand({
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
            StartTime: startTime,
            EndTime: endTime,
            Period: 300,
            Statistics: ['Average'],
          }));
          return (res.Datapoints || []).sort((a: any, b: any) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime())
            .map((d: any) => ({
              time: new Date(d.Timestamp).toLocaleTimeString(),
              value: parseFloat(d.Average?.toFixed(2) || '0'),
            }));
        })(),
        5000, []
      );

      return NextResponse.json({ data: metrics });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to communicate with AWS.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, action, region, functionName, payload } = await req.json();
    const db = readDb();

    const awsPlugin = db.plugins.find(p => p.id === 'aws');
    const accessKey = resolveSecret(awsPlugin?.settings.accessKeyId.value || '');
    const secretKey = resolveSecret(awsPlugin?.settings.secretAccessKey.value || '');
    const targetRegion = region || awsPlugin?.settings.defaultRegion.value || 'us-east-1';

    if (!accessKey || accessKey === 'AKIAIOSFODNN7EXAMPLE' || !secretKey) {
      return NextResponse.json({ error: 'AWS Credentials not configured.' }, { status: 400 });
    }

    const credentials = { accessKeyId: accessKey, secretAccessKey: secretKey };

    if (action === 'start' || action === 'stop') {
      const client = new EC2Client({ region: targetRegion, credentials });
      const command = action === 'start'
        ? new StartInstancesCommand({ InstanceIds: [id] })
        : new StopInstancesCommand({ InstanceIds: [id] });
      await client.send(command);
      db.feed.unshift({ id: `f-${Date.now()}`, pluginId: 'aws', title: `EC2 ${action === 'start' ? 'Started' : 'Stopped'}`, description: `Sent ${action} to ${id} (${targetRegion}).`, timestamp: 'Just now', type: action === 'stop' ? 'warning' : 'success' });
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'invoke_lambda') {
      const client = new LambdaClient({ region: targetRegion, credentials });
      const res = await client.send(new InvokeCommand({
        FunctionName: functionName,
        Payload: payload ? Buffer.from(JSON.stringify(payload)) : Buffer.from('{}'),
      }));
      const responsePayload = res.Payload ? Buffer.from(res.Payload).toString('utf-8') : '';
      db.feed.unshift({ id: `f-${Date.now()}`, pluginId: 'aws', title: 'Lambda Invoked', description: `Invoked ${functionName} in ${targetRegion}. Status: ${res.StatusCode}`, timestamp: 'Just now', type: res.StatusCode === 200 ? 'success' : 'error' });
      writeDb(db);
      return NextResponse.json({ success: true, statusCode: res.StatusCode, response: responsePayload });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to run AWS operation.' }, { status: 500 });
  }
}
