'use client';

import React, { useEffect, useState } from 'react';
import { RoleGate } from "@/components/auth/roleGate";
import CustomCalendar from "@/components/CustCalendar/Calendar";
import { AvailabilityEvent, EventBgColor, EventType, ExamEvent, OverlapEvent, ShiftEvent } from "@/components/CustCalendar/types";
import { Availability, UserRole } from "@prisma/client";
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
import { timeunits } from '@/constants';
import { getHolidays } from '@/actions/data/holidays';

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
      if (!id) return;
      const { shifts } = await getShifts(undefined);

      const shiftEvents: ShiftEvent[] = shifts.map((shift) => {
        const { startDate, endDate, id } = shift;

        return {
          backgroundColor: EventBgColor.coveredWithUser,
          endDate: new Date(endDate),
          startDate: new Date(startDate),
          shiftType: 'coveredWithUser',
          type: "shift",
          title: `Shift`,
          extendedProps: {
            shift: shift
          },
          id
        }
      })

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

    const sortedSlots = sortSlots(slots);
    const combinedSlots = combineSlotsWithBreaks([...sortedSlots], errors);

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
      const canCombine = (avail1: Availability, avail2: EventType) => {
        // Combine if availabilities overlap or are adjacent
        return (
          new Date(avail1.endDate) >= new Date(avail2.startDate) && // End date of avail1 is after start date of avail2
          new Date(avail2.endDate) >= new Date(avail1.startDate) && // End date of avail2 is after start date of avail1
          new Date(avail1.startDate) <= new Date(avail2.endDate) && // Start date of avail1 is before end date of avail2
          new Date(avail2.startDate) <= new Date(avail1.endDate) // Start date of avail2 is before end date of avail1
        );
      };

      // Merge two availabilities into one
      const mergeAvailabilities = (avail1: Availability, avail2: EventType) => {
        return {
          startDate: new Date(Math.min(new Date(avail1.startDate).getTime(), new Date(avail2.startDate).getTime())),
          endDate: new Date(Math.max(new Date(avail1.endDate).getTime(), new Date(avail2.endDate).getTime())),
          userId, // Assuming both availabilities belong to the same user
          id: avail2.id // Keep the existing availability ID for updating
        };
      };

      // TODO: BIG ISSUE, deletes all availabilities when creating a new one

      // Check and combine new availabilities with existing ones
      // Check and combine new availabilities with existing ones
      dbAvailabilities.forEach(newAvailability => {
        let mergedAvailability = newAvailability;
        let hasMerged = false;

        // Keep merging with existing availabilities until no more can be merged
        let i = 0;
        while (i < existingAvailabilities.length) {
          const existingAvailability = existingAvailabilities[i];

          if (canCombine(mergedAvailability, existingAvailability)) {
            // Merge the availabilities
            mergedAvailability = mergeAvailabilities(mergedAvailability, existingAvailability);

            // Remove the existing availability from the list
            existingAvailabilities.splice(i, 1);
            hasMerged = true;

            // Reset index to recheck all existing availabilities
            i = 0;
          } else {
            i++; // Only increment if no merge
          }
        }

        // After finishing all merges, decide whether to update or create
        if (hasMerged) {
          availabilitiesToBeUpdated.push(mergedAvailability); // Push fully merged availability

          // Check for deletions
          existingAvailabilities.forEach(existing => {
            const fullyCovers =
              new Date(mergedAvailability.startDate) <= new Date(existing.startDate) &&
              new Date(mergedAvailability.endDate) >= new Date(existing.endDate);

            // Only delete existing availabilities that are fully covered and are not the one being updated
            if (fullyCovers && existing.id !== mergedAvailability.id) {
              availabilitiesToBeDeleted.push(existing.id); // Mark for deletion
            }
          });
        } else {
          availabilitiesToBeCreated.push(newAvailability); // If no merge, create new one
        }
      });

      console.log({ availabilitiesToBeCreated, availabilitiesToBeUpdated, availabilitiesToBeDeleted });

      for (const availability of availabilitiesToBeCreated) {
        server_createAvailability({
          endDate: availability.endDate,
          startDate: availability.startDate,
          userId
        });
      }

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

      for (const availabilityId of availabilitiesToBeDeleted) {
        // Assuming you have a function to delete availabilities
        server_deleteAvailability(availabilityId);
      }
    }

    displayErrors(errors);
    refetchAvailabilitiesByUser();
  };

  // Function to identify breaks based on timeunits
  const identifyBreaks = () => {
    const breaks: { startTime: string; endTime: string; }[] = [];

    for (let i = 0; i < timeunits.length - 1; i++) {
      const currentEnd = timeunits[i].endTime;
      const nextStart = timeunits[i + 1].startTime;

      // Convert 900, 950, 1300 to 09:00, 09:50, 13:00
      const formatTime = (time: number) => {
        const hours = Math.floor(time / 100);
        const minutes = time % 100;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      const formattedEnd = formatTime(currentEnd);
      const formattedStart = formatTime(nextStart);

      // Check if there is a break
      if (currentEnd < nextStart) {
        breaks.push({ startTime: formattedEnd, endTime: formattedStart });
      }
    }

    return breaks;
  };

  // Function to sort slots by start date
  const sortSlots = (slots: { startDate: Date; endDate: Date; }[]) => {
    return [...slots].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  };

  // Function to add breaks to slots
  const combineSlotsWithBreaks = (
    slots: { startDate: Date; endDate: Date }[],
    errors: EventValidationError[]
  ) => {
    const combinedSlots: { startDate: Date; endDate: Date }[] = [];
    const breaks: { startTime: string; endTime: string }[] = identifyBreaks(); // Assumes this is pre-implemented and works 100%

    if (slots.length === 0) return combinedSlots;

    let currentStartDate = slots[0].startDate;
    let currentEndDate = slots[0].endDate;

    const formatTime = (time: string, slotDate: Date) => {
      const year = slotDate.getFullYear();
      const month = slotDate.getMonth();
      const day = slotDate.getDate();
      const [hours, minutes] = time.split(':');
      return new Date(year, month, day, parseInt(hours), parseInt(minutes));
    }

    const isSlotInBreak = (endDate: Date) => {
      const isBreak = breaks.some(breakTime => {
        const breakStart = formatTime(breakTime.startTime, endDate);
        const breakStartTime = breakStart.getTime();
        const endDateTime = endDate.getTime();

        return breakStartTime == endDateTime;
      });

      return isBreak;
    }

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];

      // If the current slot overlaps with or touches the previous one, combine them
      if (slot.startDate <= currentEndDate) {
        // Extend the end of the combined slot if the new slot ends later
        currentEndDate = new Date(Math.max(currentEndDate.getTime(), slot.endDate.getTime()));
      } else {
        // Push the current combined slot before starting a new one
        if (slots.length > 1) combinedSlots.push({ startDate: currentStartDate, endDate: currentEndDate });

        // Start a new combined slot
        currentStartDate = slot.startDate;
        currentEndDate = slot.endDate;
      }

      // Check if the slot's end is at the start of a break and include the break
      if (isSlotInBreak(currentEndDate)) {
        const breakInfo = breaks.find(b => formatTime(b.startTime, currentEndDate).getTime() === currentEndDate.getTime());
        if (breakInfo) {
          currentEndDate = formatTime(breakInfo.endTime, currentEndDate); // Extend the end to cover the break
        }
      }
    }

    // Push the last combined slot
    combinedSlots.push({ startDate: currentStartDate, endDate: currentEndDate });

    return combinedSlots;
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
      return {
        backgroundColor: EventBgColor.Availability,
        endDate: slot.endDate,
        startDate: slot.startDate,
        id: uuidv4(),
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
          UserRole.ADMIN,
          UserRole.MEMBER,
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