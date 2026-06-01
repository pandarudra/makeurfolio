// --------------------------------------------------------------------------
// Generation Repository
// --------------------------------------------------------------------------
// Data access for the PortfolioGeneration lifecycle entity.
// --------------------------------------------------------------------------

import { prisma } from "@/src/lib/prisma";
import type { Prisma, PortfolioGeneration } from "@/app/generated/prisma/client";
import { GenerationStatus } from "@/app/generated/prisma/client";

export async function createGeneration(
  githubUsername?: string,
  id?: string
): Promise<PortfolioGeneration> {
  return prisma.portfolioGeneration.create({
    data: {
      id,
      githubUsername,
      status: GenerationStatus.QUEUED,
    },
  });
}

export async function updateGenerationStatus(
  id: string,
  status: GenerationStatus,
  errorMessage?: string,
  portfolioId?: string
): Promise<PortfolioGeneration> {
  const data: Prisma.PortfolioGenerationUpdateInput = { status };

  if (errorMessage) {
    data.errorMessage = errorMessage;
  }

  if (portfolioId) {
    data.portfolio = { connect: { id: portfolioId } };
  }

  if (status === GenerationStatus.COMPLETED || status === GenerationStatus.FAILED) {
    data.completedAt = new Date();
  }

  return prisma.portfolioGeneration.update({
    where: { id },
    data,
  });
}

export async function findGenerationById(id: string) {
  return prisma.portfolioGeneration.findUnique({
    where: { id },
    include: {
      portfolio: {
        select: { id: true, slug: true },
      },
    },
  });
}
