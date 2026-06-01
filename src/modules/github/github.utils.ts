// --------------------------------------------------------------------------
// GitHub Utility Functions
// --------------------------------------------------------------------------
// Pure functions for scoring, filtering, and aggregating repository data.
// No API calls — these operate on already-fetched data.
// --------------------------------------------------------------------------

import type { GithubApiRepo, GithubRepoScored } from "./github.types";

const DAYS_FOR_RECENT_ACTIVITY = 90;

/**
 * Calculate a quality score for a repository.
 *
 * Formula:
 *   (stars × 5) + (forks × 2) + (recentActivity × 10) + (readmeExists × 20)
 *
 * recentActivity = 1 if pushed_at is within 90 days, else 0
 */
export function calculateRepoScore(
  repo: GithubApiRepo,
  readmeExists: boolean
): number {
  const stars = repo.stargazers_count * 5;
  const forks = repo.forks_count * 2;

  const recentActivity = isRecentlyActive(repo.pushed_at) ? 10 : 0;
  const readmeBonus = readmeExists ? 20 : 0;

  return stars + forks + recentActivity + readmeBonus;
}

/**
 * Check if a repository has been pushed to within the recent activity window.
 */
function isRecentlyActive(pushedAt: string | null): boolean {
  if (!pushedAt) return false;

  const pushed = new Date(pushedAt);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_FOR_RECENT_ACTIVITY);

  return pushed >= cutoff;
}

/**
 * Filter out repositories that don't meet quality criteria.
 * Excludes: forks, archived repos, empty repos (size = 0).
 */
export function isQualityRepo(repo: GithubApiRepo): boolean {
  if (repo.fork) return false;
  if (repo.archived) return false;
  if (repo.size === 0) return false;
  return true;
}

/**
 * Aggregate unique languages across all scored repositories.
 * Uses the primary language from each repo.
 */
export function aggregateLanguages(repos: GithubRepoScored[]): string[] {
  const languages = new Set<string>();

  for (const repo of repos) {
    if (repo.language) {
      languages.add(repo.language);
    }
    // Also include detailed languages fetched for top repos
    for (const lang of repo.languages) {
      languages.add(lang);
    }
  }

  return Array.from(languages).sort();
}

/**
 * Normalize a raw GitHub repo into the scored format (score is computed later).
 */
export function normalizeRepo(
  repo: GithubApiRepo,
  score: number,
  hasReadme: boolean,
  readme: string | null,
  languages: string[]
): GithubRepoScored {
  return {
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    topics: repo.topics ?? [],
    homepage: repo.homepage,
    openIssues: repo.open_issues_count,
    size: repo.size,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    score,
    hasReadme,
    readme,
    languages,
  };
}
