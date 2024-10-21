"use client";
import { useEffect, useState } from "react";
import TimeSlots from "./TimeSlots";
import { DayColumnProps, Slot, TimeUnit, EventType, AvailabilityEvent, ExamEvent, ShiftEvent, OverlapEvent } from "./types";
import { formatWeekHeaderDate, isBeforeNow } from "./utils";

const DayColumn: React.FC<DayColumnProps> = ({
    allPossibleTimeUnits,
    day,
    selectedSlots,
    setSelectedSlots,
    calendarRef,
    events,
    handleEventClick,
    selectable
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
            const isSelectable = (slot: { slot: TimeUnit; day: Date; }) => {
                const selectableBasedOnTime = !isBeforeNow(slot.slot.startTime, day) && selectable;
                const nowEvent = findTodayEvents(day, events);
                const selectableBasedOnEvents = nowEvent.length == 0;

                return selectableBasedOnTime && selectableBasedOnEvents;
            }

            const finalSlotsToSelect = allPossibleTimeUnits.filter(slot => isSelectable(slot));

            const newSelectedSlots = [...selectedSlots, ...finalSlotsToSelect];
            setSelectedSlots(newSelectedSlots);
        }
    }

    //#region Calculate Correct Slots
    const findMissingSlots = (timeUnits: Slot[]): Slot[] => {
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
                        isSelectable: false
                    }
                });
            }
        }

        return missingSlots;
    };

    const sortedTimeUnits = [...allPossibleTimeUnits].sort((a, b) => a.slot.startTime - b.slot.startTime);
    const missingSlots = findMissingSlots(sortedTimeUnits);
    const allSlots = [...sortedTimeUnits, ...missingSlots].sort((a, b) => a.slot.startTime - b.slot.startTime);

    const allFormattedSlots: Slot[] = [];

    for (let i = 0; i < allSlots.length; i++) {
        const { day, slot } = allSlots[i];
        const selectable = !isBeforeNow(slot.startTime, day);

        allFormattedSlots.push({
            day,
            slot: {
                endTime: slot.endTime,
                isSelectable: selectable && selectable,
                name: slot.name,
                startTime: slot.startTime,
                isBreak: slot.isBreak
            }
        })
    }
    //#endregion

    //#region Calculate Events for given day
    const findTodayEvents = (day: Date, events?: EventType[]): EventType[] => {
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
                        extendedProps: event.extendedProps,
                    } as AvailabilityEvent);
                } else if (type === 'exam') {
                    filteredEvents.push({
                        backgroundColor,
                        endDate,
                        startDate,
                        id,
                        title,
                        type: 'exam',
                        extendedProps: event.extendedProps,
                    } as ExamEvent);
                } else if (type === 'shift') {
                    filteredEvents.push({
                        backgroundColor,
                        endDate,
                        startDate,
                        id,
                        title,
                        type: 'shift',
                        shiftType: event.shiftType,
                        extendedProps: event.extendedProps,
                    } as ShiftEvent);
                } else if (type === 'overlap') {
                    filteredEvents.push({
                        backgroundColor,
                        endDate,
                        startDate,
                        id,
                        title,
                        type: 'overlap',
                        extendedProps: event.extendedProps,
                    } as OverlapEvent);
                }
            }
        }
        return filteredEvents;
    };

    const todayEvents = findTodayEvents(day, events);
    //#endregion

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
                events={todayEvents}
                allPossibleTimeUnits={allFormattedSlots}
                day={day}
                setSelectedSlots={setSelectedSlots}
                calendarRef={calendarRef}
                selectedSlots={selectedSlots}
            />
        </div>
    );
};

export default DayColumn;