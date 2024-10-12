"use server";

import { currentUser, protectedServerAction } from "@/lib/auth";
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
                roles: true,
                removedExams: true,
                removedSubjects: true,
                removedTeachers: true
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

        // Filter exams
        const filteredExams = [];
        for (const exam of exams) {
            const { name, subject, teachers } = exam;
            if (validUser.removedExams.includes(name) || validUser.removedSubjects.includes(subject)) {
                continue;
            }

            if (validUser.removedTeachers.length > 0) {
                if (teachers.some(teacher => validUser.removedTeachers.includes(teacher))) {
                    continue;
                }
            }

            filteredExams.push(exam);
        }

        return {
            // Set allExams to true if we are not filtering by class ID
            allExams: classID ? false : true,
            exams: filteredExams
        };
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER], // Allow admins and teachers
    requireAll: false // Only one of the roles is required
});

export const removeExam = protectedServerAction(
    async ({ removedExams, removedSubjects, removedTeachers, userId }: { removedExams: string[], removedSubjects: string[], removedTeachers: string[], userId: string | null | undefined }) => {
        const user = await currentUser();
        let userToRemoveFromID = userId !== null && userId !== undefined ? userId : user?.id;

        if (!user) throw new Error("User not found");
        const roles = user.roles;
        if (!roles) throw new Error("User not found");

        const isAdmin = roles.includes(UserRole.ADMIN);

        if (userToRemoveFromID !== user.id && !isAdmin) throw new Error("Unauthorized");

        const existingUser = await db.user.findUnique({ where: { id: userToRemoveFromID }, select: { removedExams: true, removedSubjects: true, removedTeachers: true } });
        if (!existingUser) throw new Error("User not found");

        // Check if the removedExams are in the existingUser.removedExams
        const isRemovedExam = existingUser.removedExams.some((removedExam) => removedExams.includes(removedExam));
        if (isRemovedExam) throw new Error("Exam already removed");

        // Check if the removedSubjects are in the existingUser.removedSubjects
        const isRemovedSubject = existingUser.removedSubjects.some((removedSubject) => removedSubjects.includes(removedSubject));
        if (isRemovedSubject) throw new Error("Subject already removed");

        // Check if the removedTeachers are in the existingUser.removedTeachers
        const isRemovedTeacher = existingUser.removedTeachers.some((removedTeacher) => removedTeachers.includes(removedTeacher));
        if (isRemovedTeacher) throw new Error("Teacher already removed");

        const updatedUser = await db.user.update({
            where: { id: userToRemoveFromID },
            data: {
                removedExams: {
                    push: removedExams
                },
                removedSubjects: {
                    push: removedSubjects
                },
                removedTeachers: {
                    push: removedTeachers
                }
            },
            select: {
                removedExams: true,
                removedSubjects: true,
                removedTeachers: true,
                id: true
            }
        })
        return updatedUser;
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});