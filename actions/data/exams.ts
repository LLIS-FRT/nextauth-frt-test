"use server";

import { protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { untis } from "@/lib/untis";
import { getClasses } from "@/utils/classes";
import { UserRole } from "@prisma/client";
import { Exam } from "webuntis";

interface GetExamsProps {
    id: string;
    IAM: boolean;
}

interface GetExamsResponse {
    allExams: boolean;
    exams: Exam[];
}

export const getExams = protectedServerAction(
    async ({ id, IAM }: GetExamsProps): Promise<GetExamsResponse> => {
        const validUser = await db.user.findUnique({
            where: IAM
                ? { IAM: id }   // If IAM is true, query using IAM
                : { id, },   // If IAM is false, query using id
            select: {
                studentClass: true,
                roles: true
            }
        });

        if (!validUser) throw new Error("User not found");

        const studentClass = validUser.studentClass;
        await untis.login();

        const currentSchoolYear = await untis.getCurrentSchoolyear(true);

        if (!currentSchoolYear) throw new Error("No current school year found");

        // Get the class id
        const classes = await getClasses();
        if (!classes || classes.length === 0) throw new Error("No classes found");

        let classID = null;
        for (const c of classes) {
            if (c.id.toString() === studentClass.toLocaleLowerCase()) {
                classID = c.id;
                break;
            }
        }

        const rolesThatCanSeeAllExams: UserRole[] = [UserRole.ADMIN];

        // To access ALL exams user needs to be an admin
        if (classID === null && !validUser.roles.some(role => rolesThatCanSeeAllExams.includes(role))) {
            throw new Error("No class with the name '" + studentClass + "' found");
        }

        // All exams of all classes
        const exams = await untis.getExamsForRange(currentSchoolYear.startDate, currentSchoolYear.endDate, classID || undefined, true, true);

        return {
            // Set allExams to true if we are not filtering by class ID
            allExams: classID ? false : true,
            exams
        };
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER], // Allow admins and teachers
    requireAll: false // Only one of the roles is required
});