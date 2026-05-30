import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

function getHeaders(pat: string) {
  return {
    Authorization: `token ${pat}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'StackHub-App',
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'repos';
    const repo = searchParams.get('repo') || '';
    const owner = searchParams.get('owner') || '';

    const db = readDb();
    const githubPlugin = db.plugins.find(p => p.id === 'github');
    const pat = githubPlugin?.settings.personalAccessToken.value;

    if (!pat || pat === 'ghp_mocktoken1234567890abcdefghijklmnopqr' || pat.trim() === '') {
      return NextResponse.json({ error: 'GitHub Personal Access Token not configured.' }, { status: 400 });
    }

    const headers = getHeaders(pat);

    // ── REPOSITORIES ──────────────────────────────────────────────
    if (type === 'repos') {
      const res = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=20&type=all`, { headers });
      if (!res.ok) throw new Error('GitHub API error');
      const data = await res.json();
      const repos = data.map((r: any) => ({
        name: r.name,
        fullName: r.full_name,
        owner: r.owner.login,
        stars: r.stargazers_count,
        forks: r.forks_count,
        watchers: r.watchers_count,
        language: r.language || 'Markdown',
        openIssues: r.open_issues_count,
        private: r.private,
        defaultBranch: r.default_branch,
        url: r.html_url,
        description: r.description,
        updatedAt: r.updated_at,
        size: r.size,
      }));
      return NextResponse.json({ data: repos });
    }

    // ── PULL REQUESTS ─────────────────────────────────────────────
    if (type === 'prs') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=5&type=all`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API error');
      const reposData = await reposRes.json();

      const prPromises = reposData.map(async (r: any) => {
        const prsRes = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/pulls?state=open&per_page=5`, { headers });
        if (!prsRes.ok) return [];
        const prsData = await prsRes.json();
        return prsData.map((pr: any) => ({
          id: String(pr.number),
          title: pr.title,
          repo: r.name,
          fullName: r.full_name,
          author: pr.user.login,
          authorAvatar: pr.user.avatar_url,
          status: pr.draft ? 'draft' : 'open',
          reviews: pr.requested_reviewers?.length > 0 ? `${pr.requested_reviewers.length} pending` : 'Approved',
          branch: pr.head.ref,
          baseBranch: pr.base.ref,
          owner: r.owner.login,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          changedFiles: pr.changed_files || 0,
          createdAt: pr.created_at,
          labels: pr.labels?.map((l: any) => l.name) || [],
          url: pr.html_url,
        }));
      });

      const prLists = await Promise.all(prPromises);
      const prs = prLists.flat();
      return NextResponse.json({ data: prs });
    }

    // ── ISSUES ────────────────────────────────────────────────────
    if (type === 'issues') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=5&type=all`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API error');
      const reposData = await reposRes.json();

      const issuePromises = reposData.map(async (r: any) => {
        const res = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/issues?state=open&per_page=5&filter=all`, { headers });
        if (!res.ok) return [];
        const data = await res.json();
        return data
          .filter((i: any) => !i.pull_request)
          .map((i: any) => ({
            id: String(i.number),
            title: i.title,
            repo: r.name,
            owner: r.owner.login,
            state: i.state,
            author: i.user.login,
            authorAvatar: i.user.avatar_url,
            labels: i.labels?.map((l: any) => ({ name: l.name, color: l.color })) || [],
            comments: i.comments,
            createdAt: i.created_at,
            url: i.html_url,
            body: i.body?.slice(0, 200) || '',
          }));
      });

      const issueLists = await Promise.all(issuePromises);
      const issues = issueLists.flat();
      return NextResponse.json({ data: issues });
    }

    // ── COMMITS ───────────────────────────────────────────────────
    if (type === 'commits') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=1`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API error');
      const reposData = await reposRes.json();
      if (reposData.length === 0) return NextResponse.json({ data: [] });

      const r = reposData[0];
      const commitsRes = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/commits?per_page=10`, { headers });
      if (!commitsRes.ok) throw new Error('GitHub commits API error');
      const commitsData = await commitsRes.json();

      const commits = await Promise.all(commitsData.map(async (c: any) => {
        let diffText = '';
        try {
          const diffRes = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/commits/${c.sha}`, {
            headers: { ...headers, Accept: 'application/vnd.github.v3.diff' }
          });
          if (diffRes.ok) {
            diffText = await diffRes.text();
            if (diffText.length > 2000) diffText = diffText.slice(0, 2000) + '\n... [truncated]';
          }
        } catch (e) {}

        return {
          sha: c.sha.slice(0, 7),
          fullSha: c.sha,
          message: c.commit.message.split('\n')[0],
          author: c.commit.author.name,
          authorEmail: c.commit.author.email,
          time: new Date(c.commit.author.date).toLocaleDateString(),
          repo: r.name,
          owner: r.owner.login,
          diff: diffText,
          url: c.html_url,
          verified: c.commit.verification?.verified || false,
        };
      }));

      return NextResponse.json({ data: commits });
    }

    // ── BRANCHES ──────────────────────────────────────────────────
    if (type === 'branches') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=3`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API error');
      const reposData = await reposRes.json();

      const branchPromises = reposData.map(async (r: any) => {
        const res = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/branches?per_page=10`, { headers });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((b: any) => ({
          name: b.name,
          repo: r.name,
          owner: r.owner.login,
          protected: b.protected,
          sha: b.commit?.sha?.slice(0, 7) || '',
          isDefault: b.name === r.default_branch,
        }));
      });

      const branchLists = await Promise.all(branchPromises);
      return NextResponse.json({ data: branchLists.flat() });
    }

    // ── RELEASES ──────────────────────────────────────────────────
    if (type === 'releases') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=5`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API error');
      const reposData = await reposRes.json();

      const relPromises = reposData.map(async (r: any) => {
        const res = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/releases?per_page=2`, { headers });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((rel: any) => ({
          id: String(rel.id),
          name: rel.name || rel.tag_name,
          tagName: rel.tag_name,
          repo: r.name,
          owner: r.owner.login,
          prerelease: rel.prerelease,
          draft: rel.draft,
          publishedAt: rel.published_at,
          downloads: rel.assets?.reduce((acc: number, a: any) => acc + a.download_count, 0) || 0,
          url: rel.html_url,
          body: rel.body?.slice(0, 300) || '',
        }));
      });

      const relLists = await Promise.all(relPromises);
      return NextResponse.json({ data: relLists.flat() });
    }

    // ── USER OVERVIEW ─────────────────────────────────────────────
    if (type === 'user') {
      const res = await fetch('https://api.github.com/user', { headers });
      if (!res.ok) throw new Error('GitHub API error');
      const u = await res.json();
      return NextResponse.json({
        data: {
          login: u.login,
          name: u.name,
          avatar: u.avatar_url,
          bio: u.bio,
          company: u.company,
          location: u.location,
          publicRepos: u.public_repos,
          privateRepos: u.total_private_repos,
          followers: u.followers,
          following: u.following,
          totalRepos: u.public_repos + (u.total_private_repos || 0),
          createdAt: u.created_at,
          diskUsage: u.disk_usage,
          plan: u.plan?.name || 'free',
        }
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to communicate with GitHub API' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, repo, owner, id, title, body, branch, base } = await req.json();
    const db = readDb();
    const githubPlugin = db.plugins.find(p => p.id === 'github');
    const pat = githubPlugin?.settings.personalAccessToken.value;

    if (!pat || pat === 'ghp_mocktoken1234567890abcdefghijklmnopqr' || pat.trim() === '') {
      return NextResponse.json({ error: 'GitHub Personal Access Token not configured.' }, { status: 400 });
    }

    const headers = { ...getHeaders(pat), 'Content-Type': 'application/json' };

    if (action === 'merge') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${id}/merge`, {
        method: 'PUT', headers,
        body: JSON.stringify({ merge_method: 'squash' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'GitHub Merge failed');
      }
      db.feed.unshift({ id: `f-${Date.now()}`, pluginId: 'github', title: 'GitHub PR Merged', description: `Merged PR #${id} in ${repo} via squash.`, timestamp: 'Just now', type: 'success' });
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'close_issue') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ state: 'closed' }),
      });
      if (!res.ok) throw new Error('Failed to close issue');
      db.feed.unshift({ id: `f-${Date.now()}`, pluginId: 'github', title: 'Issue Closed', description: `Closed issue #${id} in ${repo}.`, timestamp: 'Just now', type: 'success' });
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'create_issue') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST', headers,
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) throw new Error('Failed to create issue');
      const created = await res.json();
      db.feed.unshift({ id: `f-${Date.now()}`, pluginId: 'github', title: 'Issue Created', description: `Created issue #${created.number}: ${title}`, timestamp: 'Just now', type: 'success' });
      writeDb(db);
      return NextResponse.json({ success: true, issue: created });
    }

    if (action === 'delete_branch') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'DELETE', headers,
      });
      if (!res.ok && res.status !== 422) throw new Error('Failed to delete branch');
      db.feed.unshift({ id: `f-${Date.now()}`, pluginId: 'github', title: 'Branch Deleted', description: `Deleted branch ${branch} from ${repo}.`, timestamp: 'Just now', type: 'warning' });
      writeDb(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'GitHub Action failed' }, { status: 500 });
  }
}
