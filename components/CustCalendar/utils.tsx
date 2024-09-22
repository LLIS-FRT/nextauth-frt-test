import { CSSProperties, useEffect } from "react";
import { EventBgColor, EventBgTexture } from "./types";

// TODO: Fix texturing

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

export const formatWeekHeaderDate = (date: Date): string => {
    const day = date.getDate();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} ${day}${getOrdinalSuffix(day)}`;
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

    // Ensure the document exists
    if (!document) {
        return textureStyles[EventBgTexture.Solid];
    }
    
    // Inject global styles for the striped texture
    const styleSheet = document.createElement("style");
    const textureClass = `global-event-bg {
        background: ${textureStyles[texture]?.background || textureStyles[EventBgTexture.Solid].background};
    }`;

    styleSheet.type = "text/css";
    styleSheet.appendChild(document.createTextNode(textureClass));
    document.head.appendChild(styleSheet);

    return textureStyles[texture] || textureStyles[EventBgTexture.Solid];
};