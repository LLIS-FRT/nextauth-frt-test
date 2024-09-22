import { untis } from "@/lib/untis";
import { NextResponse } from "next/server";
import { Klasse } from 'webuntis';

export const getClasses = async (): Promise<Klasse[]> => {
    await untis.login();

    // Get current school year
    const currentSchoolYear = await untis.getCurrentSchoolyear(true);
    if (!currentSchoolYear) throw new Error("No current school year found");

    const classes = await untis.getClasses(true, currentSchoolYear.id);
    return classes;
}

// GET all classes
export async function GET() {
    // Get the class id
    const classes = await getClasses();
    if (!classes || classes.length === 0) {
        return new NextResponse("No classes found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(classes), { status: 200 });
};