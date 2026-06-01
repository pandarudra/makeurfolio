import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: "UNAUTHORIZED", 
            message: "You must be logged in to view your portfolios.", 
            statusCode: 401 
          } 
        },
        { status: 401 }
      );
    }
    
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { portfolioViews: true }
        }
      }
    });
    
    return NextResponse.json(
      { success: true, data: portfolios },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching user portfolios:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "INTERNAL_ERROR", 
          message: "Failed to fetch portfolios.", 
          statusCode: 500 
        } 
      },
      { status: 500 }
    );
  }
}
