import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { protectedRoute } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// Disable automatic body parsing as formidable will handle it.
export const config = {
    api: {
        bodyParser: false,
    },
};

const upload = (req: NextRequest) => {
    // Access the raw Node.js request object.
    const nodeReq = req as NextRequest;

    const form = new IncomingForm();

    return new Promise((resolve, reject) => {
        form.parse(nodeReq as any, (err, fields, files) => {
            if (err) {
                reject(
                    new Response(
                        JSON.stringify({ message: 'Error parsing form data' }),
                        { status: 500 }
                    )
                );
                return;
            }

            // If no file is uploaded or the file field is missing, reject the request.
            if (!files.file || Array.isArray(files.file)) {
                reject(
                    new Response(
                        JSON.stringify({ message: 'No valid file uploaded' }),
                        { status: 400 }
                    )
                );
                return;
            }

            const file = files.file as File;
            const tempPath = file.filepath;

            // Define the path where the image will be saved
            const uploadDir = path.join(process.cwd(), 'user-content', 'uploads');

            // Ensure the upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Save the file using a timestamp-based name
            const fileName = `${Date.now()}-${file.originalFilename}`;
            const filePath = path.join(uploadDir, fileName);

            // Move the file to the desired directory
            fs.rename(tempPath, filePath, (err) => {
                if (err) {
                    reject(
                        new Response(
                            JSON.stringify({ message: 'Error saving file' }),
                            { status: 500 }
                        )
                    );
                    return;
                }

                // Construct the public URL for the uploaded image
                const fileUrl = `/user-content/${fileName}`;

                // Return the file URL in the response
                resolve(new NextResponse(JSON.stringify({ url: fileUrl }), { status: 200 }));
            });
        });
    });
}

export const POST = protectedRoute(async function POST(req) {
    const result = await upload(req);

    return new NextResponse("Not implemented yet", { status: 200 });
}, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});