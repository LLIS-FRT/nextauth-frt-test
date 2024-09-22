// "use client";

// import * as z from 'zod';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { LoginSchema } from '@/schemas';
// import { Input } from '@/components/ui/input';
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form';
// import { CardWrapper } from '@/components/auth/cardWrapper';
// import { Button } from '@/components/ui/button';
// import { FormError } from '@/components/formError';
// import { FormSuccess } from '@/components/formSuccess';
// import { login } from '@/actions/login';
// import { useState, useTransition } from 'react';
// import { useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp';

// export const LoginForm = () => {
//     const searchParams = useSearchParams();
//     const callbackUrl = searchParams?.get('callbackUrl') || undefined;
//     const urlError = searchParams?.get('error') === "OAuthAccountNotLinked"
//         ? "Email already in use with another provider"
//         : ""
//     const [showTwoFA, setShowTwoFA] = useState<boolean>(false);
//     const [error, setError] = useState<string | undefined>("");
//     const [success, setSuccess] = useState<string | undefined>("");
//     const [isPending, startTransition] = useTransition();
//     const form = useForm<z.infer<typeof LoginSchema>>({
//         resolver: zodResolver(LoginSchema),
//         defaultValues: {
//             email: '',
//             password: '',
//         },
//     })
//     const onSubmit = (values: z.infer<typeof LoginSchema>) => {
//         setError("");
//         setSuccess("");
//         startTransition(() => {
//             login(values, callbackUrl)
//                 .then((data) => {
//                     if (data?.error) {
//                         form.reset();
//                         setError(data.error);
//                     }
//                     if (data?.success) {
//                         form.reset();
//                         setSuccess(data.success);
//                     }
//                     if (data?.twoFactor) {
//                         setShowTwoFA(true);
//                     }
//                 })
//                 .catch(() => setError("Something went wrong. Please try again."))
//         })
//     }
//     return (
//         <CardWrapper
//             headerLabel="Welcome back"
//             backButtonLabel="Don't have an account?"
//             backButtonHref="/auth/register"
//             showSocial
//         >
//             <Form {...form}>
//                 <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className="space-y-6"
//                 >
//                     <div className="space-y-4">
//                         {showTwoFA && (
//                             <div className="flex justify-center">
//                                 <FormField
//                                     control={form.control}
//                                     name="code"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className='justify-center flex'>Two Factor Authentication</FormLabel>
//                                             <FormControl>
//                                                 <InputOTP
//                                                     {...field}
//                                                     maxLength={6}
//                                                     minLength={6}
//                                                 >
//                                                     <InputOTPGroup>
//                                                         <InputOTPSlot index={0} />
//                                                         <InputOTPSlot index={1} />
//                                                         <InputOTPSlot index={2} />
//                                                     </InputOTPGroup>
//                                                     <InputOTPSeparator />
//                                                     <InputOTPGroup>
//                                                         <InputOTPSlot index={3} />
//                                                         <InputOTPSlot index={4} />
//                                                         <InputOTPSlot index={5} />
//                                                     </InputOTPGroup>
//                                                 </InputOTP>
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         )}
//                         {!showTwoFA && (
//                             <>
//                                 <FormField
//                                     control={form.control}
//                                     name="email"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Email</FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     {...field}
//                                                     disabled={isPending}
//                                                     placeholder='john.doe@example.com'
//                                                     type='email'
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="password"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Password</FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     {...field}
//                                                     disabled={isPending}
//                                                     placeholder='******'
//                                                     type='password'
//                                                 />
//                                             </FormControl>
//                                             <Button
//                                                 size={"sm"}
//                                                 variant={"link"}
//                                                 asChild
//                                                 className="px-0 font-normal"
//                                             >
//                                                 <Link href="/auth/reset">
//                                                     Forgot password?
//                                                 </Link>
//                                             </Button>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </>
//                         )}
//                     </div>
//                     <FormError message={error || urlError} />
//                     <FormSuccess message={success} />
//                     <Button
//                         disabled={isPending}
//                         type='submit'
//                         className='w-full'
//                     >
//                         {showTwoFA ? "Confirm" : "Sign in with Credentials"}
//                     </Button>
//                 </form>
//             </Form>
//         </CardWrapper>
//     )
// }
"use client";

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { CardWrapper } from '@/components/auth/cardWrapper';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/formError';
import { FormSuccess } from '@/components/formSuccess';
import { login } from '@/actions/login';
import { useState, useTransition, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp';
import { BeatLoader } from "react-spinners";

export const LoginForm = ({ closeModal }: { closeModal?: () => void }) => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get('callbackUrl') || undefined;
    const urlError = searchParams?.get('error') === "OAuthAccountNotLinked"
        ? "Email already in use with another provider"
        : "";
    const [showTwoFA, setShowTwoFA] = useState<boolean>(false);
    const [stage, setStage] = useState<'email' | 'password' | 'twoFA'>('email');
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            code: '',
        },
    });

    const onSubmit = useCallback((values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        if (stage === 'email') {
            setStage('password');
        } else if (stage === 'password') {
            startTransition(() => {
                login(values, callbackUrl)
                    .then((data) => {
                        console.log(data)
                        if (data?.error) {
                            form.resetField('password');
                            setError(data.error);
                        }
                        if (data?.success) {
                            form.reset();
                            setSuccess(data.success);
                        }
                        if (data?.twoFactor) {
                            setStage('twoFA');
                            setShowTwoFA(true);
                        }

                        if (!data) if (closeModal !== undefined) closeModal();
                    })
                    .catch(() => setError("Something went wrong. Please try again."));
            });
        } else if (stage === 'twoFA') {
            startTransition(() => {
                login(values, callbackUrl)
                    .then((data) => {
                        if (data?.error) {
                            form.resetField('code');
                            setError(data.error);
                        }
                        if (data?.success) {
                            form.reset();
                            setSuccess(data.success);
                        }
                    })
                    .catch(() => setError("Something went wrong. Please try again."));
            });
        }
    }, [stage, callbackUrl, form, closeModal]);

    useEffect(() => {
        if (stage === 'twoFA') {
            const subscription = form.watch((values) => {
                const code = values.code;
                if (code?.length === 6) {
                    form.handleSubmit(onSubmit)();
                }
            });
            return () => subscription.unsubscribe();
        }
    }, [form, onSubmit, stage]);

    return (
        <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        {stage === 'email' && (
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder='john.doe@example.com'
                                                type='email'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {stage === 'password' && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder='******'
                                                type='password'
                                            />
                                        </FormControl>
                                        <Button
                                            size={"sm"}
                                            variant={"link"}
                                            asChild
                                            className="px-0 font-normal"
                                        >
                                            <Link href="/auth/reset">
                                                Forgot password?
                                            </Link>
                                        </Button>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {stage === 'twoFA' && (
                            <div className="flex justify-center">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='justify-center flex mb-5'>Two Factor Authentication</FormLabel>
                                            <FormControl>
                                                {isPending ? (
                                                    <div className="flex justify-center">
                                                        <BeatLoader size={15} />
                                                    </div>
                                                ) : (
                                                    <InputOTP
                                                        {...field}
                                                        maxLength={6}
                                                        minLength={6}
                                                        disabled={isPending}
                                                    >
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                        </InputOTPGroup>
                                                        <InputOTPSeparator />
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                    <FormError message={error || urlError} />
                    <FormSuccess message={success} />

                    {stage !== 'twoFA' && (
                        <Button
                            disabled={isPending}
                            type='submit'
                            className='w-full'
                        >
                            {stage === 'email' && "Continue"}
                            {stage === 'password' && "Login"}
                        </Button>
                    )}
                </form>
            </Form>
        </CardWrapper >
    );
};