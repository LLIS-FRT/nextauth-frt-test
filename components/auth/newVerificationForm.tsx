"use client";

import React, { useState, useEffect } from 'react';
import { CardWrapper } from "@/components/auth/cardWrapper";
import { useSearchParams } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { newVerification } from '@/actions/newVerification';
import { FormSuccess } from '@/components/formSuccess';
import { FormError } from '@/components/formError';

export const NewVerificationForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [otpValue, setOtpValue] = useState<string[]>(Array(8).fill(''));
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // If the token is provided, split it into the OTP slots
  useEffect(() => {
    const onSubmit = (otp: string) => {
      if (success || error) return;

      newVerification(otp)
        .then((data) => {
          setSuccess(data.success);
          setError(data.error);
        })
        .catch(() => {
          setError("Something went wrong. Please try again.");
        });
    };

    if (token && token.length === 8) {
      setOtpValue(token.split(''));
      setIsLocked(true);  // Lock the inputs if token is provided
      onSubmit(token);  // Call checkOTP if token is provided
    }
  }, [error, success, token]);
  // Handler to update OTP input
  const handleOtpChange = (newOtp: string) => {
    const otpArray = newOtp.split('').slice(0, 8);
    setOtpValue(otpArray);

    const onSubmit = (otp: string) => {
      if (success || error) return;

      newVerification(otp)
        .then((data) => {
          setSuccess(data.success);
          setError(data.error);
        })
        .catch(() => {
          setError("Something went wrong. Please try again.");
        });
    };

    if (otpArray.length === 8) {
      setIsLocked(true);
      onSubmit(newOtp);  // Call the checkOTP function when OTP is complete
    }
  };

  return (
    <div>
      <CardWrapper
        headerLabel='Confirming your verification'
        backButtonLabel='Back to login'
        backButtonHref='/auth/login'
      >
        <div className='flex items-center w-full justify-center'>
          {!success && !error && (
            <InputOTP
              value={otpValue.join('')}
              maxLength={8}
              minLength={8}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              onChange={(e) => handleOtpChange(e)}
              disabled={isLocked}  // Disable the input if isLocked is true
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          )}
          <FormSuccess message={success} />
          {!success && <FormError message={error} />}
        </div>
      </CardWrapper >
    </div >
  );
};
