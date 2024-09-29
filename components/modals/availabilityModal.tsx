"use client";

import React, { useEffect, useState } from 'react'
import { AvailabilityEvent } from '../CustCalendar/types';
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Availability, UserRole } from '@prisma/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AvailabilityModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: AvailabilityEvent | null;
  reload?: () => void;
}

export const AvailabilityModal = ({ modalOpen, setModalOpen, selectedEvent, reload }: AvailabilityModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [event, setEvent] = useState<Availability | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!selectedEvent) return;
    const fetchEvent = async () => {
      const res = await fetch(`/api/availability/id/${selectedEvent.id}`);
      const data = await res.json();
      setEvent(data.availability);
      setLoadingEvent(false);
    };
    fetchEvent();
  }, [selectedEvent]);

  if (!selectedEvent) return null;
  const id = selectedEvent.id;

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
    if (!event) return null;
    if (!currentUser) return null;

    const isCurrentUser = event.userId === currentUser.id;
    const isAdmin = currentUser.roles?.includes(UserRole.ADMIN);

    if (!isCurrentUser && !(isCurrentUser || isAdmin)) return null;

    if (!reload) throw new Error("reload is not defined");

    return (
      <>
        {isCurrentUser && <Button variant={"outline"} onClick={onEdit}>Edit</Button>}
        {(isCurrentUser || isAdmin) && <Button variant={"destructive"} onClick={onDelete}>Delete</Button>}
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
          {!loadingEvent && ButtonList() !== null && (
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