'use client';

import React, { useEffect, useState } from 'react';
import { RoleGate } from "@/components/auth/roleGate";
import CustomCalendar from "@/components/CustCalendar/Calendar";
import { AvailabilityEvent, EventBgColor, EventType, ExamEvent, ShiftEvent, TimeSlotProps } from "@/components/CustCalendar/types";
import { Availability, UserRole } from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import moment from 'moment';
import { Exam } from 'webuntis';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { db } from '@/lib/db';

interface EventValidationError {
  startDate: Date;
  endDate: Date;
}

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

const CalendarPage = () => {
  const [exams, setExams] = useState<EventType[]>([]);
  const [availabilities, setAvailabilities] = useState<EventType[]>([]);

  const [calEvents, setCalEvents] = useState<EventType[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | ExamEvent | AvailabilityEvent | null>(null);

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);

  const [refreshExams, setRefreshExams] = useState(false);
  const [refreshAvailabilities, setRefreshAvailabilities] = useState(false);

  const user = useCurrentUser();

  useEffect(() => {
    const fetchExams = async () => {
      const id = user?.id || user?.IAM;
      const response = await fetch(`/api/exams/${id}`);
      const data = await response.json();

      const exams = data.exams as Exam[];
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
        }
      })

      setExams(examEvents);
    }

    const fetchAvailabilities = async () => {
      const id = user?.id || user?.IAM;
      const response = await fetch(`/api/availability/user/${id}`);
      const data = await response.json();

      const availabilities = data.availabilities as Availability[];

      const availabilityEvents: AvailabilityEvent[] = availabilities.map((availability) => {
        const { startDate, endDate, userId, id } = availability;

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
    }

    fetchExams();
    fetchAvailabilities();
  }, [user?.IAM, user?.id]);

  // Get exams
  useEffect(() => {
    if (!refreshExams) return;
    const fetchExams = async () => {
      const id = user?.id || user?.IAM;
      const response = await fetch(`/api/exams/${id}`);
      const data = await response.json();

      const exams = data.exams as Exam[];
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
        }
      })

      setExams(examEvents);
    }

    fetchExams();
    setRefreshExams(false);
  }, [user?.IAM, user?.id, refreshExams]);

  useEffect(() => {
    if (!refreshAvailabilities) return;
    const fetchAvailabilities = async () => {
      const id = user?.id || user?.IAM;
      const response = await fetch(`/api/availability/user/${id}`);
      const data = await response.json();

      const availabilities = data.availabilities as Availability[];

      const availabilityEvents: AvailabilityEvent[] = availabilities.map((availability) => {
        const { startDate, endDate, userId, id } = availability;

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
    }

    fetchAvailabilities();
    setRefreshAvailabilities(false);
  }, [refreshAvailabilities, user?.IAM, user?.id]);

  useEffect(() => setCalEvents([...availabilities, ...exams]), [availabilities, exams]);

  const handleShowShift = (event: EventType) => {
    setSelectedEvent(event);
    setShiftModalOpen(true);
  };

  const handleShowExam = (event: EventType) => {
    setSelectedEvent(event);
    setExamModalOpen(true);
  };

  const handleShowAvailability = (event: EventType) => {
    setSelectedEvent(event);
    setAvailabilityModalOpen(true);
  };

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
    if (dbAvailabilities.length > 0) {
      const userID = user?.id || user?.IAM;
      if (!userID) throw new Error('User ID not found');

      // Send post request
      fetch(`/api/availability/user/${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbAvailabilities),
      });
    }

    displayErrors(errors);
    setRefreshAvailabilities(true);
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
          <p>Please select a date in the future. The following dates are invalid:</p>
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
    <div className="bg-white max-h-full">
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
            showAvailability={handleShowAvailability}
            showExam={handleShowExam}
            showShift={handleShowShift}
            allPossibleTimeUnits={timeunits}
            onValidate={onValidate}
          />
        </div>

        <ShiftModal modalOpen={shiftModalOpen} setModalOpen={setShiftModalOpen} selectedEvent={selectedEvent as ShiftEvent} />
        <ExamModal modalOpen={examModalOpen} setModalOpen={setExamModalOpen} selectedEvent={selectedEvent as ExamEvent} />
        <AvailabilityModal modalOpen={availabilityModalOpen} setModalOpen={setAvailabilityModalOpen} selectedEvent={selectedEvent as AvailabilityEvent} reload={() => setRefreshAvailabilities((prev) => !prev)} />

      </RoleGate>
    </div>
  );
};

export default CalendarPage;

interface ShiftModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: ShiftEvent | null;
}

interface ExamModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: ExamEvent | null;
}

interface AvailabilityModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedEvent: AvailabilityEvent | null;
  reload: () => void;
}

const ShiftModal = ({ modalOpen, setModalOpen, selectedEvent }: ShiftModalProps) => {
  if (!selectedEvent) return null;

  return (
    <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
      <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shift Modal</DialogTitle>
          <DialogDescription>
            {selectedEvent?.type}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* <Button type="submit">Confirm</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ExamModal = ({ modalOpen, setModalOpen, selectedEvent }: ExamModalProps) => {
  if (!selectedEvent) return null;

  return (
    <Dialog open={modalOpen} onOpenChange={() => setModalOpen((prev) => !prev)}>
      <DialogOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exam Modal</DialogTitle>
          <DialogDescription>
            {selectedEvent?.type}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* <Button type="submit">Confirm</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const AvailabilityModal = ({ modalOpen, setModalOpen, selectedEvent, reload }: AvailabilityModalProps) => {
  const [isEditing, setIsEditing] = useState(false);

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
      reload();
    }
    else {
      setModalOpen((prev) => !prev);
      toast.error(`Deletion failed.`);
    }
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
          <DialogFooter>
            <Button variant={"outline"} onClick={onEdit}>Edit</Button>
            <Button variant={"destructive"} onClick={onDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditAvailabilityModal modalOpen={isEditing} setModalOpen={setIsEditing} selectedEvent={selectedEvent} reload={reload} />
    </div>
  )
}

const EditAvailabilityModal = ({ modalOpen, setModalOpen, selectedEvent }: AvailabilityModalProps) => {
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