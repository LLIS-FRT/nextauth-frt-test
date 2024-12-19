import { protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { untis } from "@/lib/untis";
import { getClasses } from "@/utils/classes";
import { PermissionName, User, UserRole_ } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const getID_IAM = (req: NextRequest): { IAM: boolean, idOrIAM: string } => {
    const pathname = req.nextUrl.pathname;
    const idOrIAM = pathname.split("/").pop();
    if (!idOrIAM) throw new NextResponse("Invalid ID or IAM", { status: 400 });

    // Now we know that idOrIAM is either an ID or an IAM
    // Now we need to check if it's an IAM
    // We do this by checking if the id follows this format:
    // 5 letters followed by 3 numbers

    const iamRegex = /^[a-zA-Z]{5}[0-9]{3}$/;

    if (iamRegex.test(idOrIAM.toLocaleLowerCase())) {
        // It's an IAM
        return {
            IAM: true,
            idOrIAM: idOrIAM.toLocaleLowerCase()
        }
    } else {
        // It's an ID
        return {
            IAM: false,
            idOrIAM: idOrIAM.toLocaleLowerCase()
        }
    }
}

const getUser = async (req: NextRequest): Promise<User | null> => {
    const { IAM, idOrIAM } = getID_IAM(req);
    const user = await db.user.findUnique({
        where: IAM
            ? { IAM: idOrIAM }   // If IAM is true, query using IAM
            : { id: idOrIAM },   // If IAM is false, query using id
    });

    return user;
}

// GET all exams
export const GET = protectedRoute(
    async function GET(req) {
        const validUser = await getUser(req);

        if (!validUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const studentClass = validUser.studentClass;
        await untis.login();

        const currentSchoolYear = await untis.getCurrentSchoolyear(true);

        if (!currentSchoolYear) {
            return new NextResponse("No current school year found", { status: 404 });
        }

        // Get the class id
        const classes = await getClasses();
        if (!classes || classes.length === 0) {
            return new NextResponse("No classes found", { status: 404 });
        }

        let classID = null;
        for (const c of classes) {
            if (c.id.toString() === studentClass.toLocaleLowerCase()) {
                classID = c.id;
                break;
            }
        }

        const rolesThatCanSeeAllExams: UserRole_[] = [UserRole_.ADMIN];

        // To access ALL exams user needs to be an admin
        if (classID === null && !validUser.roles.some(role => rolesThatCanSeeAllExams.includes(role))) {
            return new NextResponse("No class with the name '" + studentClass + "' found", { status: 404 });
        }

        // All exams of all classes
        const exams = await untis.getExamsForRange(currentSchoolYear.startDate, currentSchoolYear.endDate, classID || undefined, true, true);

        const obj = {
            // Set allExams to true if we are not filtering by class ID
            allExams: classID ? false : true,
            exams
        }

        return new NextResponse(JSON.stringify(obj), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.VIEW_ANY_EXAM] 
});

// Post
export const POST = protectedRoute(
    async function POST(req) {
        const body = await req.json();

        const addOrRemove: boolean = body?.addOrRemove ?? true;
        const teacher: string | string[] | undefined = body?.teacher;
        const subject: string | string[] | undefined = body?.subject;
        const examID: string | string[] | undefined = body?.examID;

        const { IAM, idOrIAM } = getID_IAM(req);

        const validUser = await db.user.findUnique({
            where: IAM
                ? { IAM: idOrIAM }   // If IAM is true, query using IAM
                : { id: idOrIAM },   // If IAM is false, query using id
        });

        if (!validUser) return new NextResponse("User not found", { status: 404 });

        const {
            removedExams,
            removedSubjects,
            removedTeachers
        } = validUser;

        const addOrRemoveFromArr = (
            value: string | string[] | undefined,
            arr: string[] | undefined,
            add: boolean | undefined
        ): string[] => {
            // Initialize the array if not provided
            if (arr === undefined) arr = add ? [] : [];

            // Ensure arr is always an array
            if (!Array.isArray(arr)) throw new Error('arr must be an array or undefined');

            // If addOrRemove is undefined, do nothing
            if (add === undefined) return arr;

            // If addOrRemove is not a boolean, throw an error
            if (typeof add !== 'boolean') throw new Error('add must be a boolean or undefined');

            // If value is undefined, do nothing
            if (value === undefined) return arr;

            // If value is a single string, convert it to an array
            if (typeof value === 'string') value = [value];

            // Ensure value is an array
            if (!Array.isArray(value)) throw new Error('value must be a string, an array of strings, or undefined');

            // Handle adding or removing values
            for (const val of value) {
                if (add) {
                    // Add the value if it's not already in the array
                    if (!arr.includes(val)) arr.push(val);
                } else {
                    // Remove the value if it exists in the array
                    arr = arr.filter(item => item !== val);
                }
            }

            // Return the updated array
            return arr;
        };

        // The user can either remove a teacher, subject or exam
        const updatedUser = await db.user.update({
            where: {
                id: validUser.id
            },
            data: {
                removedExams: addOrRemoveFromArr(examID, removedExams, addOrRemove),
                removedSubjects: addOrRemoveFromArr(subject, removedSubjects, addOrRemove),
                removedTeachers: addOrRemoveFromArr(teacher, removedTeachers, addOrRemove),
            }
        })

        return new NextResponse(JSON.stringify(updatedUser), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.UPDATE_OWN_EXAM]
});