// --------------------------------------------------------------------------
// NormalizedProfile Zod Schema
// --------------------------------------------------------------------------
// This is the contract between Gemini's output and our database.
// Gemini generates this shape. Zod validates it. The mapper converts it
// into Prisma entities. No unvalidated AI output ever reaches the database.
// --------------------------------------------------------------------------

import { z } from "zod/v4";

export const PersonalInfoSchema = z.object({
  fullName: z.string(),
  headline: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const SocialLinkSchema = z.object({
  url: z.string(),
});

export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  employmentType: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().nullable().optional(),
  skillsUsed: z.array(z.string()).nullable().optional(),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable().optional(),
  fieldOfStudy: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const SkillSchema = z.object({
  name: z.string(),
  category: z.enum([
    "LANGUAGE",
    "FRONTEND",
    "BACKEND",
    "DATABASE",
    "DEVOPS",
    "CLOUD",
    "BLOCKCHAIN",
    "TOOL",
    "OTHER",
  ]),
});

export const ProjectSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  techStack: z.array(z.string()).nullable().optional(),
  aiSummary: z.string().nullable().optional(),
});

export const CertificationSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  issueDate: z.string().nullable().optional(),
  credentialUrl: z.string().nullable().optional(),
});

export const AchievementSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  achievedAt: z.string().nullable().optional(),
});

export const NormalizedProfileSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  achievements: z.array(AchievementSchema),
  socialLinks: z.array(SocialLinkSchema),
});

export type NormalizedProfile = z.infer<typeof NormalizedProfileSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type NormalizedExperience = z.infer<typeof ExperienceSchema>;
export type NormalizedEducation = z.infer<typeof EducationSchema>;
export type NormalizedSkill = z.infer<typeof SkillSchema>;
export type NormalizedProject = z.infer<typeof ProjectSchema>;
export type NormalizedCertification = z.infer<typeof CertificationSchema>;
export type NormalizedAchievement = z.infer<typeof AchievementSchema>;
