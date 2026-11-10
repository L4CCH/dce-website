import { site } from '../site';

const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'dce-website-build',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function getJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, headers: { ...headers, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      console.warn(`[github] ${response.status} for ${url}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[github] could not reach ${url}: ${error}`);
    return null;
  }
}

export type Idea = { title: string; url: string; upvotes: number; comments: number; author: string };

export async function topIdeas(limit = 6): Promise<Idea[]> {
  if (!token) {
    console.warn('[github] no GITHUB_TOKEN, so the wishlist is left empty');
    return [];
  }
  const [owner, name] = site.repo.split('/');
  const query = `query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 50, categorySlug: "ideas", orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes { title url upvoteCount comments { totalCount } author { login } closed }
      }
    }
  }`;
  const data = await getJson<{
    data?: { repository?: { discussions?: { nodes: Array<{ title: string; url: string; upvoteCount: number; comments: { totalCount: number }; author: { login: string } | null; closed: boolean }> } } };
  }>('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { owner, name } }),
  });
  const nodes = data?.data?.repository?.discussions?.nodes ?? [];
  return nodes
    .filter((n) => !n.closed)
    .sort((a, b) => b.upvoteCount - a.upvoteCount)
    .slice(0, limit)
    .map((n) => ({ title: n.title, url: n.url, upvotes: n.upvoteCount, comments: n.comments.totalCount, author: n.author?.login ?? 'someone' }));
}

export type Issue = { title: string; url: string; number: number; labels: string[] };

export async function goodFirstIssues(limit = 5): Promise<Issue[]> {
  const issues = await getJson<Array<{ title: string; html_url: string; number: number; pull_request?: unknown; labels: Array<{ name: string }> }>>(
    `https://api.github.com/repos/${site.repo}/issues?labels=${encodeURIComponent('good first issue')}&state=open&per_page=${limit}`,
  );
  return (issues ?? [])
    .filter((i) => !i.pull_request)
    .map((i) => ({ title: i.title, url: i.html_url, number: i.number, labels: i.labels.map((l) => l.name) }));
}
