"use client";

import { UserRole } from '@prisma/client';
import { useEffect, useState } from 'react';
import moment from 'moment'; // Import if you still plan on using moment
import { EventBgColor, EventType, OverlapEvent } from '@/components/CustCalendar/types';
import Calendar from '@/components/CustCalendar/Calendar';
import ProtectedPageClient from '@/components/auth/protectedPageClient';
import { OverlapModal } from '@/components/modals/overlapModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { getAvailabilities, LimitedAvailability } from '@/actions/data/availability';

const ShiftManagerPage = () => {
  const [availabilities, setAvailabilities] = useState<LimitedAvailability[]>([]);
  const [calEvents, setCalEvents] = useState<EventType[]>([]);

  const [overlapModalOpen, setOverlapModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OverlapEvent | null>(null);

  const user = useCurrentUser();

  const { isLoading: loadingAvailabilities, refetch: refetchAvailabilities } = useQuery({
    queryKey: ["availabilities"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const res = await getAvailabilities(undefined);
      const { availabilities } = res;

      setAvailabilities(availabilities);
      return availabilities;
    },
  })

  useEffect(() => {
    // Determine overlaps after availabilities are loaded
    const overlaps = getOverlapAvailabilities(availabilities);
    
    // Remove duplicate events
    const uniqueEvents = new Map();
    overlaps.forEach((event) => {
      const key = `${event.startDate.getTime()}-${event.endDate.getTime()}`;
      if (!uniqueEvents.has(key)) {
        uniqueEvents.set(key, event);
      }
    });
    const newEvents = Array.from(uniqueEvents.values());

    setCalEvents(newEvents);
  }, [availabilities]);

  if (loadingAvailabilities) return <div>Loading...</div>

  return (
    <div className="h-full w-screen bg-white">
      <Calendar
        onValidate={(slots: { startDate: Date; endDate: Date; }[]) => {
          // Handle validation logic
        }}
        handleEventClick={(event: EventType, type: EventType['type']) => {
          switch (type) {
            case "overlap":
              setOverlapModalOpen(true);
              setSelectedEvent(event as OverlapEvent);
              break;
          }
        }}
        events={calEvents}
        selectable={false}
        showlegend={false}
      />
      <OverlapModal modalOpen={overlapModalOpen} setModalOpen={setOverlapModalOpen} selectedEvent={selectedEvent} currentUser={user} />
    </div>
  );
}

export default ProtectedPageClient(ShiftManagerPage, { allowedRoles: [UserRole.ADMIN], requireAll: false });

const getOverlapAvailabilities = (availabilities: LimitedAvailability[]): EventType[] => {
  const overlaps: EventType[] = [];

  if (availabilities.length < 2) return overlaps;

  // Iterate through availabilities to detect overlaps
  for (let i = 0; i < availabilities.length - 1; i++) {
    const currentAvailability = availabilities[i];
    const currentStart = new Date(currentAvailability.startDate);
    const currentEnd = new Date(currentAvailability.endDate);

    // Check subsequent availabilities for overlap
    for (let j = i + 1; j < availabilities.length; j++) {
      const otherAvailability = availabilities[j];
      const otherStart = new Date(otherAvailability.startDate);
      const otherEnd = new Date(otherAvailability.endDate);

      // Skip past availabilities
      if (moment(currentStart).isSame(moment(), 'day') || moment(currentStart).isBefore(moment())) {
        continue;
      }

      // Calculate the overlap start and end times
      const overlapStart = new Date(Math.max(currentStart.getTime(), otherStart.getTime()));
      const overlapEnd = new Date(Math.min(currentEnd.getTime(), otherEnd.getTime()));

      // Check if there is a valid overlap
      if (overlapStart < overlapEnd &&
        overlapStart >= currentStart && overlapEnd <= currentEnd &&
        overlapStart >= otherStart && overlapEnd <= otherEnd) {

        // Check if this overlap already exists
        let existingOverlap = overlaps.find(overlap =>
          overlap.startDate.getTime() === overlapStart.getTime() &&
          overlap.endDate.getTime() === overlapEnd.getTime()
        );

        if (!existingOverlap) {
          // Create a new event for the overlap
          overlaps.push({
            id: `overlap-${currentAvailability.id}-${otherAvailability.id}`,
            title: `Overlap | Users #: 2`,
            startDate: overlapStart,
            endDate: overlapEnd,
            backgroundColor: EventBgColor.overlap,
            type: 'overlap',
            extendedProps: {
              ids: [currentAvailability.id, otherAvailability.id],
              events: [currentAvailability, otherAvailability]
            }
          });
        } else {
          const existingOverlapExtendedProps = existingOverlap.extendedProps || {};
          // Add availability ids and events to the existing overlap
          if (!existingOverlapExtendedProps.ids.includes(currentAvailability.id)) {
            existingOverlap.title = `Overlap | Users #: ${existingOverlapExtendedProps.ids.length + 1}`;
            existingOverlapExtendedProps.ids.push(currentAvailability.id);
            existingOverlapExtendedProps.events.push(currentAvailability);
          }
          if (!existingOverlapExtendedProps.ids.includes(otherAvailability.id)) {
            existingOverlap.title = `Overlap | Users #: ${existingOverlapExtendedProps.ids.length + 1}`;
            existingOverlapExtendedProps.ids.push(otherAvailability.id);
            existingOverlapExtendedProps.events.push(otherAvailability);
          }
        }
      }
    }
  }

  return overlaps;
};