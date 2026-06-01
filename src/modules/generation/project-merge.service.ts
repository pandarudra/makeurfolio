// --------------------------------------------------------------------------
// Project Merge Service
// --------------------------------------------------------------------------
// Deduplicates projects across resume and GitHub data before AI generation,
// or merges AI output with Github metadata accurately.
// --------------------------------------------------------------------------

import type { NormalizedProject } from "@/src/modules/ai/profile.schema";

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Merges projects to prevent duplicates.
 * Very simple heuristic based on normalized name similarity.
 * In a real production system, this could use embeddings or fuzzy matching.
 */
export function mergeProjects(projects: NormalizedProject[]): NormalizedProject[] {
  const merged: NormalizedProject[] = [];

  for (const p of projects) {
    const normalizedNew = normalizeName(p.title);
    
    // Find an existing project that matches by normalized name or githubUrl
    const existingIndex = merged.findIndex(
      (m) =>
        normalizeName(m.title) === normalizedNew ||
        (p.githubUrl && m.githubUrl === p.githubUrl)
    );

    if (existingIndex >= 0) {
      const existing = merged[existingIndex];
      // Merge data, preferring new data if existing is missing it
      merged[existingIndex] = {
        title: existing.title.length > p.title.length ? existing.title : p.title, // Keep the longer/better formatted title
        description: existing.description ?? p.description,
        githubUrl: existing.githubUrl ?? p.githubUrl,
        liveUrl: existing.liveUrl ?? p.liveUrl,
        techStack:
          existing.techStack && existing.techStack.length > 0
            ? existing.techStack
            : p.techStack,
        aiSummary: existing.aiSummary ?? p.aiSummary,
      };
    } else {
      merged.push(p);
    }
  }

  return merged;
}
