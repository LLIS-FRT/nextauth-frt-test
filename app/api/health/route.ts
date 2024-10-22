import { NextRequest, NextResponse } from "next/server";

// GET all exams
export async function GET(req: NextRequest) {
    return new NextResponse("Pong", { status: 200 });
}
