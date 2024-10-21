import { CSSProperties } from "react";
import { AvailabilityEvent, EventBgColor, EventBgTexture, EventType, ExamEvent, OverlapEvent, ShiftEvent, TimeUnit } from "./types";

export const getWeekDays = (currentWeek: Date, weekends: boolean = false): Date[] => {
    const weekDays: Date[] = [];

    // Clone the currentWeek to avoid mutating the original date
    const startOfWeek = new Date(currentWeek);

    // Set to the Monday of the current week (assuming the week starts on Monday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    // Adjust for Sunday if weekends are included
    if (weekends) {
        if (startOfWeek.getDay() === 0) {
            startOfWeek.setDate(startOfWeek.getDate() - 6);
        }
    } else {
        // If weekends are not included, adjust to start on Monday
        if (startOfWeek.getDay() === 0) {
            startOfWeek.setDate(startOfWeek.getDate() - 6);
        }
    }

    // Generate the days of the week
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
    }

    // Remove weekends if they should not be included
    if (!weekends) {
        return weekDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
    }

    return weekDays;
};

export const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

export const formatWeekHeaderDate = (date: Date, size: "sm" | "lg"): string => {
    const day = date.getDate();
    const dayName = date.toLocaleDateString('en-US', { weekday: size === 'sm' ? 'short' : 'long' });

    const formattedDate = `${dayName}${size === 'sm' ? '.' : ''} ${day}${getOrdinalSuffix(day)}`;
    return formattedDate;
};

export const firstFriday = (date: Date): Date => {
    const dayOfWeek = date.getDay();

    // Check if the current day is Friday (dayOfWeek === 5)
    if (dayOfWeek === 5) {
        return date;
    }

    // Calculate days until next Friday
    // If today is Saturday (6), add 6 days; if today is Sunday (0), add 5 days, etc.
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;

    // If the daysUntilFriday is 0, it means today is Friday
    const nextFriday = new Date(date);
    nextFriday.setDate(date.getDate() + (daysUntilFriday || 7));

    return nextFriday;
}

export const formatFullDate = (date: Date): string => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' } as const;
    return date.toLocaleDateString('en-US', options);
};

export const formatTime = (time: number): string => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getSlotHeight = (isBreak?: boolean): number => {
    if (isBreak) return 16;
    return 60;
}

export const getTexture = (color: EventBgColor): EventBgTexture => {
    switch (color) {
        case EventBgColor.Availability:
            return EventBgTexture.Solid; // Neutral event, solid color
        case EventBgColor.overlap:
            return EventBgTexture.Solid; // Neutral event, solid color
        case EventBgColor.Exam:
            return EventBgTexture.Dashed; // Negative event, dashed lines for emphasis
        case EventBgColor.coveredWithUser:
            return EventBgTexture.Solid; // Perfect coverage, solid color
        case EventBgColor.coveredWithoutUser:
            return EventBgTexture.Solid; // Perfect coverage without user, solid color
        case EventBgColor.notCoveredWithUser:
            return EventBgTexture.Striped; // Partially covered with user, striped for attention
        case EventBgColor.notCoveredWithoutUser:
            return EventBgTexture.Striped; // Partially covered without user, striped for attention
        case EventBgColor.minUsersWithUser:
            return EventBgTexture.Striped; // Barely acceptable, dotted pattern for mild emphasis
        case EventBgColor.minUsersWithoutUser:
            return EventBgTexture.Striped; // Barely acceptable without user, dotted pattern for mild emphasis
        case EventBgColor.lessThanMinUsersWithUser:
            return EventBgTexture.Dashed; // Terrible, gridded for strong attention
        case EventBgColor.lessThanMinUsersWithoutUser:
            return EventBgTexture.Dashed; // Terrible without user, gridded for strong attention
        default:
            return EventBgTexture.Solid; // Default texture
    }
};

export const eventStyle = (
    color: EventBgColor,
    texture: EventBgTexture,
): CSSProperties => {
    const textureStyles: Record<EventBgTexture, CSSProperties> = {
        [EventBgTexture.Solid]: {
            backgroundColor: color,
        },
        [EventBgTexture.Striped]: {
            background: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, transparent 10px, transparent 20px)`,
        },
        [EventBgTexture.Dotted]: {
            background: `radial-gradient(${color} 20%, transparent 20%)`,
        },
        [EventBgTexture.Gridded]: {
            background: `linear-gradient(to right, ${color} 1px, transparent 1px) 0 0, 
                         linear-gradient(to bottom, ${color} 1px, transparent 1px) 0 0`,
        },
        [EventBgTexture.Dashed]: {
            background: `repeating-linear-gradient(45deg, ${color}, ${color} 5px, transparent 5px, transparent 10px)`,
        },
        [EventBgTexture.Checkered]: {
            background: `linear-gradient(45deg, ${color} 25%, transparent 25%) -10px 0, 
                         linear-gradient(-45deg, ${color} 25%, transparent 25%) -10px 0`,
        },
    };

    return textureStyles[texture] || textureStyles[EventBgTexture.Solid];
};

export const isToday = (day: Date): Boolean => {
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

export const isBeforeNow = (time: number, day: Date): Boolean => {
    const now = new Date();
    const slotDate = new Date(day);
    slotDate.setHours(Math.floor(time / 100), time % 100);

    return slotDate < now;
};

export const findTodayEvents = (slot: TimeUnit, day: Date, events?: EventType[]): EventType[] => {
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