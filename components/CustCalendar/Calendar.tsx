import React, { useState, useRef } from 'react';
import { getWeekDays } from './utils';
import { CalendarProps, TimeUnit } from './types';
import WeekHeader from './WeekHeader';
import TimeColumn from './TimeColumn';
import DayColumn from './DayColumn';
import Legend from './Legend';


//#region Calendar Component
const Calendar: React.FC<CalendarProps> = ({ onValidate, allPossibleTimeUnits, events, showExam, showShift, showAvailability, autoSubmit = false, weekends = false }) => {
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

  return (
    <div className="p-4 select-none" ref={calendarRef}>
      <WeekHeader
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
      />
      {/* Legend for Event Background Colors */}
      <Legend />
      <div className={`grid grid-cols-[auto_repeat(5,_minmax(0,_1fr))] gap-0`}>
        <TimeColumn
          allPossibleTimeUnits={allPossibleTimeUnits}
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          currentWeek={currentWeek}
        />
        {weekDays.map((day, index) => {
          return (
            <div key={index}>
              <DayColumn
                showAvailability={showAvailability}
                showExam={showExam}
                showShift={showShift}
                events={events}
                calendarRef={calendarRef}
                selectedSlots={selectedSlots}
                allPossibleTimeUnits={allPossibleTimeUnits}
                day={day}
                setSelectedSlots={setSelectedSlots}
              />
            </div>
          )
        })}
      </div>
      {selectedSlots.length > 0 && (
        <div className="mt-4 flex justify-center items-center flex-row gap-4">
          <button onClick={handleValidate} className="mt-4 p-2 bg-green-500 text-white">
            Validate Selection
          </button>
          <button onClick={handleValidateDelete} className="mt-4 p-2 bg-red-500 text-white">
            Delete Selection
          </button>
        </div>
      )}
    </div>
  );
};
//#endregion

export default Calendar;
