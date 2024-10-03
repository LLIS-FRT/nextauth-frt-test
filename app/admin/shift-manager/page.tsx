"use client";

import { Availability, UserRole, User } from '@prisma/client';
import { useEffect, useState } from 'react';
import moment from 'moment'; // Import if you still plan on using moment
import { EventBgColor, EventType, OverlapEvent } from '@/components/CustCalendar/types';
import Calendar from '@/components/CustCalendar/Calendar';
import ProtectedPageClient from '@/components/auth/protectedPageClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OverlapModal } from '@/components/modals/overlapModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const timeunits = [
  { name: '1', startTime: 800, endTime: 850 },
  { name: '2', startTime: 850, endTime: 940 },
  { name: '3', startTime: 955, endTime: 1045 },
  { name: '4', startTime: 1045, endTime: 1135 },
  { name: '5', startTime: 1135, endTime: 1225 },
  { name: '6', startTime: 1225, endTime: 1315 },
  { name: '7', startTime: 1315, endTime: 1405 },
  { name: '8', startTime: 1420, endTime: 1510 },
  { name: '9', startTime: 1510, endTime: 1600 },
  { name: '10', startTime: 1600, endTime: 1650 },
  { name: '11', startTime: 1650, endTime: 1740 },
  { name: '12', startTime: 1740, endTime: 1830 },
  { name: '13', startTime: 1830, endTime: 1920 },
  { name: '14', startTime: 1920, endTime: 2010 },
  { name: '15', startTime: 2010, endTime: 2100 },
];

const ShiftManagerPage = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [calEvents, setCalEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  const [overlapModalOpen, setOverlapModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OverlapEvent | null>(null);

  const user = useCurrentUser();

  useEffect(() => {
    async function fetchAvailabilities() {
      const res = await fetch('/api/availability');
      const data = await res.json();
      setAvailabilities(data.availabilities);
      setLoading(false);
    };

    fetchAvailabilities();
  }, []);

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

  if (loading) return <div>Loading...</div>

  return (
    <div className="h-full w-screen bg-white">
      <Calendar
        allPossibleTimeUnits={timeunits}
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
      <OverlapModal modalOpen={overlapModalOpen} setModalOpen={setOverlapModalOpen} selectedEvent={selectedEvent} currentUser={user}/>
    </div>
  );
}

export default ProtectedPageClient(ShiftManagerPage, { allowedRoles: [UserRole.ADMIN], requireAll: false });

const getOverlapAvailabilities = (availabilities: Availability[]): EventType[] => {
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