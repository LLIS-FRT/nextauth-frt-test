"use client";

import { useEffect, useState } from 'react'
import { OverlapEvent } from '../CustCalendar/types';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Availability, Team, User } from '@prisma/client';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ExtendedUser } from '@/next-auth';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createShift } from '@/actions/data/shift';
import { createAvailability, deleteAvailability } from '@/actions/data/availability';
import { getTeams, LimitedTeam } from '@/actions/data/team';

interface OverlapModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedEvent: OverlapEvent | null;
    currentUser: ExtendedUser | undefined;
}

interface CreateShiftModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    createdByuserId: string | undefined;
    users: User[];
    startDate: Date;
    endDate: Date;
    availabilities: Availability[];
    handleBack: () => void;
}

interface CreateShiftModalSubmitData {
    endDate: Date;
    startDate: Date;
    createdByuserId: string;
    teamId: string;
    shiftUsers: { userId: string; position: string }[];
}

/**
 * This modal is used to display information on overlapping events.
 * Most notably:
 * The start and end dates of the overlapping events
 * The users that are part of the overlapping events
 * 
 * We also want to be able to create a shift from the overlapping events
 */
export const OverlapModal = ({ modalOpen, setModalOpen, selectedEvent, currentUser }: OverlapModalProps) => {
    const [createShiftModalOpen, setCreateShiftModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        if (!selectedEvent) return;
        const fetchUsers = async () => {
            const res = await fetch("/api/user/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: selectedEvent.extendedProps?.events.map((event: { userId: string; }) => event.userId) }),
                cache: "default",
            });
            const data = await res.json();
            setUsers([...data]);
            setLoadingUsers(false);
        };

        fetchUsers();
    }, [selectedEvent]);

    if (!selectedEvent) return null;

    const { endDate, startDate } = selectedEvent;

    const handleCreateShift = () => {
        setCreateShiftModalOpen((prev) => !prev);
        setModalOpen((prev) => !prev);
    };

    const formatDate = (date: Date) => {
        return format(date, "yyyy MMM. dd");
    };

    const formatTime = (date: Date) => {
        return format(date, "HH:mm");
    };

    return (
        <div>
            <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
                <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
                <DialogContent className="max-w-lg p-6 bg-white rounded-lg shadow-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Event Overlap Details</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-gray-500">Display information on overlapping events.</DialogDescription>
                        <div className="text-sm text-gray-600">
                            <div className="space-y-4">
                                {/* Event Details */}
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <div className="font-medium text-gray-700">Event Details:</div>
                                    <div>
                                        <span className="font-semibold">Time:</span> {formatDate(selectedEvent.startDate)} | {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                                    </div>
                                </div>

                                {/* Users List */}
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <div className="font-medium text-gray-700">Users Involved ({loadingUsers ? "?" : users.length}):</div>
                                    {loadingUsers ? (
                                        <div className="text-sm text-gray-500">Loading users...</div>
                                    ) : (
                                        <ul className="list-disc list-inside space-y-2 mt-2">
                                            {users.length > 0 ? (
                                                users.map((user) => (
                                                    <li key={user.id} className="text-sm text-gray-700">
                                                        {user.lastName} {user.firstName?.charAt(0)}.
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-gray-500">No users available</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button variant="default" onClick={handleCreateShift}>
                            Create Shift
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Overlap Shift Modal */}
            <CreateShiftModal
                modalOpen={createShiftModalOpen}
                setModalOpen={setCreateShiftModalOpen}
                users={users}
                startDate={startDate}
                endDate={endDate}
                createdByuserId={currentUser?.id}
                availabilities={selectedEvent.extendedProps?.events}
                handleBack={() => {
                    setCreateShiftModalOpen((prev) => !prev);
                    setModalOpen((prev) => !prev);
                }}
            />
        </div>
    );
}

const formatPositionName = (position: string): string => {
    let formattedPosition = position;

    // The position is camelCase
    // we get this: "chefAgres" -> "Chef Agres"
    formattedPosition = formattedPosition
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (str) => str.toUpperCase());


    // If ends in bin, add a "." to the end
    if (formattedPosition.toLocaleLowerCase().endsWith("bin")) formattedPosition += ".";

    return formattedPosition;
}

export const CreateShiftModal = ({ modalOpen, setModalOpen, users, startDate, endDate, handleBack, createdByuserId, availabilities }: CreateShiftModalProps) => {
    const [teams, setTeams] = useState<LimitedTeam[]>([]);
    const [teamId, setTeamId] = useState<string>("");
    const [positions, setPositions] = useState<string[]>([]);
    const [userPositions, setUserPositions] = useState<{ [userId: string]: string }>({});

    const queryClient = useQueryClient();

    const { mutateAsync: server_createShift } = useMutation({
        mutationFn: createShift,
        onSuccess: () => {
            toast.success("Shift created successfully");
            setModalOpen(false);

            queryClient.invalidateQueries({ queryKey: ["shifts"] });
        },
        onError: () => {
            toast.error("Failed to create shift");
        }
    });

    const { mutateAsync: server_createAvailability } = useMutation({
        mutationFn: createAvailability,
        onError: () => toast.error("Failed to create availability"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["availabilities"] })
    });

    const { mutateAsync: server_deleteAvailability } = useMutation({
        mutationFn: deleteAvailability,
        onError: () => toast.error("Failed to delete availability"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["availabilities"] }),
    });

    const { isLoading: loadingTeams, refetch: refetchTeams } = useQuery({
        queryKey: ["teams"],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const { teams } = await getTeams(undefined);

            setTeams(teams);
            return teams;
        },
    })

    useEffect(() => {
        if (!modalOpen) {
            setTeamId("");
            setUserPositions({});
            setPositions([]);
        }
    }, [modalOpen]);

    useEffect(() => {
        if (teamId) {
            const teamPositions = teams.find((team) => team.id === teamId)?.possiblePositions || [];
            const filteredPositions = teamPositions.filter((position): position is string => typeof position === "string");
            setPositions(filteredPositions);
        }
    }, [teamId, teams]);

    if (!createdByuserId) return null;
    const handlePositionChange = (userId: string, position: string) => {
        setUserPositions((prev) => {
            if (prev[userId] === position) {
                // Deselect the position
                const { [userId]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [userId]: position,
            };
        });
    };

    const submitData = async () => {
        if (!teamId) {
            toast.error("Please select a team");
            return;
        }

        const missingPositions = users.filter((user) => !userPositions[user.id]);
        if (missingPositions.length > 0) {
            toast.error(`Please assign a position for the following user(s): ${missingPositions.map((user) => `${user.firstName} ${user.lastName}`).join(", ")}`);
            return;
        }

        const data: CreateShiftModalSubmitData = {
            startDate,
            endDate,
            createdByuserId,
            teamId,
            shiftUsers: users.map((user) => ({
                userId: user.id,
                position: userPositions[user.id],
            })),
        };

        await server_createShift({
            createdByuserId: data.createdByuserId,
            endDate: data.endDate,
            startDate: data.startDate,
            teamId: data.teamId,
            userIds: data.shiftUsers.map((user) => user.userId),
            userPositions: data.shiftUsers.map((user) => user.position),
        });

        // We now look at the different availabilities
        for (const availability of availabilities) {
            const { startDate: availabilityStartDate, endDate: availabilityEndDate, userId } = availability;
            const { startDate: shiftStartDate, endDate: shiftEndDate } = data;

            const newAvailabilities = [];
            // This is to check if the availability starts before
            const startsBefore = availabilityStartDate < shiftStartDate && availabilityStartDate != shiftStartDate;

            // This is to check if the availability ends after
            const endsAfter = shiftEndDate < availabilityEndDate && shiftEndDate != availabilityEndDate;

            if (startsBefore) newAvailabilities.push({
                startDate: availabilityStartDate,
                endDate: shiftStartDate,
                userId
            });

            if (endsAfter) newAvailabilities.push({
                startDate: shiftEndDate,
                endDate: availabilityEndDate,
                userId
            });

            await server_deleteAvailability(availability.id);

            for (const newAvailability of newAvailabilities) {
                await server_createAvailability(newAvailability);
            }
        }
    };

    const selectedPositions = Object.values(userPositions);

    if (loadingTeams) return <div>Loading...</div>;

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
                    ) : (
                        <Select onValueChange={setTeamId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
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
                            {users.map((user) => (
                                <div key={user.id} className="space-y-2">
                                    <label className="font-semibold">{user.lastName} {user.firstName?.charAt(0).toLocaleUpperCase()}.</label>
                                    <Select onValueChange={(value) => handlePositionChange(user.id, value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((position, index) => (
                                                <SelectItem
                                                    key={index}
                                                    value={position}
                                                    disabled={selectedPositions.includes(position) && userPositions[user.id] !== position} // Disable if already selected by another user
                                                >
                                                    {formatPositionName(position)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button variant="default" onClick={submitData}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
