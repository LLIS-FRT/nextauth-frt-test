import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import { EventType, TimeSlotProps } from './types';
import { getSlotHeight } from './utils';
import Event from './Event';
import Timeline from './Timeline';

const TimeSlot: React.FC<TimeSlotProps> = ({
    selectedSlots,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleSlotClick,
    allPossibleTimeUnits,
    day,
    isDragging,
    dragStart,
    dragEnd,
    slot,
    showAvailability,
    showExam,
    showShift,
    events, // Add the event prop to display event details
    children,
    selectable
}) => {
    const isBreak = slot.isBreak;
    const slotHeight = getSlotHeight(isBreak);

    // State to hold container width
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update container width when the component mounts or resizes
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        // Set initial width
        updateWidth();

        // Add resize event listener
        window.addEventListener('resize', updateWidth);

        // Cleanup
        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    // Calculate how much of the slot's time has passed
    const calculateTimePassedPercentage = (): number => {
        const { startTime, endTime } = slot;

        // Convert time to a Date object
        const convertToTime = (time: number): Date => {
            const hours = Math.floor(time / 100);
            const minutes = time % 100;
            return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
        };

        const slotStartTime = convertToTime(startTime);
        const slotEndTime = convertToTime(endTime);
        const now = new Date();

        // If current time is before the slot start time, 0% of the time has passed
        if (now <= slotStartTime) {
            return 0;
        }

        // If current time is after the slot end time, 100% of the time has passed
        if (now >= slotEndTime) {
            return 100;
        }

        // Calculate percentage of time passed within the slot
        const totalSlotDuration = slotEndTime.getTime() - slotStartTime.getTime();
        const timeElapsed = now.getTime() - slotStartTime.getTime();

        return (timeElapsed / totalSlotDuration) * 100;
    };

    const timePassedPercentage = !isBreak ? calculateTimePassedPercentage() : 0;

    // Helper function to determine if this slot is the first one for any event
    const isFirstSlotForEvent = (event: EventType): boolean => {
        const { startTime, endTime } = slot;
        const { startDate } = event;

        const formatTime = (time: number): string => {
            const hours = Math.floor(time / 100).toString().padStart(2, '0');
            const minutes = (time % 100).toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        const slotStartTimeStr = formatTime(startTime);
        const slotEndTimeStr = formatTime(endTime);
        const slotStartDate = new Date(`${day.toDateString()} ${slotStartTimeStr}`);
        const slotEndDate = new Date(`${day.toDateString()} ${slotEndTimeStr}`);
        const eventStartDate = new Date(startDate);

        const isAtOrAfterSlotStartTime = eventStartDate >= slotStartDate && eventStartDate <= slotEndDate;
        const isBeforeSlotEndTime = eventStartDate >= slotStartDate && eventStartDate <= slotEndDate;

        return isAtOrAfterSlotStartTime || isBeforeSlotEndTime;
    };

    const shouldShowPassedTime = (): boolean => {
        if (isBreak) return false;
        if (timePassedPercentage < 0) return false;

        const now = new Date();
        const { startTime, endTime } = slot;
        const formatNowTime = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
        const isToday = day.getFullYear() === now.getFullYear() && day.getMonth() === now.getMonth() && day.getDate() === now.getDate();

        // Ensure time passed is only shown for today
        if (!isToday) return false;
        // Ensure time passed is only shown if the current time is within the slot time range
        if (formatNowTime < startTime.toString().padStart(4, '0') || formatNowTime > endTime.toString().padStart(4, '0')) return false;

        return true
    }

    return (
        <div
            ref={containerRef} // Attach ref to the container
            className={classNames('border-b flex items-center justify-center relative', {
                'cursor-not-allowed': isBreak || !selectable,
                'cursor-pointer': !isBreak && selectable
            })}
            style={{ height: `${slotHeight}px` }}
        >
            {/* Background to indicate time passed */}
            {shouldShowPassedTime() && <div className="absolute top-0 left-0 w-full bg-blue-200/25" style={{ height: `${timePassedPercentage}%` }} />}

            <div
                className={classNames('h-full w-full flex items-center justify-center relative', {
                    'bg-blue-200': selectedSlots.some(
                        (selected) => selected.slot.startTime === slot.startTime && selected.day.toDateString() === day.toDateString()
                    ),
                    'bg-blue-400': isDragging && dragStart && dragEnd && dragStart.day.toDateString() === day.toDateString()
                        && allPossibleTimeUnits.indexOf(slot) >= Math.min(allPossibleTimeUnits.indexOf(dragStart.slot), allPossibleTimeUnits.indexOf(dragEnd.slot))
                        && allPossibleTimeUnits.indexOf(slot) <= Math.max(allPossibleTimeUnits.indexOf(dragStart.slot), allPossibleTimeUnits.indexOf(dragEnd.slot)),
                    'bg-gray-200': isBreak,
                })}
                onMouseDown={() => isBreak ? null : !selectable ? null : handleMouseDown(slot, day)}
                onMouseMove={(e) => isBreak ? null : !selectable ? null : handleMouseMove(e, slot, day)}
                onMouseUp={() => isBreak ? null : !selectable ? null : handleMouseUp(slot, day)}
                onClick={() => isBreak ? null : !selectable ? null : handleSlotClick(slot, day)}
            >
                {isBreak ? null : children}
            </div>

            {/* Loop through the events and display them */}
            {events && events.map((event, index) => (
                <Event
                    key={event.id}
                    event={event}
                    index={index}
                    totalEvents={events.length}
                    showAvailability={showAvailability}
                    showExam={showExam}
                    showShift={showShift}
                    timeSlotHeight={slotHeight}
                    containerWidth={containerWidth}
                    isFirstSlot={isFirstSlotForEvent(event)}
                />
            ))}
        </div>
    );
};

export default TimeSlot;
