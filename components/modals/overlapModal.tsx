"use client";

import { useEffect, useState } from 'react'
import { OverlapEvent } from '../CustCalendar/types';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@prisma/client';
import { format } from 'date-fns';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface OverlapModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedEvent: OverlapEvent | null;
}

interface CreateShiftModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    users: User[];
    startDate: Date;
    endDate: Date;
    handleBack: () => void;
}

/**
 * This modal is used to display information on overlapping events.
 * Most notably:
 * The start and end dates of the overlapping events
 * The users that are part of the overlapping events
 * 
 * We also want to be able to create a shift from the overlapping events
 */

export const OverlapModal = ({ modalOpen, setModalOpen, selectedEvent }: OverlapModalProps) => {
    const [createShiftModalOpen, setCreateShiftModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        if (!selectedEvent) return;
        const fetchUsers = async () => {
            const res = await fetch("/api/user/bulk",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedEvent.extendedProps?.events.map((event: { userId: string; }) => event.userId) }),
                    cache: "default",
                }
            );
            const data = await res.json();
            setUsers([...data]);
            setLoadingUsers(false);
        };

        fetchUsers();
    }, [selectedEvent]);

    if (!selectedEvent) return null;

    const { backgroundColor, endDate, id, startDate, title, type } = selectedEvent;

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
                        <DialogDescription className="text-sm text-gray-600">
                            <div className="space-y-4">
                                {/* Event Details */}
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <h3 className="font-medium text-gray-700">Event Details:</h3>
                                    <p>
                                        <span className="font-semibold">Time:</span> {formatDate(selectedEvent.startDate)} | {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                                    </p>
                                </div>

                                {/* Users List */}
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <h3 className="font-medium text-gray-700">Users Involved ({loadingUsers ? "?" : users.length}):</h3>
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
                        </DialogDescription>
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
                handleBack={() => {
                    setCreateShiftModalOpen((prev) => !prev);
                    setModalOpen((prev) => !prev);
                }}
            />
        </div>
    );
}

interface CreateShiftModalSubmitData {
    endDate: Date;
    startDate: Date;
    createdByuserId: string;
    teamId: string;
    userIds: string[];
    userPositions: string[];
}

// TODO:
export const CreateShiftModal = ({ modalOpen, setModalOpen, users, startDate, endDate, handleBack }: CreateShiftModalProps) => {
    const [createdByuserId, setCreatedByuserId] = useState<string>("");
    const [teamId, setTeamId] = useState<string>("");
    const [positions, setPositions] = useState<string[]>([]); // Positions will be fetched
    const [userPositions, setUserPositions] = useState<{ [userId: string]: string }>({});

    // Simulating API call to fetch positions based on the team
    const fetchPositions = async (teamId: string) => {
        // Simulated API call
        // In production, replace this with actual API request to fetch positions for the selected team.
        const fetchedPositions = ["chefAgres", "equipierBin", "stagiaireBin"]; // This will be dynamically fetched
        setPositions(fetchedPositions);
    };

    useEffect(() => {
        if (teamId) {
            fetchPositions(teamId); // Fetch positions after team is selected
        }
    }, [teamId]);

    const handlePositionChange = (userId: string, position: string) => {
        setUserPositions((prev) => ({
            ...prev,
            [userId]: position,
        }));
    };

    const submitData = () => {
        const data: CreateShiftModalSubmitData = {
            startDate,
            endDate,
            createdByuserId,
            teamId,
            userIds: users.map((user) => user.id),
            userPositions: Object.values(userPositions),
        };
        console.log(data);
    };

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
                    <Select onValueChange={setTeamId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Replace with dynamic team data */}
                            <SelectItem value="1">FRT 1</SelectItem>
                            <SelectItem value="2">FRT 2</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Position Selection Label*/}
                    {/* Positions will be displayed only after team is selected */}
                    {teamId && positions.length > 0 && (
                        <div>
                            {users.map((user) => (
                                <div key={user.id} className="space-y-2">
                                    <label className="font-semibold">{user.firstName} {user.lastName}</label>
                                    <Select onValueChange={(value) => handlePositionChange(user.id, value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((position, index) => (
                                                <SelectItem key={index} value={position}>
                                                    {position}
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