// After this time, the user will be logged out IF they are inactive
export const INACTIVE_EXPIRATION_MS = 1000 * 60 * 30; // 30 minutes

// After this time, the user will be logged out, even if they are active
export const ACTIVE_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 1 day

// A warning is shown to an inactive user if their session will expire in this many seconds
export const SHOW_POPUP_DELAY_S = 2 * 60; // 2 minutes

export const timeunits = [
    { name: '1', startTime: 800, endTime: 850, isBreak: false, isSelectable: false },
    { name: '2', startTime: 850, endTime: 940, isBreak: false, isSelectable: false },
    { name: '3', startTime: 955, endTime: 1045, isBreak: false, isSelectable: false },
    { name: '4', startTime: 1045, endTime: 1135, isBreak: false, isSelectable: false },
    { name: '5', startTime: 1135, endTime: 1225, isBreak: false, isSelectable: false },
    { name: '6', startTime: 1225, endTime: 1315, isBreak: false, isSelectable: false },
    { name: '7', startTime: 1315, endTime: 1405, isBreak: false, isSelectable: false },
    { name: '8', startTime: 1420, endTime: 1510, isBreak: false, isSelectable: false },
    { name: '9', startTime: 1510, endTime: 1600, isBreak: false, isSelectable: false },
    { name: '10', startTime: 1600, endTime: 1650, isBreak: false, isSelectable: false },
    { name: '11', startTime: 1650, endTime: 1740, isBreak: false, isSelectable: false },
    { name: '12', startTime: 1740, endTime: 1830, isBreak: false, isSelectable: false },
    { name: '13', startTime: 1830, endTime: 1920, isBreak: false, isSelectable: false },
    { name: '14', startTime: 1920, endTime: 2010, isBreak: false, isSelectable: false },
    { name: '15', startTime: 2010, endTime: 2100, isBreak: false, isSelectable: false },
];