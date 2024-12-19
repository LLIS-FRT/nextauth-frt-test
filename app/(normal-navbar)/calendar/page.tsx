'use client';

import React, { useEffect, useState } from 'react';
import { RoleGate } from "@/components/auth/roleGate";
import CustomCalendar from "@/components/CustCalendar/Calendar";
import { AvailabilityEvent, EventBgColor, EventType, ExamEvent, OverlapEvent, ShiftEvent } from "@/components/CustCalendar/types";
import { Availability, UserRole_ } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import moment from 'moment';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AvailabilityModal } from '@/components/modals/availabilityModal';
import { ShiftModal } from '@/components/modals/shiftModal';
import { ExamModal } from '@/components/modals/examModal';
import { getExams } from '@/actions/data/exams';
import { getShifts } from '@/actions/data/shift';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAvailability, deleteAvailability, getAvailabilitiesByUser, updateAvailability } from '@/actions/data/availability';
import { getHolidays } from '@/actions/data/holidays';
import { combineAdjacentSlots, ShiftToEvent } from '@/utils/calendar';

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

const CalendarPage = () => {
  const [exams, setExams] = useState<EventType[]>([]);
  const [availabilities, setAvailabilities] = useState<EventType[]>([]);
  const [shifts, setShifts] = useState<EventType[]>([]);

  const [calEvents, setCalEvents] = useState<EventType[]>([]);
  const [loadingCalEvents, setLoadingCalEvents] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | ExamEvent | AvailabilityEvent | OverlapEvent | null>(null);

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const user = useCurrentUser();
  const id = user?.id || user?.IAM;
  const isIAM = user?.id ? false : true;

  const { refetch: refetchAvailabilitiesByUser, isLoading } = useQuery({
    queryKey: ["availabilities", "user", { userID: id, isIAM }],
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
    queryFn: async () => {
      if (!id) return;
      const availabilities = await getAvailabilitiesByUser(id, isIAM);

      const availabilityEvents: AvailabilityEvent[] = availabilities.map((availability) => {
        const { endDate, startDate, id } = availability;

        return {
          backgroundColor: EventBgColor.Availability,
          endDate: new Date(endDate),
          startDate: new Date(startDate),
          id,
          title: `Availability`,
          type: "availability",
          selectable: true,
          extendedProps: {
            availability
          }
        }
      })

      setAvailabilities(availabilityEvents);

      return availabilities;
    }
  })

  const { refetch: refetchHolidays, isLoading: isLoadingHolidays, data: holidays } = useQuery({
    queryKey: ["holidays"],
    staleTime: Infinity,
    queryFn: async () => {
      const holidays = await getHolidays();

      return holidays;
    }
  })

  const { refetch: refetchShifts, isLoading: isLoadingShifts } = useQuery({
    queryKey: ["shifts"],
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
    queryFn: async () => {
      if (!id || isIAM) return;
      const { shifts } = await getShifts(undefined);

      const shiftEvents = ShiftToEvent(shifts, id);

      setShifts(shiftEvents);
      return shifts;
    },
  })

  const { refetch: refetchExams, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
    queryFn: async () => {
      if (!id) return;
      const { exams } = await getExams({ id, IAM: isIAM });

      const examEvents: EventType[] = exams.map((exam) => {
        const { startTime, endTime, examDate } = exam;

        // Helper function to convert time in 24-hour format (e.g., 800, 850, 1300) to hours and minutes
        const parseTime = (time: number): { hours: number; minutes: number } => {
          const timeStr = time.toString().padStart(4, '0'); // Ensure it's 4 digits
          const hours = parseInt(timeStr.substring(0, 2), 10);
          const minutes = parseInt(timeStr.substring(2), 10);
          return { hours, minutes };
        };

        // Extract the date components (YYYY, MM, DD) from the examDate (YYYYMMDD format)
        const year = Math.floor(examDate / 10000);
        const month = Math.floor((examDate % 10000) / 100) - 1; // Month is zero-indexed in JavaScript Date
        const day = examDate % 100;

        // Parse start and end times
        const { hours: startHours, minutes: startMinutes } = parseTime(startTime);
        const { hours: endHours, minutes: endMinutes } = parseTime(endTime);

        // Create start and end Date objects
        const startDate = new Date(year, month, day, startHours, startMinutes);
        const endDate = new Date(year, month, day, endHours, endMinutes);

        return {
          backgroundColor: EventBgColor.Exam,
          endDate,
          startDate,
          id: `exam-${uuidv4()}`,
          title: `Exam: ${exam.name}`,
          type: "exam",
          selectable: true,
          extendedProps: {
            exam,
          }
        }
      })

      setExams(examEvents);

      return exams;
    }
  })

  const { mutateAsync: server_createAvailability, isPending: isPendingAvailability } = useMutation({
    mutationFn: createAvailability,
    onError: () => {
      toast.error("Failed to create availability");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities"] });
    },
  });

  const { mutateAsync: server_updateAvailability, isPending: isPendingUpdate } = useMutation({
    mutationFn: ({ id, data }: {
      id: string,
      data?: Omit<Availability, "id" | "confirmed" | "confirmedAt" | "confirmedByuserId">
    }) => updateAvailability(id, data),
    onError: () => {
      toast.error("Failed to create availability");
    },
    onSuccess: () => {
      // Invalidate the specific query to refresh the availabilities for the user
      queryClient.invalidateQueries({ queryKey: ["availabilities", "user", { userID: id, isIAM }] });
    }
  });

  const { mutateAsync: server_deleteAvailability, isPending: isPendingDelete } = useMutation({
    mutationFn: deleteAvailability,
    onError: () => {
      toast.error("Failed to create availability");
    },
    onSuccess: () => {
      // Invalidate the specific query to refresh the availabilities for the user
      queryClient.invalidateQueries({ queryKey: ["availabilities", "user", { userID: id, isIAM }] });
    }
  });

  // Set calendar events whenever availabilities or exams change
  useEffect(() => {
    setLoadingCalEvents(true);
    setCalEvents([...availabilities, ...exams, ...shifts]);
    setLoadingCalEvents(false);
  }, [availabilities, exams, shifts]);

  // Broken
  // TODO: Fix
  const onValidate = (slots: { startDate: Date; endDate: Date; }[]) => {
    const errors: EventValidationError[] = [];
    const newEvents: EventType[] = [];

    if (slots.length === 0) {
      return;
    }

    const combinedSlots = combineAdjacentSlots([...slots], true);
    const dbAvailabilities: Availability[] = [];

    combinedSlots.forEach(slot => {
      dbAvailabilities.push({
        confirmed: false,
        endDate: slot.endDate,
        startDate: slot.startDate,
      } as Availability);

      const event = convertFromSlotToEvent(slot, errors);
      if (event !== null) newEvents.push(event);
    });

    // If the dbAvailabilities array is not empty, save it to the database
    if (dbAvailabilities.length > 0 && errors.length === 0) {
      const userId = user?.id;
      if (!userId) throw new Error('User ID not found');

      const existingAvailabilities: EventType[] = [...availabilities]; // Clone existing availabilities to modify
      const availabilitiesToBeCreated: CreateAvailabilityObj[] = []; // New availabilities to be created
      const availabilitiesToBeUpdated: UpdateAvailabilityObj[] = []; // Existing availabilities to be updated
      const availabilitiesToBeDeleted: string[] = []; // Existing availabilities to be deleted

      // Helper function to check if two availabilities can be merged
      const canCombine = (avail1: Availability, avail2: EventType): Boolean => {
        // Combine if availabilities overlap or are adjacent
        return (
          new Date(avail1.endDate) >= new Date(avail2.startDate) && // End date of avail1 is after start date of avail2
          new Date(avail2.endDate) >= new Date(avail1.startDate) && // End date of avail2 is after start date of avail1
          new Date(avail1.startDate) <= new Date(avail2.endDate) && // Start date of avail1 is before end date of avail2
          new Date(avail2.startDate) <= new Date(avail1.endDate) // Start date of avail2 is before end date of avail1
        );
      };

      // Merge two availabilities into one
      const mergeAvailabilities = (avail1: Availability, avail2: EventType): Availability => {
        return {
          startDate: new Date(Math.min(new Date(avail1.startDate).getTime(), new Date(avail2.startDate).getTime())),
          endDate: new Date(Math.max(new Date(avail1.endDate).getTime(), new Date(avail2.endDate).getTime())),
          userId, // Assuming both availabilities belong to the same user
          id: avail2.id, // Keep the existing availability ID for updating
          confirmed: false,
          confirmedAt: null,
          confirmedByuserId: null,
        };
      };

      // Check and combine new availabilities with existing ones
      dbAvailabilities.forEach(newAvailability => {
        let mergedAvailability: Availability = newAvailability;
        const mergedWith = []; // Track merged availabilities
        let hasMerged = false;
        let foundMerge;

        // Repeatedly try to merge until no more merges can be found
        do {
          foundMerge = false;

          for (let i = 0; i < existingAvailabilities.length; i++) {
            const existingAvailability = existingAvailabilities[i];

            if (canCombine(mergedAvailability, existingAvailability)) {
              // Merge the availabilities
              mergedAvailability = mergeAvailabilities(mergedAvailability, existingAvailability);

              // Add the merged availability to the list of mergedWith
              mergedWith.push(existingAvailability);

              // Remove the merged availability from the list
              existingAvailabilities.splice(i, 1);

              // Set flags and break to re-check from the beginning
              foundMerge = true;
              hasMerged = true;
              break;
            }
          }
        } while (foundMerge);

        // After all merges are done, add the mergedAvailability back to existingAvailabilities for future merges
        if (hasMerged) {
          existingAvailabilities.push({
            backgroundColor: EventBgColor.Availability,
            endDate: mergedAvailability.endDate,
            id: mergedAvailability.id,
            startDate: mergedAvailability.startDate,
            title: 'Availability',
            type: 'availability',
            selectable: true,
            extendedProps: {
              availability: mergedAvailability
            }
          });  // Add latest merged result back for future merges

          availabilitiesToBeUpdated.push(mergedAvailability);

          // Check if more than one availability was merged
          if (mergedWith.length > 1) {
            const toDelete = mergedWith.slice(0, -1).map(availability => availability.id);
            availabilitiesToBeDeleted.push(...toDelete);
          }
        } else {
          availabilitiesToBeCreated.push(newAvailability);
        }
      });


      // Create completely new availabilities
      for (const availability of availabilitiesToBeCreated) {
        server_createAvailability({
          endDate: availability.endDate,
          startDate: availability.startDate,
          userId
        });
      }

      // Update existing availabilities
      for (const availability of availabilitiesToBeUpdated) {
        server_updateAvailability({
          id: availability.id,
          data: {
            endDate: availability.endDate,
            startDate: availability.startDate,
            userId
          }
        });
      }

      // Delete existing availabilities
      for (const availabilityId of availabilitiesToBeDeleted) {
        server_deleteAvailability(availabilityId);
      }
    }

    displayErrors(errors);
    refetchAvailabilitiesByUser();
  };

  // Function to convert a slot to an event
  const convertFromSlotToEvent = (slot: { startDate: Date; endDate: Date; }, errors: EventValidationError[]): EventType | null => {
    if (slot.startDate.getTime() < new Date().getTime()) {
      errors.push({
        startDate: slot.startDate,
        endDate: slot.endDate,
      });
      return null;
    } else {
      const uuid = uuidv4();
      if (!id) throw new Error('User ID not found');
      return {
        backgroundColor: EventBgColor.Availability,
        endDate: slot.endDate,
        startDate: slot.startDate,
        id: uuid,
        selectable: true,
        title: "Availability",
        type: "availability",
      };
    }
  };

  // Function to display errors
  const displayErrors = (errors: EventValidationError[]) => {
    if (errors.length > 0) {
      const html = (
        <div>
          <p>Please select a date in the future. The following date{errors.length > 1 ? 's are' : ' is'} invalid:</p>
          <ul>
            {errors.map((err, index) => (
              <li key={index} style={{ paddingLeft: '20px' }}>
                {moment(err.startDate).format(`MMM. DD YYYY [from] HH:mm [to] ${moment(err.endDate).format("HH:mm")}`)}
              </li>
            ))}
          </ul>
        </div>
      );

      toast.error(html);
    }
  };

  return (
    <div className="bg-white h-full w-full">
      <RoleGate
        allowedRoles={[
          UserRole_.ADMIN,
          UserRole_.MEMBER,
        ]}
      >
        <div className="h-full w-full items-center bg-white justify-center no-scrollbar">
          <hr className="w-full border-gray-300" />
          <CustomCalendar
            events={calEvents}
            holidays={holidays}
            handleEventClick={(event: EventType, type: EventType['type']) => {
              switch (type) {
                case "availability":
                  setAvailabilityModalOpen(true);
                  setSelectedEvent(event);
                  break;
                case "shift":
                  setShiftModalOpen(true);
                  setSelectedEvent(event);
                  break;
                case "exam":
                  setExamModalOpen(true);
                  setSelectedEvent(event);
                  break;
              }
            }}
            onValidate={onValidate}
            selectable={!loadingCalEvents && !isLoading && !isPendingAvailability}
          />
        </div>

        {shiftModalOpen && <ShiftModal modalOpen={shiftModalOpen} setModalOpen={setShiftModalOpen} selectedEvent={selectedEvent as ShiftEvent} />}
        {examModalOpen && <ExamModal modalOpen={examModalOpen} setModalOpen={setExamModalOpen} selectedEvent={selectedEvent as ExamEvent} refetch={() => refetchExams()} />}
        {availabilityModalOpen && <AvailabilityModal modalOpen={availabilityModalOpen} setModalOpen={setAvailabilityModalOpen} selectedEvent={selectedEvent as AvailabilityEvent} reload={() => refetchAvailabilitiesByUser()} />}
      </RoleGate>
    </div>
  );
};

export default CalendarPage;