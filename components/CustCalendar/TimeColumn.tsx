import React from 'react';
import { formatTime, getSlotHeight, isBeforeNow } from './utils';
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
        isSelectable: false,
        holidays: [],
      });
    }
  }

  return missingSlots;
};

const TimeColumn: React.FC<TimeColumnProps> = ({ allPossibleTimeUnits, selectedSlots, setSelectedSlots, currentWeek, selectable }) => {
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

          // Ensure currentWeek is a Date object and represents the current week's start
          const currentDate = new Date(currentWeek);
          currentDate.setHours(0, 0, 0, 0); // Set to start of the day

          // Calculate the day of the week (0 = Sunday, 1 = Monday, etc.)
          const dayOfWeek = currentDate.getDay();

          // Calculate Monday of the current week
          const monday = new Date(currentDate);
          monday.setDate(monday.getDate() - dayOfWeek + 1); // 1 represents Monday
          monday.setHours(0, 0, 0, 0); // Set to the start of the day

          // Calculate Friday by adding 4 days to Monday
          const friday = new Date(monday);
          friday.setDate(monday.getDate() + 4); // Friday is 4 days after Monday
          friday.setHours(0, 0, 0, 0); // Set to the start of the day

          // Loop over Monday to Friday
          for (let date = new Date(monday); date <= friday; date.setDate(date.getDate() + 1)) {
            const newDate = new Date(date); // Clone the date object
            newDate.setHours(0, 0, 0, 0); // Set to start of the day

            updatedSlots.push({
              slot: s, // Use the slot passed to the function
              day: newDate,
            });
          }

          const slotsSelectedForCurrentWeekAndTime =
            selectedSlots.some(slot => {
              const currentSlotDay = new Date(slot.day);
              currentSlotDay.setHours(0, 0, 0, 0); // Ensure the time is set to the start of the day

              const isDuringCurrentWeek = currentSlotDay >= monday && currentSlotDay <= friday;
              const isDuringTime = slot.slot.startTime === s.startTime;

              return isDuringCurrentWeek && isDuringTime;
            });

          // Now we check if any of these slots have already been selected
          if (slotsSelectedForCurrentWeekAndTime) {
            const filterSlots = selectedSlots.filter(slot => {
              const currentSlotDay = new Date(slot.day);
              currentSlotDay.setHours(0, 0, 0, 0); // Ensure the time is set to the start of the day

              const isDuringCurrentWeek = currentSlotDay >= monday && currentSlotDay <= friday;
              const isDuringTime = slot.slot.startTime === s.startTime;

              return !(isDuringCurrentWeek && isDuringTime); // Only deselect if both conditions are met
            });

            setSelectedSlots(filterSlots);
          } else {
            // Selecting logic
            const isSelectable = (slot: { slot: TimeUnit; day: Date; }) => {
              const selectableBasedOnTime = !isBeforeNow(slot.slot.startTime, slot.day) && selectable;

              // TODO: Additional logic to prevent selection based on events can be added here

              return selectableBasedOnTime;
            };

            return
            const finalSlotsToSelect = updatedSlots.filter(slot => isSelectable(slot));
            setSelectedSlots([...selectedSlots, ...finalSlotsToSelect]);
          }
        };

        return (
          <div
            key={slot.name}
            className={`border-b pl-2 pr-2 flex items-center justify-center ${slot.isBreak ? 'bg-gray-200' : ''}`}
            style={{ height: `${height}px` }} // Inline style for dynamic height
            onClick={() => selectAllSlotsOfTime(slot)}
          >
            {!slot.isBreak ? (
              <TimeCell slot={slot} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default TimeColumn;

const TimeCell = ({ slot }: { slot: TimeUnit }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center">
      <div>{formatTime(slot.startTime)}</div>
      {/* Hide the dash on small screens */}
      <span className="hidden sm:inline mx-1">-</span>
      <div>{formatTime(slot.endTime)}</div>
    </div>
  );
};