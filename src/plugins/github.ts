import { Plugin } from '@/types';

// Mock GitHub Data
export const mockGithubPRs = [
  { id: 'pr-1', title: 'feat: add docker container log streaming support', repo: 'stackhub-core', author: 'jane-doe', status: 'reviewing', reviews: '1/2 approved', branch: 'feat/docker-logs' },
  { id: 'pr-2', title: 'fix: cmd+k palette crash on empty plugins list', repo: 'stackhub-core', author: 'bob-smith', status: 'passing', reviews: 'Approved', branch: 'fix/palette-empty' },
  { id: 'pr-3', title: 'refactor: extract plugin context for performance', repo: 'stackhub-core', author: 'alice-williams', status: 'failing', reviews: 'Changes requested', branch: 'refactor/plugin-context' },
];

export const mockGithubRepos = [
  { name: 'stackhub-core', stars: 1420, forks: 89, language: 'TypeScript', openIssues: 12 },
  { name: 'aws-plugin-stackhub', stars: 230, forks: 14, language: 'TypeScript', openIssues: 4 },
  { name: 'docker-plugin-stackhub', stars: 180, forks: 19, language: 'Go', openIssues: 8 },
  { name: 'developer-portal-docs', stars: 45, forks: 2, language: 'MDX', openIssues: 1 },
];

export const mockGithubCommits = [
  { sha: '8c92f1b', message: 'Merge pull request #112 from feat/aws-metrics', author: 'jane-doe', time: '10m ago', diff: `diff --git a/src/plugins/aws.ts b/src/plugins/aws.ts
index 8f23b1a..9c21d8b 100644
--- a/src/plugins/aws.ts
+++ b/src/plugins/aws.ts
@@ -12,4 +12,12 @@ export const awsPlugin = {
   widgets: [
     { id: 'aws-costs', title: 'AWS Cloud Cost Overview', size: 'md' },
+    { id: 'aws-ec2', title: 'EC2 Instances', size: 'lg' }
   ]
-};
+};` },
  { sha: 'f5d1a2c', message: 'fix(core): resolve race condition in local state storage', author: 'bob-smith', time: '1h ago', diff: `diff --git a/src/context/plugin-context.tsx b/src/context/plugin-context.tsx
index a123bcd..f345cde 100644
--- a/src/context/plugin-context.tsx
+++ b/src/context/plugin-context.tsx
@@ -4,5 +4,5 @@ export const PluginProvider = ({ children }) => {
-  const [plugins, setPlugins] = useState(initialPlugins);
+  const [plugins, setPlugins] = useState(() => loadFromStorage() || initialPlugins);
` },
  { sha: 'd3a4b9e', message: 'docs: update API setup instructions for AWS integration', author: 'alice-williams', time: '3h ago', diff: `diff --git a/README.md b/README.md
index a3d2e1c..b4e3f2d 100644
--- a/README.md
+++ b/README.md
@@ -10,3 +10,5 @@
+## AWS Configuration
+Ensure you supply the secret access token inside your StackHub workspace dashboard.
` },
];

export const githubPlugin: Plugin = {
  id: 'github',
  name: 'GitHub',
  description: 'Manage repositories, review pull requests, check issues, and visualize code diffs from recent commits.',
  icon: 'Github',
  enabled: true,
  settings: {
    personalAccessToken: {
      label: 'Personal Access Token',
      type: 'password',
      value: 'ghp_mocktoken1234567890abcdefghijklmnopqr',
      placeholder: 'ghp_...',
    },
    defaultOwner: {
      label: 'Default Owner/Organization',
      type: 'text',
      value: 'stackhub-app',
      placeholder: 'e.g. github-username',
    },
    syncInterval: {
      label: 'Sync Interval (seconds)',
      type: 'select',
      value: '30',
      choices: ['10', '30', '60', '300'],
    },
  },
  widgets: [
    { id: 'github-pull-requests', title: 'GitHub Pull Requests', size: 'md', component: 'GithubPullRequests' },
    { id: 'github-repositories', title: 'GitHub Repositories', size: 'sm', component: 'GithubRepositories' },
    { id: 'github-commits', title: 'Recent Commits & Code Diffs', size: 'lg', component: 'GithubCommits' },
  ],
  commands: [
    {
      id: 'github-view-prs',
      name: 'GitHub: View Open Pull Requests',
      description: 'Review active team code contributions, check status and reviewers.',
      category: 'GitHub',
      shortcut: 'G P',
      action: (ctx) => {
        ctx.setActivePage('/dashboard');
        // highlight/scroll to PR widget
        setTimeout(() => {
          document.getElementById('widget-github-pull-requests')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    },
    {
      id: 'github-sync',
      name: 'GitHub: Force Sync Repositories',
      description: 'Trigger instant webhooks sync with github servers.',
      category: 'GitHub',
      shortcut: 'G S',
      action: (ctx) => {
        ctx.addFeedNotification({
          pluginId: 'github',
          title: 'GitHub repositories synchronized',
          description: 'Fetched 4 repositories and 3 open pull requests.',
          type: 'success',
        });
        return 'GitHub repositories synced successfully!';
      },
    },
  ],
};
