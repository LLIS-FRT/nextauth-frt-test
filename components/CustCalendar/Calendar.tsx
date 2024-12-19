import React, { useState, useRef } from 'react';
import { getWeekDays, isBeforeNow, formatDate, formatTime } from './utils';
import { CalendarProps, EventType, Slot, TimeUnit } from './types';
import WeekHeader from './WeekHeader';
import TimeColumn from './TimeColumn';
import DayColumn from './DayColumn';
import Legend from './Legend';
import { timeunits as allPossibleTimeUnits } from '@/constants'
import { Holiday } from 'webuntis';

//#region Calendar Component
const Calendar: React.FC<CalendarProps> = ({
  onValidate,
  events,
  handleEventClick,
  autoSubmit = false,
  weekends = false,
  showlegend = true,
  selectable = true,
  holidays = []
}) => {
  const [selectedSlots, setSelectedSlots] = useState<{ slot: TimeUnit; day: Date }[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleValidate = () => {
    const formattedSlots = selectedSlots.map(({ slot, day }) => {
      const startDate = new Date(day);
      const endDate = new Date(day);
      const startHours = Math.floor(slot.startTime / 100);
      const startMinutes = slot.startTime % 100;
      startDate.setHours(startHours, startMinutes, 0, 0);
      const endHours = Math.floor(slot.endTime / 100);
      const endMinutes = slot.endTime % 100;
      endDate.setHours(endHours, endMinutes, 0, 0);
      return { startDate, endDate };
    });
    onValidate(formattedSlots);
    setSelectedSlots([]);
  };

  const handleValidateDelete = () => setSelectedSlots([]);

  if (events) for (let i = 0; i < events.length; i++) for (let j = i + 1; j < events.length; j++) if (events[i].id === events[j].id) throw new Error(`Duplicate event ID: ${events[i].id}`);

  autoSubmit ? selectedSlots.length > 0 && (handleValidate()) : null
  const weekDays = getWeekDays(currentWeek, weekends);

  const getEventsForDay = (day: Date, events?: EventType[]) => {
    const allEvents = events || [];

    const filteredEvents: EventType[] = [];

    for (const event of allEvents) {
      const { backgroundColor, endDate, startDate, id, title, type } = event;

      if (startDate.toDateString() === day.toDateString() && endDate.toDateString() === day.toDateString()) {

        if (type === 'availability') {
          filteredEvents.push({
            backgroundColor,
            endDate,
            startDate,
            id,
            title,
            type: 'availability',
            selectable: event.selectable,
            extendedProps: event.extendedProps,
          });
        } else if (type === 'exam') {
          filteredEvents.push({
            backgroundColor,
            endDate,
            startDate,
            id,
            title,
            type: 'exam',
            selectable: event.selectable,
            extendedProps: event.extendedProps,
          });
        } else if (type === 'shift') {
          filteredEvents.push({
            backgroundColor,
            endDate,
            startDate,
            id,
            title,
            type: 'shift',
            selectable: event.selectable,
            shiftType: event.shiftType,
            extendedProps: event.extendedProps,
          });
        } else if (type === 'overlap') {
          filteredEvents.push({
            backgroundColor,
            endDate,
            startDate,
            id,
            title,
            type: 'overlap',
            selectable: event.selectable,
            extendedProps: event.extendedProps,
          });
        }
      }
    }
    return filteredEvents;
  }

  const slotHasEvents = (slot: { slot: TimeUnit; day: Date; }, todayEvents: EventType[]): boolean => {
    const startTime = slot.slot.startTime; // e.g. 1900, 0800
    const endTime = slot.slot.endTime; // e.g. 1900, 0800
    const day = slot.day; // Assume this is a valid date object or a string that can be parsed as a date

    // Parse the startTime and endTime strings into hours and minutes
    const startHour = Math.floor(startTime / 100); // e.g. 19 from 1900
    const startMinute = startTime % 100; // e.g. 00 from 1900
    const endHour = Math.floor(endTime / 100); // e.g. 08 from 0800
    const endMinute = endTime % 100; // e.g. 00 from 0800

    // Create Date objects using the day and parsed time
    const startDate = new Date(day);
    startDate.setHours(startHour, startMinute, 0, 0); // Set the hours and minutes for start time

    const endDate = new Date(day);
    endDate.setHours(endHour, endMinute, 0, 0); // Set the hours and minutes for end time

    const hasEvents = todayEvents.some(event => {
      const { startDate: eventStartDate, endDate: eventEndDate } = event;

      // Check if the event overlaps with the selected time range
      const isEventWithinSelectedTime =
        (eventStartDate < endDate && eventEndDate > startDate); // Event starts before endDate and ends after startDate

      return isEventWithinSelectedTime; // Return true if the event overlaps with the selected time range
    });

    return hasEvents;
  }

  const findMissingSlots = (timeUnits: Slot[], day: Date): Slot[] => {
    const missingSlots: Slot[] = [];

    for (let i = 0; i < timeUnits.length - 1; i++) {
      const currentSlot = timeUnits[i].slot;
      const nextSlot = timeUnits[i + 1].slot;

      if (currentSlot.endTime < nextSlot.startTime) {
        missingSlots.push({
          day: day,
          slot: {
            name: `break-${i}`,
            startTime: currentSlot.endTime,
            endTime: nextSlot.startTime,
            isBreak: true,
            isSelectable: false,
            holidays: [],
          }
        });
      }
    }

    return missingSlots;
  };

  const getTimeSlotsForDay = (day: Date, todayEvents: EventType[], todayHolidays: Holiday[]) => {
    const firstFormat = allPossibleTimeUnits.map(slot => ({ slot, day }));

    const sortedTimeUnits = [...firstFormat].sort((a, b) => a.slot.startTime - b.slot.startTime);
    const missingSlots = findMissingSlots(sortedTimeUnits, day);
    const allSlots = [...sortedTimeUnits, ...missingSlots].sort((a, b) => a.slot.startTime - b.slot.startTime);

    const allFormattedSlots: Slot[] = [];

    for (let i = 0; i < allSlots.length; i++) {
      const { day, slot } = allSlots[i];
      const selectableBasedOnTime = !isBeforeNow(slot.startTime, day);
      const selectableBasedOnEvents = !slotHasEvents({ slot, day }, todayEvents);

      allFormattedSlots.push({
        day,
        slot: {
          endTime: slot.endTime,
          isSelectable: selectableBasedOnTime && selectableBasedOnEvents && selectable,
          name: slot.name,
          startTime: slot.startTime,
          isBreak: slot.isBreak,
          holidays: todayHolidays
        }
      })
    }

    return allFormattedSlots;
  }

  const getHolidaysForDay = (day: Date, holidays: Holiday[]) => {
    const holidaysForDay = holidays.filter(({ endDate, id, longName, name, startDate }) => {
      // Check if the holiday is within the selected day
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      const startsToday = formattedStartDate.toDateString() == day.toDateString();
      const endsToday = formattedEndDate.toDateString() == day.toDateString();

      if (startsToday || endsToday) return true;

      return formattedStartDate <= day && formattedEndDate >= day;
    });

    return holidaysForDay
  }

  const dataForDay = (day: Date, allEvents: EventType[] = [], allHolidays: Holiday[] = []) => {
    const todayEvents = getEventsForDay(day, allEvents);
    const todayHolidays = getHolidaysForDay(day, allHolidays);
    const todayTimeSlots = getTimeSlotsForDay(day, todayEvents, todayHolidays);

    return {
      day: day,
      events: todayEvents,
      holidays: todayHolidays,
      timeSlots: todayTimeSlots
    }
  }

  return (
    <div className="p-4 select-none" ref={calendarRef}>
      <WeekHeader
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
      />
      {/* Legend for Event Background Colors */}
      {showlegend && <Legend />}
      <div className="grid gap-0"
        style={{
          gridTemplateColumns: `auto repeat(${weekDays.length}, minmax(0, 1fr))`,
        }}
      >
        <TimeColumn
          allPossibleTimeUnits={allPossibleTimeUnits}
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          currentWeek={currentWeek}
          selectable={selectable}
        />
        {weekDays.map((day, index) => {
          const { events: todayEvents, holidays: todayHolidays, timeSlots: todayTimeSlots } = dataForDay(day, events, holidays);

          return (
            <div key={index}>
              <DayColumn
                handleEventClick={handleEventClick}
                events={todayEvents}
                calendarRef={calendarRef}
                selectedSlots={selectedSlots}
                allPossibleTimeUnits={todayTimeSlots}
                day={day}
                setSelectedSlots={setSelectedSlots}
              />
            </div>
          )
        })}
      </div>
      {
        selectedSlots.length > 0 && (
          <div className="mt-4 flex justify-center items-center flex-row gap-4">
            <button onClick={handleValidate} className="mt-4 p-2 bg-green-500 text-white">
              Validate Selection
            </button>
            <button onClick={handleValidateDelete} className="mt-4 p-2 bg-red-500 text-white">
              Delete Selection
            </button>
          </div>
        )
      }
    </div >
  );
};
//#endregion

export default Calendar;
