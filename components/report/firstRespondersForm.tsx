import { FirstResponders } from '@/actions/data/types';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getTeams, LimitedTeam } from '@/actions/data/team';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import IamInput from '../IamInput';

const validateIAM = (iam: string) => {
    if (!iam) return { valid: false, message: "" };
    if (iam.length !== 8) return { valid: false, message: "IAM must be 8 characters long" };

    // First 5 characters must be lowercase letters
    if (!/^[a-z]+$/.test(iam.substring(0, 5))) return { valid: false, message: "First 5 characters must be letters" };

    // Last 3 characters must be digits
    if (!/^[0-9]+$/.test(iam.substring(5))) return { valid: false, message: "Last 3 characters must be digits" };

    return { valid: true, message: "" };
}

const FirstRespondersForm = ({
    firstRespondersData,
    setFirstResponders,
    disabled
}: {
    firstRespondersData: FirstResponders | undefined,
    setFirstResponders: React.Dispatch<React.SetStateAction<FirstResponders | undefined>>,
    disabled: boolean
}) => {
    const [teamId, setTeamId] = useState<string | undefined>(firstRespondersData?.teamId);
    const [currentTeam, setCurrentTeam] = useState<LimitedTeam | undefined>();
    const [positions, setPositions] = useState<string[] | undefined>();
    const [firstRespondersState, setFirstRespondersState] = useState<{ [position: string]: { IAM: string, user: any, error: string } }>({});

    const { data: teams } = useQuery({
        queryKey: ["teams"],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => (await getTeams(undefined)).teams
    });

    useEffect(() => {
        if (teams && teamId) {
            const team = teams.find(t => t.id === teamId);
            if (team) {
                const possiblePositions = team?.possiblePositions;
                setPositions(possiblePositions);
                setCurrentTeam(team);
            }
        }
    }, [teams, teamId]);

    useEffect(() => {
        setFirstResponders({
            teamId: teamId ?? '',
            firstResponders: Object.values(firstRespondersState).map(data => ({
                IAM: data.IAM,
                ...data.user,
            }))
        });
    }, [firstRespondersState, teamId, setFirstResponders]);

    useEffect(() => {
        if (positions && currentTeam) {
            const minUsers = currentTeam.minUsers || 0;

            setFirstRespondersState(prevState => {
                const newState = { ...prevState };

                positions.forEach((position, index) => {
                    const isIAMrequired = index < minUsers;

                    if (isIAMrequired && !newState[position]?.IAM) {
                        newState[position] = {
                            IAM: '',
                            user: { firstName: '', lastName: '', email: '', position, id: '' },
                            error: "IAM is required"
                        };
                    }
                });

                return newState;
            });
        }
    }, [positions, currentTeam]);

    if (!teams) return <div className="text-red-500">Missing teams</div>;

    return (
        <div className="space-y-4 w-full select-none">
            {/* Team Selection */}
            <div>
                <Label>Current Team</Label>
                <div className="mt-1">
                    <Select value={teamId} onValueChange={setTeamId} disabled={disabled}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(team => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* First Responders List */}
            {teamId && (
                <div>
                    <Label>First Responders</Label>
                    <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                        {positions?.map((position, i) => {
                            const responder = firstRespondersState[position] || { IAM: '', user: {}, error: '' };
                            const user = responder.user;
                            const firstName = user?.firstName ?? '';
                            const lastName = user?.lastName ?? '';
                            const hasAtLeastOneCharacter = firstName.length > 0 || lastName.length > 0;
                            const fullNameStr = hasAtLeastOneCharacter ? `(${firstName} ${lastName})` : '';

                            const isIamRequired = i < (currentTeam?.minUsers || 0);

                            const displayLabel = `${position} ${fullNameStr}`;
                            return (
                                <div key={i}>
                                    <IamInput
                                        label={displayLabel}
                                        value={responder.IAM}
                                        onChange={(iam, user, error) => {
                                            setFirstRespondersState(prevState => ({
                                                ...prevState,
                                                [position]: { IAM: iam, user, error }
                                            }));
                                        }}
                                        disabled={disabled}
                                        iamRequired={isIamRequired}
                                    />
                                    {responder.user?.firstName && (
                                        <div className="text-sm mt-2">
                                            <p><strong>Name:</strong> {responder.user.firstName} {responder.user.lastName}</p>
                                            <p><strong>Email:</strong> {responder.user.email}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                </div>
            )}
        </div>
    );
};

export default FirstRespondersForm;