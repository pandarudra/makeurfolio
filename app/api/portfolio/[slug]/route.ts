import { NextRequest, NextResponse } from "next/server";
import { getPortfolio } from "@/src/modules/portfolio/portfolio.service";
import { AppError } from "@/src/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;

  if (!resolvedParams.slug) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Portfolio slug is required", statusCode: 400 } },
      { status: 400 }
    );
  }

  try {
    const portfolio = await getPortfolio(resolvedParams.slug);

    return NextResponse.json(
      { success: true, data: portfolio },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    console.error("Error in portfolio fetch route:", error);
    
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal Server Error", statusCode: 500 } },
      { status: 500 }
    );
  }
}
