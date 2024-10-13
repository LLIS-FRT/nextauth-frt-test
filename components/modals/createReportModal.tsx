"use client";

import { getTeams } from '@/actions/data/team';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createReport } from '@/actions/data/report';

interface CreateReportModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    reload?: () => void;
}

export const CreateReportModal = ({ modalOpen, setModalOpen, reload }: CreateReportModalProps) => {
    const [teamId, setTeamId] = useState("");
    const [positions, setPositions] = useState<string[]>([]);

    const queryClient = useQueryClient();

    const { isLoading: loadingTeams, isError: errorTeams, refetch: refetchTeams, data: teams } = useQuery({
        queryKey: ["teams"],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const { teams } = await getTeams(undefined);

            return teams;
        },
    })

    const { mutate: server_createReport } = useMutation({
        mutationFn: async () => {
            const currentTeam = teams?.find((team) => team.id === teamId);
            if (!currentTeam) return;

            await createReport({})
        },
        onError: () => {
            toast.error("Something went wrong");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            setModalOpen(false);
            reload?.();
        },
    })

    useEffect(() => {
        if (teamId) {
            const teamPositions = teams?.find((team) => team.id === teamId)?.possiblePositions || [];
            const filteredPositions = teamPositions.filter((position): position is string => typeof position === "string");
            setPositions(filteredPositions);
        }
    }, [teamId, teams]);

    return (
        <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
            <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
            <DialogContent className="bg-white p-6 rounded-md max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle>Create Shift</DialogTitle>
                    <DialogDescription>Fill in the details to create a new shift.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Team Selection */}
                    {loadingTeams ? (
                        <div>Loading...</div>
                    ) : errorTeams ? (
                        <div>Error...</div>
                    ) : (
                        <Select onValueChange={setTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams?.map((team) => (
                                    <SelectItem key={team.id} value={team.id}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Position Selection Label */}
                    {teamId && positions.length > 0 && (
                        <div>
                            <div className="space-y-2">
                                <Select >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((position, index) => (
                                            <SelectItem
                                                key={index}
                                                value={position}
                                            >
                                                {position}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    {/* <Button variant="outline" onClick={handleBack}>Back</Button> */}
                    {/* <Button variant="default" onClick={submitData}>Create</Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}