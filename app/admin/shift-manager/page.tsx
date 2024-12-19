"use client";

import { UserRole_ } from '@prisma/client';
import { useEffect, useState } from 'react';
import moment from 'moment'; // Import if you still plan on using moment
import { EventBgColor, EventType, OverlapEvent, ShiftEvent } from '@/components/CustCalendar/types';
import Calendar from '@/components/CustCalendar/Calendar';
import ProtectedPageClient from '@/components/auth/protectedPageClient';
import { OverlapModal } from '@/components/modals/overlapModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { getAvailabilities, LimitedAvailability } from '@/actions/data/availability';
import { combineAdjacentSlots, ShiftToEvent } from '@/utils/calendar';
import { getShifts, LimitedShift } from '@/actions/data/shift';

interface EventValidationError {
  startDate: Date;
  endDate: Date;
}

interface CreateAvailabilityObj {
  startDate: Date;
  endDate: Date;
  userId: string;
}

interface UpdateAvailabilityObj {
  startDate: Date;
  endDate: Date;
  userId: string;
  id: string;
}

const ShiftManagerPage = () => {
  const [shiftEvents, setShiftEvents] = useState<EventType[]>([]);
  const [overlapEvents, setOverlapEvents] = useState<EventType[]>([]);
  const [calEvents, setCalEvents] = useState<EventType[]>([]);

  const [overlapModalOpen, setOverlapModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OverlapEvent | null>(null);

  const user = useCurrentUser();
  const userID = user?.id;

  const { isLoading: loadingAvailabilities, refetch: refetchAvailabilities, data: availabilities } = useQuery({
    queryKey: ["availabilities", "all"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => (await getAvailabilities(undefined)).availabilities,
  })

  const { isLoading: loadingShifts, refetch: refetchShifts, data: shifts } = useQuery({
    queryKey: ["shifts", "all"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => (await getShifts(undefined)).shifts,
  })

  useEffect(() => {
    // Determine overlaps after availabilities are loaded
    const overlaps = getOverlapAvailabilities(availabilities || [], shifts || []);

    // Remove duplicate events
    const uniqueEvents = new Map();
    overlaps.forEach((event) => {
      const key = `${event.startDate.getTime()}-${event.endDate.getTime()}`;
      if (!uniqueEvents.has(key)) {
        uniqueEvents.set(key, event);
      }
    });
    const newEvents: EventType[] = Array.from(uniqueEvents.values());
    setOverlapEvents(newEvents);
  }, [availabilities, shifts]);

  useEffect(() => {
    // Convert shifts to calendar events
    if (!shifts) return;
    if (!userID) return;
    const shiftEvents = ShiftToEvent(shifts, userID);

    setShiftEvents(shiftEvents);
  }, [shifts, userID]);

  useEffect(() => {
    const combinedEvents = [...overlapEvents, ...shiftEvents];
    setCalEvents(combinedEvents);
  }, [overlapEvents, shiftEvents]);

  if (loadingAvailabilities) return <div>Loading...</div>

  return (
    <div className="bg-white w-full h-full ">
      <div className="mt-2">
        <div className="h-full w-full items-center bg-white justify-center no-scrollbar">
          <Calendar
            onValidate={(slots) => {
              const combinedSlots = combineAdjacentSlots([...slots], false);

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
            selectable={true}
            showlegend={false}
          />
          <OverlapModal modalOpen={overlapModalOpen} setModalOpen={setOverlapModalOpen} selectedEvent={selectedEvent} currentUser={user} />
        </div>
      </div>
    </div>
  );
}

export default ProtectedPageClient(ShiftManagerPage, { allowedRoles: [UserRole_.ADMIN], requireAll: false });

const getOverlapAvailabilities = (availabilities: LimitedAvailability[], shifts: LimitedShift[]): EventType[] => {
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
        let existingOverlap: OverlapEvent | undefined = overlaps.find(overlap =>
          overlap.startDate.getTime() === overlapStart.getTime() &&
          overlap.endDate.getTime() === overlapEnd.getTime()
        ) as OverlapEvent | undefined;

        if (!existingOverlap) {
          // Create a new event for the overlap
          overlaps.push({
            id: `overlap-${currentAvailability.id}-${otherAvailability.id}`,
            title: `Overlap | Users #: 2`,
            startDate: overlapStart,
            endDate: overlapEnd,
            backgroundColor: EventBgColor.overlap,
            type: 'overlap',
            selectable: true,
            extendedProps: {
              availabilityIds: [currentAvailability.id, otherAvailability.id],
              availabilities: [currentAvailability, otherAvailability]
            }
          });
        } else {
          const existingOverlapExtendedProps = existingOverlap.extendedProps || {};
          // Add availability ids and events to the existing overlap
          if (!existingOverlapExtendedProps.availabilityIds.includes(currentAvailability.id)) {
            existingOverlap.title = `Overlap | Users #: ${existingOverlapExtendedProps.availabilityIds.length + 1}`;
            existingOverlapExtendedProps.availabilityIds.push(currentAvailability.id);
            existingOverlapExtendedProps.availabilities.push(currentAvailability);
          }
          if (!existingOverlapExtendedProps.availabilityIds.includes(otherAvailability.id)) {
            existingOverlap.title = `Overlap | Users #: ${existingOverlapExtendedProps.availabilityIds.length + 1}`;
            existingOverlapExtendedProps.availabilityIds.push(otherAvailability.id);
            existingOverlapExtendedProps.availabilities.push(otherAvailability);
          }
        }
      }
    }
  }

  return overlaps;
};