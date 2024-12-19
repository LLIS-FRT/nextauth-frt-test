"use client";

import React, { useEffect, useState } from 'react'
import { AvailabilityEvent } from '../CustCalendar/types';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Availability, OldUserRole } from '@prisma/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getAvailabilities } from '@/actions/data/availability';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AvailabilityModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: AvailabilityEvent | null;
  reload?: () => void;
}

export const AvailabilityModal = ({ modalOpen, setModalOpen, selectedEvent, reload }: AvailabilityModalProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const currentUser = useCurrentUser();
  const id = selectedEvent?.id;

  const queryClient = useQueryClient();

  const { isLoading: loadingAvailability, refetch: refetchAvailability, data: availability } = useQuery({
    queryKey: ["availabilities", "single", { id }],
    staleTime: 1000 * 60 * 5,
    enabled: !!id, // Ensure the query is only triggered if id is present
    queryFn: async () => {
      console.log("Here 2")
      const res = await getAvailabilities(id);
      const { availabilities } = res;
      return availabilities[0]; // Return the specific availability
    },
  });


  if (!selectedEvent) return null;

  const onEdit = () => {
    setIsEditing((prev) => !prev);
    setModalOpen((prev) => !prev);

    toast.warning(`Edit is not implemented yet. ID: ${id}`);
  }

  const onDelete = async () => {
    // Make api call
    const res = await fetch(`/api/availability/id/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setModalOpen((prev) => !prev);
      if (reload) reload();
    }
    else {
      setModalOpen((prev) => !prev);
      toast.error(`Deletion failed.`);
    }
  }

  const ButtonList = () => {
    const isCurrentUser = availability?.userId === currentUser?.id;
    const isAdmin = currentUser?.roles?.includes(OldUserRole.ADMIN);

    if (!reload) throw new Error("reload is not defined");

    const canDelete = (isCurrentUser || isAdmin) && !loadingAvailability;
    const canEdit = isCurrentUser && !loadingAvailability;

    return (
      <>
        {canEdit ?
          <Button variant={"outline"} onClick={onEdit}>Edit</Button>
          : <Button variant={"outline"} disabled>Edit</Button>
        }
        <Button variant={"destructive"} onClick={onDelete} disabled={!canDelete}>Delete</Button>
      </>
    )
  }

  return (
    <div>
      <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
        <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Availability Modal</DialogTitle>
            <DialogDescription>
              {selectedEvent?.type}
            </DialogDescription>
          </DialogHeader>
          {ButtonList() !== null && (
            <DialogFooter>
              <ButtonList />
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <EditAvailabilityModal modalOpen={isEditing} setModalOpen={setIsEditing} selectedEvent={selectedEvent} reload={reload} />
    </div>
  )
}

export const EditAvailabilityModal = ({ modalOpen, setModalOpen, selectedEvent, reload }: AvailabilityModalProps) => {
  if (!selectedEvent) return null;

  return (
    <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
      <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Availability Edit Modal</DialogTitle>
          <DialogDescription>
            {selectedEvent?.type}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setModalOpen((prev) => !prev)}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}