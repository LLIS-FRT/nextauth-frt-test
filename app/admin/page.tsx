"use client";

import { admin } from "@/actions/admin";
import { PermissionGate } from "@/components/auth/permissionGate";
import ProtectedPageClient from "@/components/auth/protectedPageClient";
import { FormSuccess } from "@/components/formSuccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OldUserRole, PermissionName } from "@prisma/client";
import { toast } from "sonner";

const AdminPage = () => {
    const onServerActionClick = () => {
        admin()
            .then((data) => {
                if (data?.error) {
                    toast.error(data.error)
                }

                if (data?.success) {
                    toast.success(data.success)
                }
            })
    }

    const onApiRouteClick = () => {
        fetch("/api/admin")
            .then((response) => {
                if (response.ok) {
                    toast.success("Allowed API Route!");
                } else {
                    toast.error("Denied API Route!");
                }
            })
    }

    // TODO: Mobile responsive
    return (
        <Card className="w-full sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center">
                    🔑 Admin
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <PermissionGate
                    allowedPermissions={[
                        PermissionName.ADMINISTRATOR
                    ]}
                    showMessage
                >
                    <FormSuccess message="You are allowed to view this content!" />
                </PermissionGate>
                <div className="flex flex-row justify-between items-center rounded-lg border p-3 shadow-md">
                    <p className="text-sm font-medium">
                        Admin-only API Route
                    </p>
                    <Button onClick={onApiRouteClick}>
                        Click to test
                    </Button>
                </div>
                <div className="flex flex-row justify-between items-center rounded-lg border p-3 shadow-md">
                    <p className="text-sm font-medium">
                        Admin-only Server Action
                    </p>
                    <Button onClick={onServerActionClick}>
                        Click to test
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProtectedPageClient(AdminPage, { allowedRoles: [OldUserRole.ADMIN], requireAll: false });