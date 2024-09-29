import React from 'react';
import { formatTime, getSlotHeight } from './utils';
import { TimeColumnProps, TimeUnit } from './types';
import TimeGutter from './TimeGutter';

// Function to find missing slots between given time units
const findMissingSlots = (timeUnits: TimeUnit[]): TimeUnit[] => {
  const missingSlots = [];

  for (let i = 0; i < timeUnits.length - 1; i++) {
    const currentSlot = timeUnits[i];
    const nextSlot = timeUnits[i + 1];

    // Check if there is a gap between the end of the current slot and the start of the next slot
    if (currentSlot.endTime < nextSlot.startTime) {
      missingSlots.push({
        name: `break-${i}`,
        startTime: currentSlot.endTime,
        endTime: nextSlot.startTime,
        isBreak: true,
      });
    }
  }

  return missingSlots;
};

const TimeColumn: React.FC<TimeColumnProps> = ({ allPossibleTimeUnits, selectedSlots, setSelectedSlots, currentWeek }) => {
  // Combine time slots with missing slots
  const sortedTimeUnits = [...allPossibleTimeUnits].sort((a, b) => a.startTime - b.startTime);
  const missingSlots = findMissingSlots(sortedTimeUnits);
  const allSlots = [...sortedTimeUnits, ...missingSlots].sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="flex flex-col border-r bg-gray-100">
      <TimeGutter />
      {allSlots.map((slot) => {
        const height = getSlotHeight(slot.isBreak);

        const selectAllSlotsOfTime = (s: TimeUnit) => {
          const updatedSlots = [];

          // Helper function to get the Monday of the current week based on any given date
          const getMondayOfCurrentWeek = (date: Date) => {
            const day = date.getDay();
            const difference = day === 0 ? -6 : 1 - day; // Adjust if it's Sunday (0), make it the previous Monday
            const monday = new Date(date);
            monday.setDate(date.getDate() + difference);
            return monday;
          };

          const monday = getMondayOfCurrentWeek(currentWeek);

          // Now get the specific days for Monday to Friday
          const getWeekdayDate = (startOfWeek: Date, dayOffset: number) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + dayOffset);
            return date;
          };

          // Calculate Monday to Friday
          const friday = getWeekdayDate(monday, 4); // Friday is 4 days after Monday

          // Loop over Monday to Friday
          for (let date = new Date(monday); date <= friday; date.setDate(date.getDate() + 1)) {
            const formattedDate = date.toISOString().split('T')[0];
            updatedSlots.push({
              slot: slot,
              day: new Date(formattedDate),
            });
          }

          // Now we check if any of these slots have already been selected
          // If so, we deselect all of these slots but only these ones
          if (selectedSlots.some(slot => slot.slot.startTime === s.startTime)) {
            // TODO: Deselecting a slotlane will also deselect it for the next week
            setSelectedSlots(selectedSlots.filter(slot => slot.slot.startTime !== s.startTime));
          } else {
            // TODO: We need to add logic to prevent the selection of unselectable slots
            return
            setSelectedSlots([...selectedSlots, ...updatedSlots]);
          }
        };

        return (
          <div
            key={slot.name}
            className={`border-b pl-2 pr-2 flex items-center justify-center ${slot.isBreak ? 'bg-gray-200' : ''}`}
            style={{ height: `${height}px` }} // Inline style for dynamic height
            onClick={() => selectAllSlotsOfTime(slot)}
          >
            {!slot.isBreak && (
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div>{formatTime(slot.startTime)}</div>
                {/* Hide the dash on small screens */}
                <span className="hidden sm:inline mx-1">-</span>
                <div>{formatTime(slot.endTime)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimeColumn;
