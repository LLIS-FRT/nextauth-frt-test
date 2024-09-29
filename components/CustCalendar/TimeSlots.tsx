import React, { useState } from 'react';
import { TimeUnit, TimeSlotsProps, EventType, AvailabilityEvent, ExamEvent, ShiftEvent, OverlapEvent } from './types';
import TimeSlot from './TimeSlot';
import Timeline from './Timeline';

const TimeSlots: React.FC<TimeSlotsProps> = ({
    selectedSlots,
    allPossibleTimeUnits,
    day,
    setSelectedSlots,
    calendarRef,
    events,
    handleEventClick,
    selectable: selectable_
}) => {
    const [dragStart, setDragStart] = useState<{ slot: TimeUnit; day: Date } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragEnd, setDragEnd] = useState<{ slot: TimeUnit; day: Date } | null>(null);

    const handleMouseDown = (slot: TimeUnit, day: Date) => {
        setDragStart({ slot, day });
        setIsDragging(true);
    };

    const handleMouseUp = (slot: TimeUnit, day: Date) => {
        if (isDragging) {
            if (dragStart && dragStart.day.toDateString() === day.toDateString()) {
                const startIndex = allPossibleTimeUnits.findIndex(s => s === dragStart.slot);
                const endIndex = allPossibleTimeUnits.findIndex(s => s === slot);
                const selectedRange = allPossibleTimeUnits.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);

                if (selectedRange.length >= 2) {
                    const newSelectedSlots = selectedRange.map(s => ({ slot: s, day }));

                    setSelectedSlots(prev => {
                        const existingDaySlots = prev.filter(selected => selected.day.toDateString() === day.toDateString());
                        const nonExistingDaySlots = prev.filter(selected => selected.day.toDateString() !== day.toDateString());

                        const updatedDaySlots = [
                            ...existingDaySlots,
                            ...newSelectedSlots.filter(newSlot => !existingDaySlots.some(existingSlot => existingSlot.slot === newSlot.slot))
                        ];

                        return [
                            ...nonExistingDaySlots,
                            ...updatedDaySlots
                        ];
                    });
                }
            }
            setDragStart(null);
            setDragEnd(null);
            setIsDragging(false);
        }
    };

    const handleSlotClick = (slot: TimeUnit, day: Date) => {
        if (!isDragging) {
            const isSelected = selectedSlots.some(
                (selected) => selected.slot === slot && selected.day.toDateString() === day.toDateString()
            );
            if (isSelected) {
                setSelectedSlots(prev => prev.filter(
                    (selected) => !(selected.slot === slot && selected.day.toDateString() === day.toDateString())
                ));
            } else {
                setSelectedSlots(prev => [
                    ...prev.filter(
                        (selected) => !(selected.day.toDateString() === day.toDateString() && selected.slot === slot)
                    ),
                    { slot, day }
                ]);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent, slot: TimeUnit, day: Date) => {
        if (isDragging && dragStart && dragStart.day.toDateString() === day.toDateString()) {
            const calendarRect = calendarRef.current?.getBoundingClientRect();
            const slotRect = e.currentTarget.getBoundingClientRect();
            if (calendarRect && slotRect) {
                const isWithinBounds = e.clientY >= calendarRect.top && e.clientY <= calendarRect.bottom;
                if (isWithinBounds) {
                    setDragEnd({ slot, day });
                }
            }
        }
    };

    const findTodayEvents = (slot: TimeUnit, day: Date): EventType[] => {
        const allEvents = events || [];
        const { startTime, endTime } = slot;

        const slotStart = new Date(day);
        slotStart.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0);
        const slotEnd = new Date(day);
        slotEnd.setHours(Math.floor(endTime / 100), endTime % 100, 0, 0);

        const filteredEvents: EventType[] = [];

        for (const event of allEvents) {
            const { backgroundColor, endDate, startDate, id, title, type } = event;

            if (startDate.toDateString() === day.toDateString() && endDate.toDateString() === day.toDateString()) {
                if (endDate > slotStart && startDate < slotEnd) {
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
        }

        return filteredEvents;
    };

    const findMissingSlots = (timeUnits: TimeUnit[]): TimeUnit[] => {
        const missingSlots = [];

        for (let i = 0; i < timeUnits.length - 1; i++) {
            const currentSlot = timeUnits[i];
            const nextSlot = timeUnits[i + 1];

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

    const sortedTimeUnits = [...allPossibleTimeUnits].sort((a, b) => a.startTime - b.startTime);
    const missingSlots = findMissingSlots(sortedTimeUnits);
    const allSlots = [...sortedTimeUnits, ...missingSlots].sort((a, b) => a.startTime - b.startTime);

    const isToday = (day: Date): Boolean => {
        const now = new Date();

        const dayYear = day.getFullYear();
        const dayMonth = day.getMonth();
        const dayDate = day.getDate();

        const nowYear = now.getFullYear();
        const nowMonth = now.getMonth();
        const nowDate = now.getDate();

        const isYear = dayYear === nowYear;
        const isMonth = isYear && dayMonth === nowMonth;
        const isToday = isMonth && dayDate === nowDate;

        return isToday;
    }

    const isBeforeNow = (slot: TimeUnit, day: Date): Boolean => {
        const now = new Date();

        const { endTime } = slot;
        const formatStartTime = endTime.toString().padStart(4, '0');
        const formatNowTime = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');

        const dayYear = day.getFullYear();
        const dayMonth = day.getMonth();
        const dayDate = day.getDate();

        const nowYear = now.getFullYear();
        const nowMonth = now.getMonth();
        const nowDate = now.getDate();

        const isBeforeYear = dayYear < nowYear;
        const isBeforeMonth = dayMonth < nowMonth;
        const isBeforeDay = dayDate < nowDate;

        const isBeforeHour = formatStartTime < formatNowTime;

        const isYear = dayYear === nowYear;
        const isMonth = isYear && dayMonth === nowMonth;

        if (isBeforeYear) return true;
        else if (isBeforeMonth && isYear) return true;
        else if (isBeforeDay && isMonth) return true;
        else if (isBeforeHour && isToday(day)) return true;
        else return false;
    };

    return (
        <div className='relative'>
            {isToday(day) && <Timeline />}
            <div>
                {allSlots.map((slot, index) => {
                    const selectable = !isBeforeNow(slot, day);
                    // If selectable is true, we now check if selectable_ is true
                    // if selectable_ is true, we set selectable to true
                    // if selectable_ is false, we set selectable to false

                    const finalSelectable = selectable && selectable_;
                    return (
                        <div key={index} className={`${isBeforeNow(slot, day) ? 'bg-blue-200/25' : ''}`}>
                            <TimeSlot
                                events={findTodayEvents(slot, day)}
                                handleEventClick={handleEventClick}
                                allPossibleTimeUnits={allPossibleTimeUnits}
                                day={day}
                                dragEnd={dragEnd}
                                dragStart={dragStart}
                                isDragging={isDragging}
                                selectedSlots={selectedSlots}
                                slot={slot}
                                selectable={finalSelectable}
                                handleMouseDown={() => handleMouseDown(slot, day)}
                                handleMouseMove={(e) => handleMouseMove(e, slot, day)}
                                handleMouseUp={() => handleMouseUp(slot, day)}
                                handleSlotClick={() => handleSlotClick(slot, day)}
                            >
                                {slot.name}
                            </TimeSlot>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimeSlots;
