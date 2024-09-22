
import { getClasses } from "@/utils/classes";
import { NextResponse } from "next/server";

// GET all classes
export async function GET() {
    // Get the class id
    const classes = await getClasses();
    if (!classes || classes.length === 0) {
        return new NextResponse("No classes found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(classes), { status: 200 });
};