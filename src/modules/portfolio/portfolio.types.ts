// --------------------------------------------------------------------------
// Portfolio Module Types
// --------------------------------------------------------------------------

import type { NormalizedProfile } from "@/src/modules/ai/profile.schema";
import type { GithubSummary } from "@/src/modules/github/github.types";

/** Input for creating a portfolio from a normalized profile */
export interface PortfolioCreateInput {
  profile: NormalizedProfile;
  githubSummary?: GithubSummary;
  portfolioName: string;
  githubUsername?: string;
  userId?: string;
}

/** Full portfolio with all relations (response DTO) */
export interface PortfolioWithRelations {
  id: string;
  slug: string;
  name: string;
  status: string;
  githubUsername: string | null;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  themeId: string | null;
  showExperience: boolean;
  showEducation: boolean;
  showCertifications: boolean;
  showAchievements: boolean;
  showResume: boolean;
  summary: string | null;
  profileScore: number | null;
  socialLinks: Array<{
    id: string;
    label: string;
    url: string;
    icon: string | null;
    visible: boolean;
    sortOrder: number;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    employmentType: string | null;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
    currentlyWorking: boolean;
    description: string | null;
    skillsUsed: unknown;
    sortOrder: number;
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    grade: string | null;
    startDate: Date | null;
    endDate: Date | null;
    description: string | null;
    sortOrder: number;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    sources: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string | null;
    githubUrl: string | null;
    liveUrl: string | null;
    techStack: unknown;
    featured: boolean;
    featuredOrder: number | null;
    sources: string[];
    aiSummary: string | null;
    githubMetadata: {
      stars: number;
      forks: number;
      primaryLanguage: string | null;
      openIssues: number;
      repositorySize: number | null;
      score: number | null;
      lastCommitDate: Date | null;
      topics: unknown;
      readme: string | null;
    } | null;
  }>;
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    issueDate: Date | null;
    credentialUrl: string | null;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string | null;
    achievedAt: Date | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
