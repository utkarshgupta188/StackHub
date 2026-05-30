import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'repos';

    const db = readDb();
    const githubPlugin = db.plugins.find(p => p.id === 'github');
    const pat = githubPlugin?.settings.personalAccessToken.value;

    // If no PAT is set or it is the default mock token, return error status
    if (!pat || pat === 'ghp_mocktoken1234567890abcdefghijklmnopqr' || pat.trim() === '') {
      return NextResponse.json({ error: 'GitHub Personal Access Token not configured.' }, { status: 400 });
    }

    const headers = {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'StackHub-App',
    };

    if (type === 'repos') {
      const res = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=10`, { headers });
      if (!res.ok) throw new Error('GitHub API responded with error');
      const data = await res.json();
      const repos = data.map((r: any) => ({
        name: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || 'Markdown',
        openIssues: r.open_issues_count,
        owner: r.owner.login
      }));
      return NextResponse.json({ data: repos });
    }

    if (type === 'prs') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=3`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API responded with error');
      const reposData = await reposRes.json();

      const prPromises = reposData.map(async (r: any) => {
        const prsRes = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/pulls?state=open&per_page=2`, { headers });
        if (!prsRes.ok) return [];
        const prsData = await prsRes.json();
        return prsData.map((pr: any) => ({
          id: String(pr.id),
          title: pr.title,
          repo: r.name,
          author: pr.user.login,
          status: pr.draft ? 'reviewing' : 'passing',
          reviews: pr.requested_reviewers.length > 0 ? `${pr.requested_reviewers.length} pending` : 'Approved',
          branch: pr.head.ref,
          owner: r.owner.login
        }));
      });

      const prLists = await Promise.all(prPromises);
      const prs = prLists.flat();
      return NextResponse.json({ data: prs });
    }

    if (type === 'commits') {
      const reposRes = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=1`, { headers });
      if (!reposRes.ok) throw new Error('GitHub API responded with error');
      const reposData = await reposRes.json();
      if (reposData.length === 0) return NextResponse.json({ data: [] });

      const latestRepo = reposData[0];
      const commitsRes = await fetch(`https://api.github.com/repos/${latestRepo.owner.login}/${latestRepo.name}/commits?per_page=5`, { headers });
      if (!commitsRes.ok) throw new Error('GitHub commits responded with error');
      const commitsData = await commitsRes.json();

      const commits = await Promise.all(commitsData.map(async (c: any) => {
        let diffText = 'diff not loaded';
        try {
          const diffRes = await fetch(`https://api.github.com/repos/${latestRepo.owner.login}/${latestRepo.name}/commits/${c.sha}`, {
            headers: {
              ...headers,
              Accept: 'application/vnd.github.v3.diff'
            }
          });
          if (diffRes.ok) {
            diffText = await diffRes.text();
            if (diffText.length > 1000) {
              diffText = diffText.slice(0, 1000) + '\n... [truncated for performance]';
            }
          }
        } catch (e) {}

        return {
          sha: c.sha.slice(0, 7),
          fullSha: c.sha,
          message: c.commit.message,
          author: c.commit.author.name,
          time: new Date(c.commit.author.date).toLocaleDateString() + ' ago',
          diff: diffText
        };
      }));

      return NextResponse.json({ data: commits });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to communicate with GitHub API' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, repo, owner, id } = await req.json();
    const db = readDb();
    const githubPlugin = db.plugins.find(p => p.id === 'github');
    const pat = githubPlugin?.settings.personalAccessToken.value;

    if (!pat || pat === 'ghp_mocktoken1234567890abcdefghijklmnopqr' || pat.trim() === '') {
      return NextResponse.json({ error: 'GitHub Personal Access Token not configured.' }, { status: 400 });
    }

    const headers = {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'StackHub-App',
    };

    if (action === 'merge') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${id}/merge`, {
        method: 'PUT',
        headers,
      });
      if (!res.ok) throw new Error('GitHub Merge API responded with error');
      
      db.feed.unshift({
        id: `f-${Date.now()}`,
        pluginId: 'github',
        title: 'GitHub PR Merged',
        description: `Successfully merged real pull request #${id} in repo ${repo} via token.`,
        timestamp: 'Just now',
        type: 'success',
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'GitHub Action failed' }, { status: 500 });
  }
}
