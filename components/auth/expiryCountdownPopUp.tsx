"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "../ui/dialog";
import { Button } from "../ui/button";
import { LogoutButton } from "./logoutButton";
import { getTimeUntilExpiry } from "@/lib/auth";
import { SHOW_POPUP_DELAY_S } from "@/constants";
import { signOut } from "next-auth/react";
import { useLastActive } from "@/providers/LastActiveManagerProvider";

const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minutesStr = minutes.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');

    return `${minutesStr}:${secsStr}`; // Format as MM:SS
};

const ExpiryCountdownPopUp = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const isDev = true // process.env.NODE_ENV === 'development';

    const { lastActive, updateLastActive } = useLastActive(); // Access lastActive from the context

    // Fetch user data on component mount
    useEffect(() => {
        if (!lastActive) return;

        const fetchUserData = async () => {
            const time = await getTimeUntilExpiry({ lastActiveAt: lastActive });
            setTimeLeft(time);
            setLoadingUser(false);
        };

        fetchUserData();
    }, [lastActive]);

    // Update timeLeft every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime > 0 ? prevTime - 1 : 0;
                const isLessThanShowPopupDelay = newTime <= SHOW_POPUP_DELAY_S;
                const isMoreThanZero = newTime > 0;
                const isLessThanOrEqualZero = newTime <= 0;

                const shouldShowPopup = isLessThanShowPopupDelay && isMoreThanZero;

                if (shouldShowPopup && !showPopup) setShowPopup(true);
                else if (!shouldShowPopup && showPopup) setShowPopup(false);


                if (isLessThanOrEqualZero && lastActive) signOut().then(() => window.location.href = "/");
                return newTime;
            }); // Decrease timeLeft every second
        }, 1000);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [showPopup, lastActive]);


    if (!lastActive) {
        if (isDev) return <div>DEV MSG: No Session</div>;
        else return null
    }
    if (loadingUser) {
        if (isDev) return <div>DEV MSG: Loading</div>;
        else return null
    }

    const handleRefresh = () => {
        if (!lastActive) return;
        async function refresh() {
            await updateLastActive();
            const time = await getTimeUntilExpiry({ lastActiveAt: lastActive });
            setTimeLeft(time);
            setShowPopup((prev) => !prev);
        }

        refresh();
    };

    return (
        <div>
            {isDev && <div>DEV MSG: Time Left: {formatTimeLeft(timeLeft)}</div>}
            {/* Popup notification */}
            {showPopup && (
                <Dialog open={showPopup}>
                    <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
                    <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-lg shadow-lg z-50">
                        <DialogTitle className="text-lg font-semibold">Session Expiration Warning</DialogTitle>
                        <DialogDescription className="mt-2">
                            Your session will expire in {formatTimeLeft(timeLeft)} minutes. Would you like to stay logged in?
                        </DialogDescription>
                        <div className="mt-4 flex justify-end gap-x-2">
                            <Button onClick={handleRefresh} variant="outline">
                                Yes, keep me logged in
                            </Button>
                            <LogoutButton>
                                <Button
                                    variant="secondary"
                                    className="text-left w-full"
                                    onClick={() => setShowPopup((prev) => !prev)}
                                >
                                    No, log me out
                                </Button>
                            </LogoutButton>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ExpiryCountdownPopUp;
