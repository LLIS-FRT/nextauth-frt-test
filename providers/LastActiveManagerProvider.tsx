"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@prisma/client';

const DEBOUNCE_DELAY = 1000 * 60 * 5;

interface LastActiveContextType {
    updateLastActive: () => void;
    lastActive: Date | null; // Include lastActive in the context type
}

const LastActiveContext = createContext<LastActiveContextType | undefined>(undefined);

export const useLastActive = () => {
    const context = useContext(LastActiveContext);
    if (!context) {
        throw new Error('useLastActive must be used within a LastActiveManagerProvider');
    }
    return context;
};

// Debounce utility function to delay function execution
function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const LastActiveManagerProvider = ({ children, dbSession }: { children: React.ReactNode, dbSession: Session | null }) => {
    const [lastActive, setLastActive] = useState<Date | null>(null);

    const updateLastActive = useCallback(() => {
        if (dbSession) setLastActive(new Date());
        if (dbSession) {
            fetch('/api/user/keep-alive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: dbSession.id, lastActive: new Date() }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                })
                .catch(console.error);
        }
    }, [dbSession]); // Add dbSession as dependency

    useEffect(() => {
        updateLastActive(); // Initialize on mount

        const debouncedUpdate = debounce(() => {
            updateLastActive();
        }, DEBOUNCE_DELAY); // Debouncing by 1 minute

        const handleUserActivity = () => {
            debouncedUpdate(); // Call debounced function
        };

        // Attach event listeners
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);

        return () => {
            // Cleanup event listeners
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
        };
    }, [updateLastActive]); // Only depends on updateLastActive

    return (
        <LastActiveContext.Provider value={{ updateLastActive, lastActive }}> {/* Provide lastActive */}
            {children}
        </LastActiveContext.Provider>
    );
};
