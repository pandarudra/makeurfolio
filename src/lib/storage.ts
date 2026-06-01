import { get, set, del } from "idb-keyval";

export interface StashedGenerationState {
  githubUsername: string;
  resumeFile?: File;
  portfolioName?: string;
}

const STORAGE_KEY = "makeurfolio_stashed_state";
const GENERATION_ID_KEY = "makeurfolio_active_generation_id";

export async function stashGenerationState(state: StashedGenerationState) {
  try {
    await set(STORAGE_KEY, state);
  } catch (error) {
    console.error("Failed to stash state in IndexedDB", error);
  }
}

export async function restoreStashedState(): Promise<StashedGenerationState | null> {
  try {
    const state = await get<StashedGenerationState>(STORAGE_KEY);
    return state || null;
  } catch (error) {
    console.error("Failed to restore state from IndexedDB", error);
    return null;
  }
}

export async function clearStashedState() {
  try {
    await del(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear state in IndexedDB", error);
  }
}

// LocalStorage persistence for tracking ongoing generations across reloads
export function setActiveGenerationId(generationId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(GENERATION_ID_KEY, generationId);
  }
}

export function getActiveGenerationId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(GENERATION_ID_KEY);
  }
  return null;
}

export function clearActiveGenerationId() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GENERATION_ID_KEY);
  }
}

const HAS_GITHUB_KEY = "makeurfolio_active_has_github";
const HAS_RESUME_KEY = "makeurfolio_active_has_resume";

export function setActiveGenerationMetadata(hasGithub: boolean, hasResume: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem(HAS_GITHUB_KEY, String(hasGithub));
    localStorage.setItem(HAS_RESUME_KEY, String(hasResume));
  }
}

export function getActiveGenerationMetadata(): { hasGithub: boolean; hasResume: boolean } {
  if (typeof window !== "undefined") {
    const hasGithub = localStorage.getItem(HAS_GITHUB_KEY) === "true";
    const hasResume = localStorage.getItem(HAS_RESUME_KEY) === "true";
    const rawGithub = localStorage.getItem(HAS_GITHUB_KEY);
    const rawResume = localStorage.getItem(HAS_RESUME_KEY);
    return {
      hasGithub: rawGithub === null ? true : hasGithub,
      hasResume: rawResume === null ? true : hasResume,
    };
  }
  return { hasGithub: true, hasResume: true };
}

export function clearActiveGenerationMetadata() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(HAS_GITHUB_KEY);
    localStorage.removeItem(HAS_RESUME_KEY);
  }
}
