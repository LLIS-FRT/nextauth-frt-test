import { currentUser, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { PermissionName, Report as ReportType } from "@prisma/client";

const generateMissionNumber = async (): Promise<ReportType['missionNumber']> => {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    let prefix: string = `${year}${month}${day}`;
    let suffix: string = '01';

    const reports = await db.report.findMany({
        where: {
            createdAt: date,
        }
    });

    if (!reports.length) suffix = '01';
    else {
        const numberOfReports = reports.length;
        if (numberOfReports >= 99) throw new Error('Too many reports for the day');
        suffix = (numberOfReports + 1).toString().padStart(2, '0');
    }

    const missionNumber = `${prefix}${suffix}`;

    // One last validation before returning the mission number
    // Mission number must be 10 characters long
    if (missionNumber.length !== 10) {
        throw new Error('Invalid mission number');
    }

    return Number(missionNumber);
}

// GET all Reports
export const GET = protectedRoute(
    async function GET(req) {
        const reports = await db.report.findMany();
        return new NextResponse(JSON.stringify(reports), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.VIEW_ANY_REPORT] 
});

// POST new Report
export const POST = protectedRoute(
    async function POST(req) {
        const user = await currentUser();
        const { report }: { report: ReportType } = await req.json();

        if (!user) return new NextResponse("Unauthorized", { status: 401 });
        const missionNumber = await generateMissionNumber();

        const firstRespondersJson = JSON.stringify(report.firstResponders);
        const samplerSchemaJson = JSON.stringify(report.samplerSchema);
        const abcdeSchemaJson = JSON.stringify(report.abcdeSchema);
        const patientInfoJson = JSON.stringify(report.patientInfo);
        const missionInfoJson = JSON.stringify(report.missionInfo);

        if (!missionNumber) return new NextResponse("Invalid mission number", { status: 400 });

        const newReport = await db.report.create({
            data: {
                missionNumber,
                createdById: user.id,
                archived: report.archived,
                resolved: report.resolved,
                firstResponders: firstRespondersJson,
                samplerSchema: samplerSchemaJson,
                abcdeSchema: abcdeSchemaJson,
                patientInfo: patientInfoJson,
                missionInfo: missionInfoJson,
            }
        });

        return new NextResponse(JSON.stringify({ report: newReport }), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.CREATE_OWN_REPORT]
});