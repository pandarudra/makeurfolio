// --------------------------------------------------------------------------
// GitHub Module Types
// --------------------------------------------------------------------------
// Normalized types that NEVER leak raw GitHub API payloads.
// --------------------------------------------------------------------------

/** Normalized GitHub user profile */
export interface GithubUser {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  followers: number;
}

/** Raw shape from GET /users/{username} — used only inside the analyzer */
export interface GithubApiUser {
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

/** Raw shape from GET /users/{username}/repos */
export interface GithubApiRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  size: number;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  has_pages: boolean;
  open_issues_count: number;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Repository with computed score */
export interface GithubRepoScored {
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  openIssues: number;
  size: number;
  pushedAt: string | null;
  createdAt: string;
  score: number;
  hasReadme: boolean;
  readme: string | null;
  languages: string[];
}

/** The final normalized output of the GitHub analyzer */
export interface GithubSummary {
  user: GithubUser;
  repositories: GithubRepoScored[];
  allLanguages: string[];
  profileReadme: string | null;
}
