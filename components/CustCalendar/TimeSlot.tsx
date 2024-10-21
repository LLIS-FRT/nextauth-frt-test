import classNames from 'classnames';
import { TimeSlotProps } from './types';
import { isToday } from './utils';

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
    children,
    height
}) => {
    const timeUnit = slot.slot;
    const isBreak = timeUnit.isBreak;
    const isSelectable = timeUnit.isSelectable;

    const calculateTimePassedPercentage = (): number => {
        const { startTime, endTime } = timeUnit;

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

    const shouldShowPassedTime = (): boolean => {
        if (isBreak) return false;
        if (timePassedPercentage < 0) return false;

        const now = new Date();
        const { startTime, endTime } = timeUnit;
        const formatNowTime = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');

        // Ensure time passed is only shown for today
        if (!isToday(day)) return false;
        // Ensure time passed is only shown if the current time is within the slot time range
        if (formatNowTime < startTime.toString().padStart(4, '0') || formatNowTime > endTime.toString().padStart(4, '0')) return false;

        return true
    }

    // TODO: Fix selecting

    return (
        <div
            className={classNames('border-b flex items-center justify-center relative', {
                'cursor-not-allowed': !isSelectable,
                'cursor-pointer': isSelectable
            })}
            style={{ height: `${height}px` }}
        >
            {/* Background to indicate time passed */}
            {shouldShowPassedTime() && <div className="absolute top-0 left-0 w-full bg-blue-200/25" style={{ height: `${timePassedPercentage}%` }} />}
            <div
                className={classNames('h-full w-full flex items-center justify-center relative', {
                    'bg-blue-200': selectedSlots.some(
                        (selected) => selected.slot.startTime === timeUnit.startTime && selected.day.toDateString() === day.toDateString()
                    ),
                    // Updated logic to highlight during drag
                    'bg-blue-400': isDragging && dragStart && dragEnd &&
                        allPossibleTimeUnits.indexOf(slot) >= Math.min(
                            allPossibleTimeUnits.findIndex(
                                s => s.slot.startTime === dragStart.slot.startTime && s.slot.endTime === dragStart.slot.endTime
                            ),
                            allPossibleTimeUnits.findIndex(
                                s => s.slot.startTime === dragEnd.slot.startTime && s.slot.endTime === dragEnd.slot.endTime
                            )
                        ) &&
                        allPossibleTimeUnits.indexOf(slot) <= Math.max(
                            allPossibleTimeUnits.findIndex(
                                s => s.slot.startTime === dragStart.slot.startTime && s.slot.endTime === dragStart.slot.endTime
                            ),
                            allPossibleTimeUnits.findIndex(
                                s => s.slot.startTime === dragEnd.slot.startTime && s.slot.endTime === dragEnd.slot.endTime
                            )
                        ),
                    'bg-gray-200': isBreak,
                })}
                onMouseDown={() => !isSelectable ? null : handleMouseDown(timeUnit, day)}
                onMouseMove={(e) => !isSelectable ? null : handleMouseMove(e, timeUnit, day)}
                onMouseUp={() => !isSelectable ? null : handleMouseUp(timeUnit, day)}
                onClick={() => !isSelectable ? null : handleSlotClick(timeUnit, day)}
            >
                {isBreak ? null : children}
            </div>

        </div>
    );
};

export default TimeSlot;
