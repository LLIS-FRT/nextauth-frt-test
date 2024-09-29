"use client";

import { useEffect, useState } from 'react'
import { OverlapEvent } from '../CustCalendar/types';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@prisma/client';
import { format } from 'date-fns';

interface OverlapModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedEvent: OverlapEvent | null;
}

interface CreateShiftModalProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    users: User[];
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
                handleBack={() => {
                    setCreateShiftModalOpen((prev) => !prev);
                    setModalOpen((prev) => !prev);
                }}
            />
        </div>
    );
}

export const CreateShiftModal = ({ modalOpen, setModalOpen, users, handleBack }: CreateShiftModalProps) => {
    return (
        <div>
            <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
                <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Shift Creation Modal</DialogTitle>
                        <DialogDescription>

                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant={"outline"} onClick={handleBack}>Back</Button>
                        <Button variant={"default"} onClick={() => setModalOpen((prev) => !prev)}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}