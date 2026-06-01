import { NextRequest, NextResponse } from "next/server";
import { executeGenerationSynchronously } from "@/src/modules/generation/generation.service";
import { AppError } from "@/src/lib/errors";

import { auth } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in to generate a portfolio.", statusCode: 401 } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const githubUsername = formData.get("githubUsername") as string | null;
    const portfolioName = formData.get("portfolioName") as string | null;
    const resumeFile = formData.get("resume") as File | null;
    const generationId = formData.get("generationId") as string | null;

    if (!githubUsername && !resumeFile) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Either githubUsername or resume is required", statusCode: 400 } },
        { status: 400 }
      );
    }

    if (!portfolioName) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "portfolioName is required", statusCode: 400 } },
        { status: 400 }
      );
    }

    let resumeBuffer: Buffer | undefined;
    let resumeFileName: string | undefined;

    if (resumeFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword" // for older .doc if needed, though mammoth focuses on .docx
      ];

      if (!allowedTypes.includes(resumeFile.type) && !resumeFile.name.endsWith(".docx") && !resumeFile.name.endsWith(".pdf")) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Resume must be a PDF or Word document (.docx)", statusCode: 400 } },
          { status: 400 }
        );
      }
      
      const arrayBuffer = await resumeFile.arrayBuffer();
      resumeBuffer = Buffer.from(arrayBuffer);
      resumeFileName = resumeFile.name;
    }

    // Execute generation synchronously (MVP approach to avoid serverless timeouts/lost background tasks)
    const result = await executeGenerationSynchronously({
      githubUsername: githubUsername || undefined,
      resumeBuffer,
      resumeFileName,
      portfolioName,
      userId: session.user.id,
      generationId: generationId || undefined,
    });

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          generationId: result.generationId,
          portfolioSlug: result.portfolio.slug
        } 
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled error in generation route:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "INTERNAL_ERROR", 
          message: error instanceof Error ? error.message : "Internal Server Error", 
          statusCode: 500 
        } 
      },
      { status: 500 }
    );
  }
}
