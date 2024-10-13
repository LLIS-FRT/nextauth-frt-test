import React from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../ui/input-otp'

const MissionNumber = ({ missionNumber }: { missionNumber?: string }) => {
    if (missionNumber?.length !== 10) return (
        <div className="flex flex-col items-center">
            <InputOTP maxLength={10} disabled value={"INVALID ID"} className="text-2xl p-4">
                {/* Year */}
                <InputOTPGroup className="flex flex-row justify-center">
                    <InputOTPSlot index={0} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={1} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={2} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={3} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />

                    <InputOTPSlot index={4} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={5} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={6} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="flex flex-row justify-center">
                    <InputOTPSlot index={8} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={9} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                </InputOTPGroup>
            </InputOTP>
        </div>
    )

    return (
        <div className="flex flex-col items-center">
            <InputOTP maxLength={10} disabled value={missionNumber} className="text-2xl p-4">
                {/* Year */}
                <InputOTPGroup className="flex flex-row justify-center">
                    <InputOTPSlot index={0} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={1} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={2} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={3} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                </InputOTPGroup>
                {/* Month */}
                <InputOTPGroup className="flex flex-row justify-center">
                    <InputOTPSlot index={4} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={5} className="w-6 h-8 sm:w-12 sm:h-12 sm:text-xl text-xs" />
                </InputOTPGroup>
                {/* Day */}
                <InputOTPGroup className="flex flex-row justify-center">
                    <InputOTPSlot index={6} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={7} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                </InputOTPGroup>
                {/* ID */}
                <InputOTPGroup className="flex flex-row justify-center">
                    <InputOTPSlot index={8} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                    <InputOTPSlot index={9} className="w-6 h-8  sm:w-12 sm:h-12 sm:text-xl text-xs" />
                </InputOTPGroup>
            </InputOTP>
        </div>
    )
}

export default MissionNumber;
