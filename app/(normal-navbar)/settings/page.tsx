"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";

import { SettingsSchema } from "@/schemas";
import {
    Card,
    CardContent,
    CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { settings } from "@/actions/settings";
import {
    Form,
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FormSuccess } from "@/components/formSuccess";
import { FormError } from "@/components/formError";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/ui/multiSelector";
import { UserRole } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { RoleGate } from "@/components/auth/roleGate";
import PasswordField from "@/components/auth/PasswordField";

const formatRole = (role: UserRole) => {
    // Convert the role to a string
    let formattedRole = role.toString();

    // First lets seperate the role into its parts
    const parts = formattedRole.split("_");

    // By default all characters will be capitalized
    // For example: "ADMIN"
    // We only want the first character to be capitalized
    // For example: "Admin"
    // We want to capitalize the first character of each part and lowercase the rest

    // Loop through each part
    for (let i = 0; i < parts.length; i++) {
        // Capitalize the first character
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
    }

    // Join the parts back into a string
    formattedRole = parts.join(" ");

    return formattedRole;
}

const SettingsPage = () => {
    const user = useCurrentUser();

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const { update } = useSession();
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof SettingsSchema>>({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            firstName: user?.firstName || undefined,
            lastName: user?.lastName || undefined,
            IAM: user?.IAM?.toLocaleLowerCase() || undefined,
            email: user?.email || undefined,
            isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
            newPassword: undefined,
            password: undefined,
            roles: user?.roles || [],
        },
    });

    const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
        setError(undefined);
        setSuccess(undefined);

        startTransition(() => {
            settings(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                        setSuccess(undefined);
                    }

                    if (data.success) {
                        update();
                        setSuccess(data.success);
                        setError(undefined);
                    }
                })
                .catch(() => setError("Something went wrong. Please try again."))
        })
    }
    // TODO: Mobile responsive
    return (
        <Card className="w-full sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center">
                    ⚙️ Settings
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="First Name"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Last Name"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="IAM"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IAM</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="DoeJo123"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="john.doe@example.com"
                                                        type="email"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <PasswordField disabled={isPending} field={field} placeholder="******" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <PasswordField disabled={isPending} field={field} placeholder="******" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                            <RoleGate
                                allowedRoles={[UserRole.ADMIN]}
                                requireAll={false}
                                showMessage
                            >
                                <FormField
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Roles</FormLabel>
                                            <MultiSelector
                                                loop
                                                onValuesChange={field.onChange}
                                                values={field.value}
                                                disabled={isPending}
                                            >
                                                <MultiSelectorTrigger>
                                                    <MultiSelectorInput placeholder="Select your roles" />
                                                </MultiSelectorTrigger>
                                                <MultiSelectorContent>
                                                    <MultiSelectorList>
                                                        {Object.values(UserRole).map((role) => (
                                                            <MultiSelectorItem key={role} value={role}>{formatRole(role)}</MultiSelectorItem>
                                                        ))}
                                                    </MultiSelectorList>
                                                </MultiSelectorContent>
                                            </MultiSelector>
                                        </FormItem>
                                    )}
                                />
                            </RoleGate>
                            {user?.isOAuth === false && (
                                <FormField
                                    control={form.control}
                                    name="isTwoFactorEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row justify-between items-center rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Two Factor Authentication</FormLabel>
                                                <FormDescription>
                                                    Enable two factor authentication for your account.</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    disabled={isPending}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                            )}
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button
                            disabled={isPending}
                            type="submit"
                        >
                            Save
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SettingsPage