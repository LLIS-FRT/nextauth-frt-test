import { Holiday } from "webuntis";

export interface TimeUnit {
    name: string; // Name or identifier for the time unit
    startTime: number; // Start time in HHMM format (e.g., 0930 for 9:30 AM)
    endTime: number; // End time in HHMM format (e.g., 1030 for 10:30 AM)
    isSelectable: boolean; // Flag to indicate if the time unit is selectable
    isBreak?: boolean; // Flag to indicate if the time unit is a break
    holidays: Holiday[]; // Flag to indicate if the time unit is a break
}

export interface SelectedSlot {
    slot: TimeUnit; // The time slot that has been selected
    day: Date; // The day the slot belongs to
}

export interface Slot {
    slot: TimeUnit; // The time slot that has been selected
    day: Date; // The day the slot belongs to
}

export interface BaseEvent {
    id: string;
    title: string;
    backgroundColor: EventBgColor; // Background color for the event
    startDate: Date;
    endDate: Date;
    type: 'exam' | 'shift' | 'availability' | 'overlap'; // Event type
    extendedProps?: { [key: string]: any };
}

export interface ShiftEvent extends BaseEvent {
    type: 'shift';
    shiftType: 'coveredWithUser' | 'coveredWithoutUser' | 'notCoveredWithUser' | 'notCoveredWithoutUser'
    | 'minUsersWithUser' | 'minUsersWithoutUser' | 'lessThanMinUsersWithUser' | 'lessThanMinUsersWithoutUser';
}

export interface ExamEvent extends BaseEvent {
    type: 'exam';
}

export interface AvailabilityEvent extends BaseEvent {
    type: 'availability';
}

export interface OverlapEvent extends BaseEvent {
    type: 'overlap';
}

// Union type for all event types
export type EventType = ShiftEvent | ExamEvent | AvailabilityEvent | OverlapEvent;

export interface CalendarProps {
    onValidate: (slots: { startDate: Date; endDate: Date; }[]) => void;
    events?: EventType[];
    autoSubmit?: boolean;
    handleEventClick: (event: EventType, type: EventType['type']) => void;
    weekends?: boolean;
    showlegend?: boolean;
    selectable?: boolean;
    holidays?: Holiday[];
}

export interface WeekHeaderProps {
    currentWeek: Date;
    setCurrentWeek: React.Dispatch<React.SetStateAction<Date>>;
}

export interface DayColumnProps {
    day: Date;
    calendarRef: React.RefObject<HTMLDivElement>;
    setSelectedSlots: React.Dispatch<React.SetStateAction<{ slot: TimeUnit; day: Date }[]>>;
    selectedSlots: { slot: TimeUnit; day: Date }[];
    allPossibleTimeUnits: { slot: TimeUnit; day: Date }[];
    events: EventType[];
    handleEventClick: (event: EventType, type: EventType['type']) => void;
}

export interface TimeSlotProps {
    selectedSlots: { slot: TimeUnit; day: Date }[]; // List of selected time slots
    handleMouseMove: (e: React.MouseEvent, slot: TimeUnit, day: Date) => void; // Handle mouse move for dragging
    handleMouseDown: (slot: TimeUnit, day: Date) => void; // Handle mouse down for starting drag
    handleMouseUp: (slot: TimeUnit, day: Date) => void; // Handle mouse up for ending drag
    handleSlotClick: (slot: TimeUnit, day: Date) => void; // Handle click on a slot
    allPossibleTimeUnits: Slot[]; // List of all possible time units
    day: Date; // The specific day for this time slot
    isDragging: boolean; // Indicates if dragging is in progress
    dragStart: { slot: TimeUnit; day: Date } | null; // Start of the drag range
    dragEnd: { slot: TimeUnit; day: Date } | null; // End of the drag range
    slot: Slot; // Current time slot
    children?: React.ReactNode;
    height: number;
}

export interface TimeSlotsProps {
    selectedSlots: { slot: TimeUnit; day: Date }[];
    allPossibleTimeUnits: Slot[];
    day: Date; 
    setSelectedSlots: React.Dispatch<React.SetStateAction<{ slot: TimeUnit; day: Date }[]>>
    calendarRef: React.RefObject<HTMLDivElement>;
    events?: EventType[];
    handleEventClick: (event: EventType, type: EventType['type']) => void;
}

export interface TimeColumnProps {
    allPossibleTimeUnits: TimeUnit[];
    selectedSlots: { slot: TimeUnit; day: Date }[];
    setSelectedSlots: React.Dispatch<React.SetStateAction<{ slot: TimeUnit; day: Date }[]>>
    currentWeek: Date;
    selectable: Boolean;
}

export enum EventBgColor {
    Availability = 'rgba(0, 255, 0, 0.5)',       // Neutral: green for availability
    Exam = 'rgba(255, 0, 0, 0.6)',               // Negative: red for exams
    coveredWithUser = 'rgba(0, 128, 0, 0.6)',    // Perfect: darker green for fully covered with user
    coveredWithoutUser = 'rgba(0, 255, 0, 0.4)', // Perfect: lighter green for fully covered without user
    notCoveredWithUser = 'rgba(255, 140, 0, 0.7)', // Good: orange for partially covered with user
    notCoveredWithoutUser = 'rgba(255, 140, 0, 0.5)', // Good: lighter orange for partially covered without user
    minUsersWithUser = 'rgba(255, 165, 0, 0.8)', // Barely acceptable: gold for min users with user
    minUsersWithoutUser = 'rgba(255, 165, 0, 0.6)', // Barely acceptable: lighter gold for min users without user
    lessThanMinUsersWithUser = 'rgba(255, 69, 0, 0.8)', // Terrible: bright red-orange for less than min users with user
    lessThanMinUsersWithoutUser = 'rgba(255, 69, 0, 0.7)', // Terrible: slightly lighter red-orange for less than min users without user
    overlap = 'rgba(0, 0, 255, 0.5)'             // Neutral: blue for overlaps
}

export enum EventBgTexture {
    Solid = 'solid',          // Solid color background
    Striped = 'striped',      // Diagonal stripes
    Dotted = 'dotted',        // Dots pattern
    Gridded = 'gridded',      // Grid pattern
    Dashed = 'dashed',        // Dashed lines
    Checkered = 'checkered'   // Checkered pattern
}

export interface SlotSize {
    width: number;
    height: number;
}