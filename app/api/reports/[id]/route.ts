import { currentUser, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

const getID = (req: NextRequest) => req.nextUrl.pathname.split("/").pop()

// GET report by ID
export const GET = protectedRoute(
    async function GET(req) {
        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const report = await db.report.findUnique({ where: { id } })

        if (!report) return new NextResponse("No report found", { status: 404 });

        return new NextResponse(JSON.stringify({ report }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});

// DELETE report by ID
export const DELETE = protectedRoute(
    async function DELETE(req) {
        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const report = await db.report.findUnique({ where: { id } });
        if (!report) return new NextResponse("No report found", { status: 404 });

        const deletedReport = await db.report.delete({ where: { id } });

        return new NextResponse(JSON.stringify({ deletedReport }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN],
    requireAll: false // Set to true if you need all roles to be present
});

// UPDATE report by ID
export const PUT = protectedRoute(
    async function PUT(req) {
        const user = await currentUser();

        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        if (!user) return new NextResponse("Unauthorized", { status: 401 });
        const roles = user.roles;
        if (!roles) return new NextResponse("Unauthorized", { status: 401 });

        const body: ReportType = await req.json();

        const report = await db.report.findUnique({ where: { id } });
        if (!report) return new NextResponse("No report found", { status: 404 });

        // TODO: We need to verify that the user who is editing the report is the same as the one who created it
        if (report.createdById !== user.id && !roles.includes(UserRole.ADMIN)) return new NextResponse("Unauthorized", { status: 401 });

        const firstRespondersJson: string = JSON.stringify(body?.firstResponders || report.firstResponders);
        const samplerSchemaJson: string = JSON.stringify(body?.samplerSchema || report.samplerSchema);
        const abcdeSchemaJson: string = JSON.stringify(body?.abcdeSchema || report.abcdeSchema);
        const patientInfoJson: string = JSON.stringify(body?.patientInfo || report.patientInfo);
        const missionInfoJson: string = JSON.stringify(body?.missionInfo || report.missionInfo);

        const updatedReport = await db.report.update({
            where: { id },
            data: {
                firstResponders: firstRespondersJson,
                samplerSchema: samplerSchemaJson,
                abcdeSchema: abcdeSchemaJson,
                patientInfo: patientInfoJson,
                missionInfo: missionInfoJson,
                archived: body?.archived || report.archived,
                resolved: body?.resolved || report.resolved,
                updatedAt: new Date(),
            }
        });

        return new NextResponse(JSON.stringify({ updatedReport }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});