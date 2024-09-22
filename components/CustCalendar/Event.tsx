import React from 'react';
import { EventType } from './types';
import { eventStyle, getTexture } from './utils';

interface EventProps {
    event: EventType;
    index: number; // Index to handle overlapping events
    totalEvents: number; // Total number of overlapping events in this time slot
    showExam: (event: EventType) => void; // Function to show exam details
    showShift: (event: EventType) => void; // Function to show shift details
    showAvailability: (event: EventType) => void; // Function to show availability details
    timeSlotHeight: number; // Height of the time slot to make the event full height
    containerWidth: number; // Width of the container holding the events
    isFirstSlot: boolean; // Indicates if this is the first slot for the event
}

const Event: React.FC<EventProps> = ({
    event,
    index,
    totalEvents,
    showExam,
    showShift,
    showAvailability,
    timeSlotHeight,
    containerWidth,
    isFirstSlot,
}) => {
    // Determine the click handler based on event type
    const handleClick = () => {
        switch (event.type) {
            case 'exam':
                showExam(event);
                break;
            case 'shift':
                showShift(event);
                break;
            case 'availability':
                showAvailability(event);
                break;
            default:
                break;
        }
    };

    // Calculate the width and offset dynamically based on the number of overlapping events
    const leftOffset = (100 / totalEvents) * index; // Dynamically calculate based on the event index and totalEvents
    const eventWidthPercentage = 100 / totalEvents; // Width as a percentage
    const eventWidthPx = (containerWidth * eventWidthPercentage) / 100; // Convert percentage to pixels
    const eventHeight = timeSlotHeight; // Full height of the time slot

    const color = event.backgroundColor;
    const texture = getTexture(color);
    const style = eventStyle(color, texture);

    return (
        <div
            className="absolute p-1 text-white text-xs"
            style={{
                ...style,
                color: 'black',
                top: 0, // Start from the top of the time slot
                left: `${leftOffset}%`, // Position horizontally based on the index (in percentage)
                width: `${eventWidthPx}px`, // Dynamically calculated width in pixels
                height: `${eventHeight}px`, // Full height of the time slot
                zIndex: index + 1, // Ensure overlapping events are visible
                overflow: 'hidden', // Ensure content doesn't overflow
                textOverflow: 'ellipsis', // Shorten long titles
                whiteSpace: 'nowrap', // Prevent text from wrapping
                cursor: event.type === 'exam' ? 'not-allowed' : 'pointer', // Disable cursor for exams
            }}
            onClick={handleClick}
        >
            {isFirstSlot ? (
                <div>
                    {event.title}
                </div>
            ) : ''}
        </div>
    );
};

export default Event;
