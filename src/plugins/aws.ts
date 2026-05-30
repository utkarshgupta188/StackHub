import { Plugin } from '@/types';

export const mockAwsCosts = [
  { month: 'Jan', EC2: 120, S3: 45, RDS: 80, CloudWatch: 12 },
  { month: 'Feb', EC2: 135, S3: 49, RDS: 80, CloudWatch: 14 },
  { month: 'Mar', EC2: 110, S3: 52, RDS: 95, CloudWatch: 15 },
  { month: 'Apr', EC2: 145, S3: 58, RDS: 98, CloudWatch: 19 },
  { month: 'May', EC2: 155, S3: 65, RDS: 105, CloudWatch: 22 },
];

export const mockAwsS3 = [
  { name: 'stackhub-assets-production', region: 'us-east-1', files: 4390, size: '42.1 GB' },
  { name: 'stackhub-user-uploads-dev', region: 'us-west-2', files: 89, size: '254 MB' },
  { name: 'backups-db-historical-archive', region: 'eu-central-1', files: 12, size: '1.2 TB' },
];

export const mockAwsInstances = [
  { id: 'i-03fa2cd91e843a', name: 'production-web-server-01', type: 't3.medium', status: 'running', ip: '54.210.12.89', region: 'us-east-1' },
  { id: 'i-08cb92fa942c11', name: 'staging-api-server-01', type: 't3.small', status: 'running', ip: '34.200.45.101', region: 'us-east-1' },
  { id: 'i-09ef912ad21c9b', name: 'analytics-worker-spot', type: 'c6g.large', status: 'stopped', ip: '-', region: 'us-west-2' },
  { id: 'i-0aa4f8b91a27e0', name: 'test-sandbox-env', type: 't2.nano', status: 'stopped', ip: '-', region: 'us-west-2' },
];

export const awsPlugin: Plugin = {
  id: 'aws',
  name: 'AWS Integration',
  description: 'Manage virtual servers, monitor active bucket stores, and track service bill costs dynamically.',
  icon: 'Cloud',
  enabled: true,
  settings: {
    accessKeyId: {
      label: 'AWS Access Key ID',
      type: 'text',
      value: 'AKIAIOSFODNN7EXAMPLE',
      placeholder: 'AKIA...',
    },
    secretAccessKey: {
      label: 'AWS Secret Access Key',
      type: 'password',
      value: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      placeholder: 'Secret Key...',
    },
    defaultRegion: {
      label: 'Default AWS Region',
      type: 'select',
      value: 'us-east-1',
      choices: [
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
      ],
    },
  },
  widgets: [
    { id: 'aws-costs', title: 'AWS Cloud Cost Overview', size: 'md', component: 'AwsCosts' },
    { id: 'aws-ec2', title: 'EC2 Compute Instances', size: 'lg', component: 'AwsInstances' },
    { id: 'aws-s3', title: 'S3 Storage Buckets', size: 'sm', component: 'AwsBuckets' },
  ],
  commands: [
    {
      id: 'aws-ec2-start',
      name: 'AWS: Start all stopped EC2 instances',
      description: 'Finds any instance currently offline and triggers their boot sequences.',
      category: 'AWS',
      action: (ctx) => {
        ctx.addFeedNotification({
          pluginId: 'aws',
          title: 'EC2 Instances Booting',
          description: 'i-09ef912ad21c9b & i-0aa4f8b91a27e0 status updating to booting.',
          type: 'info',
        });
        return 'AWS: Started 2 instances!';
      },
    },
    {
      id: 'aws-check-costs',
      name: 'AWS: Check Cost Trends',
      description: 'Instantly view breakdown of recent cloud resource costs.',
      category: 'AWS',
      action: (ctx) => {
        ctx.setActivePage('/dashboard');
        setTimeout(() => {
          document.getElementById('widget-aws-costs')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    },
  ],
};
