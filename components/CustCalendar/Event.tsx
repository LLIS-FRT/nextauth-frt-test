import { EventType } from './types';
import { eventStyle, getTexture } from './utils';
import { cn } from '@/lib/utils';

interface EventProps {
    event: EventType;
    index: number;
    totalEvents: number;
    handleEventClick: (event: EventType, type: EventType['type']) => void;
    totalHeight: number;
    containerWidth: number;
}

const Event: React.FC<EventProps> = ({
    event,
    index,
    totalEvents,
    handleEventClick,
    totalHeight,
    containerWidth,
}) => {
    const eventWidthPx = containerWidth / totalEvents;
    const color = event.backgroundColor;
    const texture = getTexture(color);
    const style = eventStyle(color, texture);
    const isExam = event.type === 'exam';

    const isSelectable = event.selectable;

    console.log(event);

    return (
        <div
            className={cn(
                'absolute p-1 text-white text-xs border-r border-l border-black cursor-pointer border rounded',
                isExam && 'cursor-not-allowed',
                !isSelectable && 'cursor-not-allowed'
            )}
            style={{
                ...style,
                color: 'black',
                top: 0,
                width: `${eventWidthPx}px`,
                height: `${totalHeight}px`,
                zIndex: index + 1,
                overflow: 'hidden',
            }}
            onClick={!isSelectable ? undefined : () => handleEventClick(event, event.type)}
        >
            <div
                className="bg-white p-1 rounded shadow text-center overflow-ellipsis"
                style={{
                    display: 'inline-block',  // Ensure the width fits the content
                    maxWidth: '100%',         // Prevent overflow from the container
                    fontSize: 'clamp(10px, 2vw, 14px)', // Dynamically resize font
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',     // Keep text on a single line
                }}
            >
                {event.title}
            </div>
        </div>
    );
};

export default Event;
