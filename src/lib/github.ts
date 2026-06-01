import { GithubError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";

const GITHUB_API_BASE = "https://api.github.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface GithubFetchOptions {
  path: string;
  params?: Record<string, string>;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  return {
    limit: parseInt(headers.get("x-ratelimit-limit") ?? "60", 10),
    remaining: parseInt(headers.get("x-ratelimit-remaining") ?? "0", 10),
    reset: new Date(
      parseInt(headers.get("x-ratelimit-reset") ?? "0", 10) * 1000
    ),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function githubFetch<T>(options: GithubFetchOptions): Promise<T> {
  const { path, params } = options;

  const url = new URL(`${GITHUB_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const token = process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "makeurfolio-backend",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        headers,
        signal: AbortSignal.timeout(15_000),
      });

      const rateLimit = parseRateLimitHeaders(response.headers);

      if (rateLimit.remaining < 10) {
        logger.warn("Github", `Rate limit low: ${rateLimit.remaining}/${rateLimit.limit} remaining. Resets at ${rateLimit.reset.toISOString()}`);
      }

      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("retry-after") ?? "60",
          10
        );
        logger.warn("Github", `Rate limited. Retry after ${retryAfter}s`);

        if (attempt < MAX_RETRIES) {
          await sleep(retryAfter * 1000);
          continue;
        }

        throw new GithubError(
          "GitHub API rate limit exceeded",
          429,
          { rateLimit }
        );
      }

      if (response.status === 404) {
        throw new GithubError(
          `GitHub resource not found: ${path}`,
          404,
          { path }
        );
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "unknown error");
        throw new GithubError(
          `GitHub API error: ${response.status} ${response.statusText}`,
          response.status,
          { path, body }
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof GithubError) {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        logger.warn("Github", `Request to ${path} failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS * attempt}ms...`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
    }
  }

  throw new GithubError(
    `GitHub API request failed after ${MAX_RETRIES} retries: ${lastError?.message}`,
    500,
    { path }
  );
}

/**
 * Fetch raw content from a GitHub repository (e.g. README files).
 * Returns null if the file doesn't exist (404).
 */
export async function githubFetchRaw(
  owner: string,
  repo: string,
  filePath: string
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filePath}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "makeurfolio-backend",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}
