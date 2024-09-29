import { Input } from "../ui/input"

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from "react"

interface PasswordFieldProps {
    disabled: boolean;
    field: any;
    placeholder?: string;
    showVisibilityToggle?: boolean;
}

const PasswordField = ({ disabled, placeholder = "******", field, showVisibilityToggle: showPwdVisibilityToggle = true }: PasswordFieldProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isToggleDisabled, setIsToggleDisabled] = useState(false)

    useEffect(() => {
        const isDisabled = disabled || field.value === '' || field.value === undefined || field.disabled;

        setIsToggleDisabled(isDisabled)

        if (isDisabled) {
            setShowPassword(false)
        }
    }, [disabled, field.disabled, field.value])

    return (
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                className='hide-password-toggle pr-10'
                {...field}
                placeholder={placeholder}
                disabled={disabled}
            />
            {showPwdVisibilityToggle && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isToggleDisabled}
                >
                    {showPassword && !disabled ? (
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
            )}

            {/* hides browsers password toggles */}
            <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
        </div>
    )
}

export default PasswordField