// --------------------------------------------------------------------------
// Generation Service (Synchronous MVP)
// --------------------------------------------------------------------------
// Orchestrates the entire pipeline end-to-end synchronously.
// Wait times can be high (e.g. 10-20s), so this relies on the platform
// (like Vercel) allowing enough execution time for the request.
// --------------------------------------------------------------------------

import { logger } from "@/src/lib/logger";
import { GenerationStatus } from "@/app/generated/prisma/client";
import { createGeneration, updateGenerationStatus } from "./generation.repository";
import type { GenerationInput } from "./generation.types";

// Modules
import { analyzeGithubProfile } from "@/src/modules/github/github-analyzer.service";
import { parseResume } from "@/src/modules/resume/resume-parser.service";
import { generateProfile } from "@/src/modules/ai/profile-generator.service";
import { mergeProjects } from "./project-merge.service";
import { createPortfolio } from "@/src/modules/portfolio/portfolio.service";

import type { GithubSummary } from "@/src/modules/github/github.types";
import type { ResumeParseResult } from "@/src/modules/resume/resume.types";
import type { PortfolioWithRelations } from "@/src/modules/portfolio/portfolio.types";

const SERVICE = "GenerationService";

export async function executeGenerationSynchronously(
  input: GenerationInput
): Promise<{ generationId: string; portfolio: PortfolioWithRelations }> {
  logger.info(SERVICE, "Starting synchronous generation pipeline");
  
  // 1. Create generation record
  const generation = await createGeneration(input.githubUsername, input.generationId);
  const genId = generation.id;

  try {
    let githubSummary: GithubSummary | undefined;
    let resumeResult: ResumeParseResult | undefined;

    // 2. GitHub Phase
    if (input.githubUsername) {
      await updateGenerationStatus(genId, GenerationStatus.FETCHING_GITHUB);
      githubSummary = await analyzeGithubProfile(input.githubUsername);
    }

    // 3. Resume Phase
    if (input.resumeBuffer) {
      await updateGenerationStatus(genId, GenerationStatus.PARSING_RESUME);
      resumeResult = await parseResume(input.resumeBuffer, input.resumeFileName);
    }

    // 4. AI Generation Phase
    await updateGenerationStatus(genId, GenerationStatus.GENERATING_PROFILE);
    
    const profile = await generateProfile({
      githubSummary,
      resumeText: resumeResult?.text,
    });

    // 5. Post-process AI output (Deduplicate projects)
    profile.projects = mergeProjects(profile.projects);

    // 6. Database / Portfolio Creation Phase
    const portfolio = await createPortfolio({
      profile,
      githubSummary,
      portfolioName: input.portfolioName,
      githubUsername: input.githubUsername,
      userId: input.userId,
    });

    // 7. Mark Completed
    await updateGenerationStatus(
      genId, 
      GenerationStatus.COMPLETED, 
      undefined, 
      portfolio.id
    );

    logger.info(SERVICE, "Pipeline completed successfully", { genId, portfolioId: portfolio.id });

    return { generationId: genId, portfolio };
  } catch (error) {
    logger.error(SERVICE, "Pipeline failed", error, { genId });
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    await updateGenerationStatus(
      genId,
      GenerationStatus.FAILED,
      errorMessage
    ).catch(e => logger.error(SERVICE, "Failed to update error status", e));

    throw error;
  }
}
