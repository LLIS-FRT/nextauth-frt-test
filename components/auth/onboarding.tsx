"use client";

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Klasse } from 'webuntis';
import { FormError } from '@/components/formError';
import { FormSuccess } from '@/components/formSuccess';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingSchema } from '@/schemas';
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { onboarding } from '@/actions/onboarding';
import { useRouter } from 'next/navigation'; // Import useRouter

interface UntisClass {
    id: string;
    name: string;
}

export const Onboarding = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [classes, setClasses] = useState<UntisClass[]>([]);

    const { update } = useSession();
    const [isPending, startTransition] = useTransition();
    const router = useRouter(); // Initialize useRouter

    const user = useCurrentUser();

    const form = useForm<z.infer<typeof OnboardingSchema>>({
        resolver: zodResolver(OnboardingSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
            studentClass: user?.studentClass || "",
        },
    });

    const onSubmit = (values: z.infer<typeof OnboardingSchema>) => {
        startTransition(() => {
            onboarding(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                        setSuccess(undefined);
                    }

                    if (data.success) {
                        update();
                        setSuccess(data.success);
                        setError(undefined);

                        // Redirect the user after success
                        router.push(window.location.search); // Redirect to your desired page
                        router.refresh();
                    }
                })
                .catch(() => setError("Something went wrong. Please try again."));
        });
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('api/classes');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                for (let i = 0; i < data.length; i++) {
                    const c: Klasse = data[i];

                    data[i] = {
                        id: c.id.toString(),
                        name: c.name,
                    };
                }
                setClasses(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
            }
        };

        fetchClasses();
    }, []);

    const disabled = isPending || loading;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="p-8 max-w-lg w-full bg-gray-900 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center">Welcome Onboard</h1>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit((values) => onSubmit(values))}
                    >
                        {/* Student Class Select */}
                        <FormField
                            control={form.control}
                            name="studentClass"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Student Class</FormLabel>
                                    <Select
                                        {...field}
                                        disabled={disabled}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full border-gray-600 text-gray-300 focus:border-indigo-500 transition">
                                            <SelectValue placeholder="Select your class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((classOption) => (
                                                <SelectItem key={classOption.id} value={classOption.id}>
                                                    {classOption.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* First Name and Last Name Inputs */}
                        <div className="flex space-x-4">
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
                                                disabled={disabled}
                                                className="border-gray-600 text-gray-300 placeholder-gray-500 focus:border-indigo-500 transition"
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
                                                disabled={disabled}
                                                className="border-gray-600 text-gray-300 placeholder-gray-500 focus:border-indigo-500 transition"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Two Factor Authentication */}
                        <FormField
                            control={form.control}
                            name="isTwoFactorEnabled"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="cursor-pointer">Two Factor Authentication</FormLabel>
                                        <FormDescription className="text-sm text-gray-400">
                                            Enable two factor authentication for extra security.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            disabled={disabled}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="bg-gray-700 focus:ring-indigo-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Error and Success Messages */}
                        <FormError message={error} />
                        <FormSuccess message={success} />

                        {/* Submit Button */}
                        <Button
                            disabled={disabled}
                            onClick={() => form.handleSubmit((values) => onSubmit(values))}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white py-2 rounded-lg"
                        >
                            Continue
                        </Button>
                    </form>
                </Form>
            </div>
        </div >
    );
};
