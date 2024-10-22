"use client";
import { useEffect, useState } from "react";
import TimeSlots from "./TimeSlots";
import { DayColumnProps } from "./types";
import { formatWeekHeaderDate } from "./utils";

const DayColumn: React.FC<DayColumnProps> = ({
    allPossibleTimeUnits,
    day,
    selectedSlots,
    setSelectedSlots,
    calendarRef,
    events,
    handleEventClick
}) => {
    const [windowSize, setWindowSize] = useState<number>(700);

    const handleResize = () => {
        if (window === undefined) return;
        setWindowSize(window.innerWidth);
    };

    useEffect(() => {
        if (window === undefined) return;
        setWindowSize(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const selectAllSlotsOfDay = () => {
        // If all slots are already selected, unselect all of this day's slots
        if (selectedSlots.some(slot => slot.day.toDateString() === day.toDateString())) {
            setSelectedSlots(selectedSlots.filter(slot => slot.day.toDateString() !== day.toDateString()));
        } else {
            const finalSlotsToSelect = allPossibleTimeUnits.filter(slot => slot.slot.isSelectable);

            const newSelectedSlots = [...selectedSlots, ...finalSlotsToSelect];
            setSelectedSlots(newSelectedSlots);
        }
    }

    return (
        <div key={day.toDateString()} className="flex flex-col border-r">
            <div
                className="border-b font-bold flex items-center justify-center h-14 overflow-hidden bg-gray-100"
                onClick={selectAllSlotsOfDay}
            >
                {/* Use Tailwind's responsive hidden utility */}
                <h3 className="font-bold p-2">
                    {formatWeekHeaderDate(day, windowSize < 768 ? "sm" : "lg")}
                </h3>
            </div>
            {/* This is the timeslots for this week */}
            <TimeSlots
                handleEventClick={handleEventClick}
                events={events}
                allPossibleTimeUnits={allPossibleTimeUnits}
                day={day}
                setSelectedSlots={setSelectedSlots}
                calendarRef={calendarRef}
                selectedSlots={selectedSlots}
            />
        </div>
    );
};

export default DayColumn;