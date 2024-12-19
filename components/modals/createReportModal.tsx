"use client";

import { getTeams } from '@/actions/data/team';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createReport } from '@/actions/data/report';
import { Button } from '@/components/ui/button';

interface CreateReportModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    reload?: () => void;
}

export const CreateReportModal = ({ modalOpen, setModalOpen, reload }: CreateReportModalProps) => {
    const [teamId, setTeamId] = useState("");

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

            const res = await createReport({
                firstResponders: {
                    teamId,
                    firstResponders: []
                }
            })

            return res;
        },
        onError: () => {
            toast.error("Something went wrong");
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            setModalOpen(false);
            reload?.();

            const report = data?.report;
            if (report) {
                toast.success(`Report created successfully. Mission number: ${report.missionNumber}`);
            }
        },
    })

    const onSubmit = () => {
        server_createReport();
    }

    return (
        <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
            <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
            <DialogContent className="bg-white p-6 rounded-md max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle>Create Report</DialogTitle>
                    <DialogDescription>Fill in the details to create a new report.</DialogDescription>
                    <DialogDescription>NOTE: The report must be created on the same day as the incident.</DialogDescription>
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
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setModalOpen((prev) => !prev)}>Close</Button>
                    <Button variant="default" onClick={onSubmit} disabled={!teamId}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}