import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    // Validate database connection is working
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        success: true,
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: "connected",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "HEALTH_CHECK_FAILED",
          message: error instanceof Error ? error.message : "Service is unhealthy",
          statusCode: 503,
          details: {
            database: "disconnected",
          },
        },
      },
      { status: 503 }
    );
  }
}
