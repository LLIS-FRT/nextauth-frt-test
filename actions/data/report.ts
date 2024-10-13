"use server";

import { currentUser, protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { Report as ReportTypePrisma, UserRole } from "@prisma/client";
import { Report, AbcdeSchema, SamplerSchema, FirstResponders, MissionInfo, PatientInfo, GetReportsProps, GetReportsResponse, CreateReportResponse } from "./types";

const reportHasUser = (report: ReportTypePrisma, userId: string) => {
    const { createdById, firstResponders } = report;

    if (createdById === userId) return true;

    const firstRespondersString = JSON.stringify(firstResponders)
    console.log({ firstResponders });
    console.log({ firstRespondersString });
    return firstRespondersString.includes(userId)
}

export const generateMissionNumber = async () => {
    const reports = await db.report.findMany({ select: { id: true } });
    // Mission number must be structured like this: YYYYMMDDXX
    // where XX is a number between 01 and 99 and matches the number of reports for the day
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const prefix = `${year}${month}${day}`;
    let suffix = "01";
    const reportLength = reports.length;
    if (reportLength >= 99) throw new Error("Too many reports for the day");
    if (reportLength >= 9) suffix = "0" + (reportLength + 1).toString();
    if (reportLength < 9) suffix = "0" + (reportLength + 1).toString();
    const finalString = prefix + suffix;

    return Number(finalString);
}

const convertPrismaReportToReport = (report: ReportTypePrisma): Report => {
    const abcdeSchema: AbcdeSchema = JSON.parse(JSON.stringify(report.abcdeSchema));
    const samplerSchema: SamplerSchema = JSON.parse(JSON.stringify(report.samplerSchema));
    const firstResponders: FirstResponders = JSON.parse(JSON.stringify(report.firstResponders));
    const patientInfo: PatientInfo = JSON.parse(JSON.stringify(report.patientInfo));
    const missionInfo: MissionInfo = JSON.parse(JSON.stringify(report.missionInfo));

    const data = {
        id: report.id,
        missionNumber: report.missionNumber,
        createdById: report.createdById,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        archived: report.archived,
        resolved: report.resolved,
        abcdeSchema,
        samplerSchema,
        patientInfo,
        firstResponders,
        missionInfo
    }

    return data;
}

export const getReports = protectedServerAction(
    async ({ missionNumber }: GetReportsProps): Promise<GetReportsResponse> => {
        const user = await currentUser();
        if (!user || !user.roles) throw new Error("User not found");
        const { roles: currentUserRoles, id: currentUserId } = user;

        const isAdmin = currentUserRoles.includes(UserRole.ADMIN);

        // If mission number is provided, fetch the specific report
        if (missionNumber) {
            const numMissionNumber = Number(missionNumber);

            const report = await db.report.findFirst({
                where: { missionNumber: numMissionNumber }
            });
            if (!report) throw new Error("Report not found");

            const parsedReport = convertPrismaReportToReport(report);

            // Admins can access any report; other users need to be associated with the report
            if (isAdmin || reportHasUser(report, currentUserId)) {
                return { reports: [parsedReport] };
            }

            throw new Error("Unauthorized");
        } else {
            // Fetch all reports and filter them for non-admins
            const reports = await db.report.findMany();
            if (!reports || reports.length === 0) throw new Error("No reports found");

            // Admins can see all reports; others only see those relevant to them
            const filteredReports = isAdmin
                ? reports
                : reports.filter((report) => reportHasUser(report, currentUserId));

            if (filteredReports.length === 0) throw new Error("No reports found");

            const parsedReports = filteredReports.map(convertPrismaReportToReport);
            return { reports: parsedReports };
        }
    },
    {
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
        requireAll: false
    }
);
export const createReport = protectedServerAction(
    async ({ abcdeSchema, firstResponders, missionInfo, patientInfo, samplerSchema, }: Omit<Report, "id" | "createdById" | "createdAt" | "updatedAt" | "archived" | "resolved" | "missionNumber">): Promise<CreateReportResponse> => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");
        const currentUserRoles = user.roles;
        if (!currentUserRoles) throw new Error("User not found");
        const currentUserId = user.id;
        const isAdmin = currentUserRoles.includes(UserRole.ADMIN);

        // We start by generating the mission number
        const missionNumber = await generateMissionNumber();

        const jsonAbcdeSchema = JSON.stringify(abcdeSchema);
        const jsonSamplerSchema = JSON.stringify(samplerSchema);
        const jsonPatientInfo = JSON.stringify(patientInfo);
        const jsonFirstResponders = JSON.stringify(firstResponders);
        const jsonMissionInfo = JSON.stringify(missionInfo);

        // Check if the currentUserId is in the firstResponders array
        const existsInFirstResponders = firstResponders?.firstResponders.some((firstResponder) => firstResponder.id === currentUserId);

        if (!existsInFirstResponders && !isAdmin) {
            throw new Error("Unauthorized");
        } else {

            const report = await db.report.create({
                data: {
                    abcdeSchema: jsonAbcdeSchema,
                    samplerSchema: jsonSamplerSchema,
                    patientInfo: jsonPatientInfo,
                    missionInfo: jsonMissionInfo,
                    firstResponders: jsonFirstResponders,
                    createdById: currentUserId,
                    missionNumber,
                    archived: false,
                    resolved: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            const parsedReport = convertPrismaReportToReport(report);

            return { report: parsedReport, };
        }
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER], // Allow admins and teachers
    requireAll: false // Only one of the roles is required
})