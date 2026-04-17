export interface Repo {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  url: string;
  homepage: string | null;
  updatedAt: string;
  fork: boolean;
}

export interface FeaturedRepo {
  repo: string;
  tagline: string;
  category: string;
  emoji: string;
  highlight: boolean;
}

export interface EnrichedRepo extends Repo {
  tagline?: string;
  category?: string;
  emoji?: string;
  highlight: boolean;
  featured: boolean;
}

export async function getRepos(): Promise<Repo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.mercy-preview+json',
  };

  if (import.meta.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${import.meta.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    'https://api.github.com/users/FabriGu/repos?per_page=100&sort=updated',
    { headers },
  );

  if (!res.ok) {
    console.error('GitHub API error:', res.status);
    return [];
  }

  const repos = await res.json();

  return repos.map((r: any) => ({
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    topics: r.topics || [],
    url: r.html_url,
    homepage: r.homepage,
    updatedAt: r.updated_at,
    fork: r.fork,
  }));
}

export function enrichRepos(
  repos: Repo[],
  featured: FeaturedRepo[],
): EnrichedRepo[] {
  const featuredMap = new Map(featured.map((f) => [f.repo, f]));

  return repos
    .filter((r) => !r.fork)
    .map((r) => {
      const feat = featuredMap.get(r.name);
      return {
        ...r,
        tagline: feat?.tagline,
        category: feat?.category,
        emoji: feat?.emoji,
        highlight: feat?.highlight ?? false,
        featured: !!feat,
      };
    })
    .sort((a, b) => {
      if (a.highlight && !b.highlight) return -1;
      if (!a.highlight && b.highlight) return 1;
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Svelte: '#ff3e00',
  'C++': '#f34b7d',
  Swift: '#F05138',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  C: '#555555',
};

export function getLanguageColor(lang: string | null): string {
  if (!lang) return '#7C3AED';
  return LANGUAGE_COLORS[lang] ?? '#7C3AED';
}

export function getCategories(repos: EnrichedRepo[]): string[] {
  const cats = new Set<string>();
  for (const r of repos) {
    if (r.category) cats.add(r.category);
  }
  return Array.from(cats).sort();
}
