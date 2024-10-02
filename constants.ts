// After this time, the user will be logged out IF they are inactive
export const INACTIVE_EXPIRATION_MS = 1000 * 60 * 30; // 30 minutes

// After this time, the user will be logged out, even if they are active
export const ACTIVE_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// A warning is shown to an inactive user if their session will expire in this many seconds
export const SHOW_POPUP_DELAY_S = 2 * 60; // 2 minutes