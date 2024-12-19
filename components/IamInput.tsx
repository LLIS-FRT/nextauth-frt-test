import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { getUser } from '@/actions/data/user';
import { Label } from '@/components/ui/label';

interface IamInputProps {
    disabled?: boolean;
    value: string;
    onChange: (value: string, user: any, error: string) => void;
    label?: string;
    iamRequired?: boolean;
}

const validateIAM = (iam: string) => {
    if (!iam) return { valid: false, message: "" };
    if (iam.length !== 8) return { valid: false, message: "IAM must be 8 characters long" };

    // First 5 characters must be lowercase letters
    if (!/^[a-z]+$/.test(iam.substring(0, 5))) return { valid: false, message: "First 5 characters must be letters" };

    // Last 3 characters must be digits
    if (!/^[0-9]+$/.test(iam.substring(5))) return { valid: false, message: "Last 3 characters must be digits" };

    return { valid: true, message: "" };
};

const IamInput = ({ disabled, value, onChange, label = "IAM",iamRequired = false }: IamInputProps) => {
    const [iam, setIam] = useState(value);
    const [error, setError] = useState('');
    const [iamCache, setIamCache] = useState<{ [iam: string]: any }>({});

    const { isPending: loadingUser, mutateAsync: fetchUser } = useMutation({
        mutationFn: getUser,
    });

    const handleChange = async (newIam: string) => {
        setIam(newIam);
        const validation = validateIAM(newIam);
        setError(validation.message);

        if (iamRequired && !newIam) {
            setError("IAM is required");
            onChange(newIam, null, "IAM is required");
            return;
        }

        if (validation.valid) {
            if (iamCache[newIam]) {
                onChange(newIam, iamCache[newIam], "");
            } else {
                try {
                    const { user } = await fetchUser({ userIAM: newIam });
                    setIamCache((prevCache) => ({ ...prevCache, [newIam]: user || null }));
                    setError(user ? "" : "IAM does not exist");
                    onChange(newIam, user, user ? "" : "IAM does not exist");
                } catch {
                    setError("Failed to fetch user data");
                    onChange(newIam, null, "Failed to fetch user data");
                }
            }
        } else {
            onChange(newIam, null, validation.message);
        }
    };

    useEffect(() => {
        if (iam) handleChange(iam);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iamRequired]);

    return (
        <div>
            <Label htmlFor="iamInput">{label}</Label>
            <Input
                id="iamInput"
                placeholder="IAM"
                minLength={8}
                maxLength={8}
                value={iam}
                onChange={(e) => handleChange(e.target.value.toLowerCase())}
                disabled={disabled}
                className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default IamInput;
