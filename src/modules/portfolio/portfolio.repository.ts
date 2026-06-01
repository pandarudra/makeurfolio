// --------------------------------------------------------------------------
// Portfolio Repository
// --------------------------------------------------------------------------
// Data access layer for Portfolio entity. Only module that talks to Prisma.
// --------------------------------------------------------------------------

import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import type { PortfolioWithRelations } from "./portfolio.types";

export async function createPortfolioWithRelations(
  data: Prisma.PortfolioCreateInput
): Promise<PortfolioWithRelations> {
  // Prisma handles nested writes atomically in a single transaction
  return prisma.portfolio.create({
    data,
    include: {
      experiences: { orderBy: { sortOrder: 'asc' } },
      educations: { orderBy: { sortOrder: 'asc' } },
      skills: true,
      projects: {
        include: { githubMetadata: true },
        orderBy: [{ featured: 'desc' }, { featuredOrder: 'asc' }],
      },
      certifications: { orderBy: { issueDate: 'desc' } },
      achievements: { orderBy: { achievedAt: 'desc' } },
    },
  });
}

export async function findPortfolioBySlug(
  slug: string
): Promise<PortfolioWithRelations | null> {
  return prisma.portfolio.findUnique({
    where: { slug },
    include: {
      experiences: { orderBy: { sortOrder: 'asc' } },
      educations: { orderBy: { sortOrder: 'asc' } },
      skills: true,
      projects: {
        include: { githubMetadata: true },
        orderBy: [{ featured: 'desc' }, { featuredOrder: 'asc' }],
      },
      certifications: { orderBy: { issueDate: 'desc' } },
      achievements: { orderBy: { achievedAt: 'desc' } },
    },
  });
}

export async function checkSlugExists(slug: string): Promise<boolean> {
  const existing = await prisma.portfolio.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !!existing;
}
