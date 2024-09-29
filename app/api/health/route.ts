import { protectedRoute } from "@/lib/auth";
import { untis } from "@/lib/untis";
import { getClasses } from "@/utils/classes";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET all exams
export async function GET(req: NextRequest) {
    return new NextResponse("Pong", { status: 200 });
}
