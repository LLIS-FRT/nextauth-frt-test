import React, { useEffect, useRef, useState } from 'react';
import { TimeUnit, TimeSlotsProps, EventType } from './types';
import TimeSlot from './TimeSlot';
import Timeline from './Timeline';
import { getSlotHeight, isBeforeNow, isToday, formatDate, formatTime } from './utils';
import Event from './Event';

// TODO: Add holidays
const IS_HOLIDAY = false;

const TimeSlots: React.FC<TimeSlotsProps> = ({
    selectedSlots,
    allPossibleTimeUnits,
    day,
    setSelectedSlots,
    calendarRef,
    events,
    handleEventClick
}) => {
    const [dragStart, setDragStart] = useState<{ slot: TimeUnit; day: Date } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragEnd, setDragEnd] = useState<{ slot: TimeUnit; day: Date } | null>(null);

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
    }, [containerRef]);

    const handleMouseDown = (slot: TimeUnit, day: Date) => {
        setDragStart({ slot, day });
        setIsDragging(true);
    };

    const handleMouseUp = (slot: TimeUnit, day: Date) => {
        if (isDragging) {
            if (dragStart && dragStart.day.toDateString() === day.toDateString()) {
                const startIndex = allPossibleTimeUnits.map(s => s.slot).findIndex(s => s.startTime === dragStart.slot.startTime && s.endTime === dragStart.slot.endTime);
                const endIndex = allPossibleTimeUnits.map(s => s.slot).findIndex(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                const selectedRange = allPossibleTimeUnits.map(s => s.slot).slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);

                if (selectedRange.length >= 2) {
                    setSelectedSlots(prev => {
                        const existingDaySlots = prev.filter(selected => selected.day.toDateString() === day.toDateString());
                        const nonExistingDaySlots = prev.filter(selected => selected.day.toDateString() !== day.toDateString());

                        const newlySelectedSlots = selectedRange.filter(newSlot =>
                            newSlot.isSelectable &&
                            newSlot.isBreak &&
                            !existingDaySlots.some(existingSlot => existingSlot.slot === newSlot));

                        const updatedDaySlots = [
                            ...existingDaySlots,
                            ...newlySelectedSlots.map(newSlot => ({ slot: newSlot, day }))
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
            setSelectedSlots((prev) => {
                const isSlotSelected = prev.some(
                    (selected) => selected.slot.startTime === slot.startTime && selected.day.toDateString() === day.toDateString()
                );

                if (isSlotSelected) {
                    return prev.filter(
                        (selected) => !(selected.slot.startTime === slot.startTime && selected.day.toDateString() === day.toDateString())
                    );
                } else {
                    return [...prev, { slot, day }];
                }
            });
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

    // Group overlapping events by checking time ranges
    const groupOverlappingEvents = (events: EventType[]) => {
        const overlappingGroups: EventType[][] = [];

        events.forEach((event) => {
            let addedToGroup = false;

            for (const group of overlappingGroups) {
                if (group.some(groupEvent => event.startDate < groupEvent.endDate && event.endDate > groupEvent.startDate)) {
                    group.push(event);
                    addedToGroup = true;
                    break;
                }
            }

            if (!addedToGroup) {
                overlappingGroups.push([event]);
            }
        });

        return overlappingGroups;
    };
    const overlappingGroups = groupOverlappingEvents(events || []);

    return (
        <div className='relative' ref={containerRef} >
            {isToday(day) && <Timeline />}
            <div>
                {allPossibleTimeUnits.map((slot, index) => {
                    const isBreak = slot.slot.isBreak;
                    const slotHeight = getSlotHeight(isBreak);

                    return (
                        <div key={index} className={`${isBeforeNow(slot.slot.endTime, day) ? 'bg-blue-200/25' : IS_HOLIDAY ? 'bg-blue-200/50' : ''}`}>
                            <TimeSlot
                                allPossibleTimeUnits={allPossibleTimeUnits}
                                day={day}
                                dragEnd={dragEnd}
                                dragStart={dragStart}
                                isDragging={isDragging}
                                selectedSlots={selectedSlots}
                                slot={slot}
                                handleMouseDown={() => handleMouseDown(slot.slot, day)}
                                handleMouseMove={(e) => handleMouseMove(e, slot.slot, day)}
                                handleMouseUp={() => handleMouseUp(slot.slot, day)}
                                handleSlotClick={() => handleSlotClick(slot.slot, day)}
                                height={slotHeight}
                            >
                                {/* {slot.slot.name} */}
                            </TimeSlot>
                        </div>
                    );
                })}
                {overlappingGroups.map((group) => {
                    return group.map((event, eventIndex) => {
                        const calcEventAndPrecedingHeight = (): { heightOfEvent: number, heightOfPrecedingSlots: number } => {
                            let heightOfEvent = 0;
                            let heightOfPrecedingSlots = 0;

                            allPossibleTimeUnits.forEach((slot) => {
                                const slotStartDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(slot.slot.startTime / 100), slot.slot.startTime % 100);
                                const slotEndDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(slot.slot.endTime / 100), slot.slot.endTime % 100);

                                const eventStartTime = event.startDate.getHours() * 100 + event.startDate.getMinutes();
                                const eventEndTime = event.endDate.getHours() * 100 + event.endDate.getMinutes();

                                const slotStartTime = slotStartDate.getHours() * 100 + slotStartDate.getMinutes();
                                const slotEndTime = slotEndDate.getHours() * 100 + slotEndDate.getMinutes();

                                const eventSpansSlot = eventStartTime <= slotStartTime && eventEndTime >= slotEndTime;
                                const eventStartsInSlot = eventStartTime >= slotStartTime && eventStartTime < slotEndTime;
                                const eventEndsInSlot = eventEndTime > slotStartTime && eventEndTime <= slotEndTime;

                                if (eventSpansSlot || eventStartsInSlot || eventEndsInSlot) {
                                    heightOfEvent += getSlotHeight(slot.slot.isBreak);
                                }
                                if (slotStartTime < eventStartTime) {
                                    heightOfPrecedingSlots += getSlotHeight(slot.slot.isBreak);
                                }
                            });

                            return { heightOfEvent, heightOfPrecedingSlots };
                        };

                        const { heightOfEvent, heightOfPrecedingSlots } = calcEventAndPrecedingHeight();
                        const totalOverlappingEvents = group.length;
                        const stackLevel = eventIndex;

                        return (
                            <div
                                key={event.id}
                                className="w-full"
                                style={{
                                    position: 'absolute',
                                    top: `${heightOfPrecedingSlots}px`,
                                    left: `${(stackLevel / totalOverlappingEvents) * containerWidth}px`, // Left position based on stack level
                                    width: `${containerWidth / totalOverlappingEvents}px`, // Ensure events share the total width
                                }}
                            >
                                <Event
                                    event={event}
                                    handleEventClick={handleEventClick}
                                    containerWidth={containerWidth}
                                    index={stackLevel}
                                    totalEvents={totalOverlappingEvents}
                                    totalHeight={heightOfEvent}
                                />
                            </div>
                        );
                    });
                })}
            </div>
        </div>
    );
};

export default TimeSlots;