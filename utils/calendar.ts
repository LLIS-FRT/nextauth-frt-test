import { LimitedShift } from "@/actions/data/shift";
import { EventBgColor, ShiftEvent, TimeUnit } from "@/components/CustCalendar/types";
import { timeunits } from '@/constants';

// Function to combine all slots that are adjacent 
interface Slot {
    startDate: Date;
    endDate: Date;
}

export const sortSlots = (slots: { startDate: Date; endDate: Date; }[]) => {
    return [...slots].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

export const combineAdjacentSlots = (slots: Slot[], includeBreaks: boolean): Slot[] => {
    const sortedSlots = sortSlots(slots);
    const combinedSlots: { startDate: Date; endDate: Date }[] = [];
    const breaks: { startTime: string; endTime: string }[] = includeBreaks ? identifyBreaks() : [];

    if (sortedSlots.length === 0) return combinedSlots;

    let currentStartDate = sortedSlots[0].startDate;
    let currentEndDate = sortedSlots[0].endDate;

    const formatTime = (time: string, slotDate: Date) => {
        const year = slotDate.getFullYear();
        const month = slotDate.getMonth();
        const day = slotDate.getDate();
        const [hours, minutes] = time.split(':');
        return new Date(year, month, day, parseInt(hours), parseInt(minutes));
    }

    const isSlotInBreak = (endDate: Date) => {
        const isBreak = breaks.some(breakTime => {
            const breakStart = formatTime(breakTime.startTime, endDate);
            const breakStartTime = breakStart.getTime();
            const endDateTime = endDate.getTime();

            return breakStartTime == endDateTime;
        });

        return isBreak;
    }

    for (let i = 0; i < sortedSlots.length; i++) {
        const slot = sortedSlots[i];

        // If the current slot overlaps with or touches the previous one, combine them
        if (slot.startDate <= currentEndDate) {
            // Extend the end of the combined slot if the new slot ends later
            currentEndDate = new Date(Math.max(currentEndDate.getTime(), slot.endDate.getTime()));
        } else {
            // Push the current combined slot before starting a new one
            if (sortedSlots.length > 1) combinedSlots.push({ startDate: currentStartDate, endDate: currentEndDate });

            // Start a new combined slot
            currentStartDate = slot.startDate;
            currentEndDate = slot.endDate;
        }

        // Check if the slot's end is at the start of a break and include the break
        if (isSlotInBreak(currentEndDate)) {
            const breakInfo = breaks.find(b => formatTime(b.startTime, currentEndDate).getTime() === currentEndDate.getTime());
            if (breakInfo) {
                currentEndDate = formatTime(breakInfo.endTime, currentEndDate); // Extend the end to cover the break
            }
        }
    }

    // Push the last combined slot
    combinedSlots.push({ startDate: currentStartDate, endDate: currentEndDate });

    return combinedSlots;

};

export const identifyBreaks = () => {
    const breaks: { startTime: string; endTime: string; }[] = [];

    for (let i = 0; i < timeunits.length - 1; i++) {
        const currentEnd = timeunits[i].endTime;
        const nextStart = timeunits[i + 1].startTime;

        // Convert 900, 950, 1300 to 09:00, 09:50, 13:00
        const formatTime = (time: number) => {
            const hours = Math.floor(time / 100);
            const minutes = time % 100;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        const formattedEnd = formatTime(currentEnd);
        const formattedStart = formatTime(nextStart);

        // Check if there is a break
        if (currentEnd < nextStart) {
            breaks.push({ startTime: formattedEnd, endTime: formattedStart });
        }
    }

    return breaks;
};

export const ShiftToEvent = (shifts: LimitedShift[], userID: string): ShiftEvent[] => {
    const shiftEvents: ShiftEvent[] = shifts.map((shift) => {
        const team = shift.Team;
        const assignedUsersNumber = shift.userIds.length;

        const maxUsers = team?.maxUsers || 0;
        const minUsers = team?.minUsers || 0;

        const hasCurrentUser = shift.userIds.includes(userID);

        const fullyCovered = assignedUsersNumber >= maxUsers;
        const lessThanMinUsers = assignedUsersNumber < minUsers;
        const minUsersButNotFull = assignedUsersNumber >= minUsers && !fullyCovered;

        let shiftType: ShiftEvent["shiftType"] = "notCoveredWithoutUser";
        let backgroundColor = EventBgColor.notCoveredWithoutUser;

        if (hasCurrentUser) {
            if (fullyCovered) {
                shiftType = "coveredWithUser";
                backgroundColor = EventBgColor.coveredWithUser;
            } else if (lessThanMinUsers) {
                shiftType = "lessThanMinUsersWithUser";
                backgroundColor = EventBgColor.lessThanMinUsersWithUser;
            } else if (minUsersButNotFull) {
                shiftType = "minUsersWithUser";
                backgroundColor = EventBgColor.minUsersWithUser;
            } else {
                shiftType = "notCoveredWithUser";
                backgroundColor = EventBgColor.notCoveredWithUser;
            }
        } else {
            if (fullyCovered) {
                shiftType = "coveredWithoutUser";
                backgroundColor = EventBgColor.coveredWithoutUser;
            } else if (lessThanMinUsers) {
                shiftType = "lessThanMinUsersWithoutUser";
                backgroundColor = EventBgColor.lessThanMinUsersWithoutUser;
            } else if (minUsersButNotFull) {
                shiftType = "minUsersWithoutUser";
                backgroundColor = EventBgColor.minUsersWithoutUser;
            } else {
                shiftType = "notCoveredWithoutUser";
                backgroundColor = EventBgColor.notCoveredWithoutUser;
            }
        }

        const canSelect = !fullyCovered && !hasCurrentUser;

        return {
            id: shift.id,
            title: "Shift",
            startDate: shift.startDate,
            endDate: shift.endDate,
            type: "shift",
            backgroundColor,
            shiftType,
            selectable: canSelect,
            extendedProps: { shift },
        }
    });

    return shiftEvents;
}