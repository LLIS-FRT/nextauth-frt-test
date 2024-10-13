import { FirstResponders } from '@/actions/data/types';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getTeams, LimitedTeam } from '@/actions/data/team';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// TODO: Only call handleUpdate once the minimum amount of data has been changed
// TODO: Only require users to enter an IAM, then fetch the users and fill in the rest of the data

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

    // Initialize first responders state from props and set state on change
    const [firstResponders, setFirstRespondersState] = useState<FirstResponders["firstResponders"] | undefined>(firstRespondersData?.firstResponders);

    const { isLoading: loadingTeams, isError: errorTeams, refetch: refetchTeams, data: teams } = useQuery({
        queryKey: ["teams"],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const { teams } = await getTeams(undefined);
            return teams;
        },
    });



    // Get positions of the selected team
    useEffect(() => {
        if (teams && teamId) {
            const team = teams.find(t => t.id === teamId);
            if (team) {
                setPositions(team?.possiblePositions);
                setCurrentTeam(team);
            }
        }
    }, [teams, teamId]);

    // Update the parent state when first responders change
    useEffect(() => {
        const handleUpdate = () => {
            setFirstResponders({
                teamId: teamId ?? '',
                firstResponders: firstResponders ?? []
            });
        };
        
        handleUpdate()
    }, [setFirstRespondersState, setFirstResponders, teamId, firstResponders]);

    const addFirstResponder = () => {
        setFirstRespondersState(prev => [
            ...(prev || []),
            { firstName: '', lastName: '', email: '', position: '', id: '', IAM: '' }
        ]);
    };

    const removeFirstResponder = (index: number) => {
        setFirstRespondersState(prev => {
            if (!prev) return [];
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        });
    };

    const updateFirstResponder = (index: number, field: string, value: string) => {
        setFirstRespondersState(prev => {
            if (!prev) return [];
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Get all selected positions to disable them in the dropdown
    const selectedPositions = firstResponders?.map(responder => responder.position) ?? [];

    // Check if max users limit is reached
    const isMaxUsersReached = currentTeam && firstResponders && firstResponders.length >= currentTeam.maxUsers;

    // Check if the number of responders meets the minimum requirement
    const isMinUsersMet = currentTeam && firstResponders && firstResponders.length >= currentTeam.minUsers;

    if (!teams) return <div className="text-red-500">Missing teams</div>;

    return (
        <div className="mt-2 space-y-4 p-6 bg-gray-50 border border-gray-300 rounded-lg shadow-md max-w-4xl mx-auto w-full">
            {/* Team Selection */}
            <div>
                <label className="text-sm font-medium">Current Team</label>
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
                    <p className="text-sm font-medium">First Responders</p>
                    {firstResponders && firstResponders.length > 0 ? (
                        <div className="space-y-4 mt-1">
                            <Accordion type="single" collapsible defaultValue='responder'>
                                {firstResponders.map((responder, index) => {
                                    // Only allow collapsing if all fields are filled
                                    const canCollapse = responder.firstName !== "" && responder.lastName !== "" && responder.email !== "" && responder.position !== "" && responder.IAM !== "";
                                    const namePart = `${responder.lastName}${responder.lastName.length === 0 ? responder.firstName : ` ${responder.firstName.charAt(0).toUpperCase()}${responder.firstName.length > 0 ? "." : ""}`}`
                                    const triggerText = `${namePart} ${namePart.length === 0 ? "" : responder.position ? `- ${responder.position}` : ""}`
                                    const showDeleteButton = currentTeam && firstResponders.length - 1 >= currentTeam.minUsers;

                                    return (
                                        <AccordionItem key={index} value={`responder`} disabled={disabled}>
                                            {triggerText && <AccordionTrigger disabled={!canCollapse}>{triggerText}</AccordionTrigger>}
                                            <AccordionContent>
                                                <div className="p-4 border border-gray-200 rounded-lg space-y-2">
                                                    {/* Remove button */}
                                                    {showDeleteButton && <Trash2 size={20} color='red' className={cn("cursor-pointer opacity-100 hover:opacity-50 transition-opacity ml-auto",
                                                        disabled ? "opacity-50" : "opacity-100",
                                                        disabled ? "cursor-not-allowed" : "cursor-pointer"
                                                    )} onClick={() => {
                                                        if (!disabled) removeFirstResponder(index)
                                                    }} />}

                                                    <Input
                                                        placeholder="Last Name"
                                                        value={responder.lastName}
                                                        onChange={(e) => updateFirstResponder(index, 'lastName', e.target.value)}
                                                        disabled={disabled}
                                                    />
                                                    <Input
                                                        placeholder="First Name"
                                                        value={responder.firstName}
                                                        onChange={(e) => updateFirstResponder(index, 'firstName', e.target.value)}
                                                        disabled={disabled}
                                                    />
                                                    <Input
                                                        placeholder="Email"
                                                        value={responder.email}
                                                        onChange={(e) => updateFirstResponder(index, 'email', e.target.value)}
                                                        disabled={disabled}
                                                    />

                                                    {/* Position selection with disable logic */}
                                                    <Select
                                                        value={responder.position}
                                                        onValueChange={(value) => updateFirstResponder(index, 'position', value)}
                                                        disabled={disabled}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a position" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {positions?.map((position) => (
                                                                <SelectItem
                                                                    key={position}
                                                                    value={position}
                                                                    disabled={selectedPositions.includes(position)}
                                                                >
                                                                    {position}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        placeholder="IAM"
                                                        value={responder.IAM}
                                                        onChange={(e) => updateFirstResponder(index, 'IAM', e.target.value)}
                                                        disabled={disabled}
                                                    />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        </div>
                    ) : (
                        <div className="mt-2">
                            {!isMinUsersMet && <p className="text-red-500">You need at least {currentTeam?.minUsers} responders.</p>}
                        </div>
                    )}
                </div>
            )}

            {/* Add First Responder Button */}
            {teamId && !isMaxUsersReached && (
                <div className="mt-4">
                    <Button size={"sm"} variant={"secondary"} onClick={addFirstResponder} disabled={disabled || isMaxUsersReached}>
                        Add First Responder
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FirstRespondersForm;
