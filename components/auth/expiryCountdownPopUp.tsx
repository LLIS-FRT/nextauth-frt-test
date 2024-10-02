"use client";
import { useEffect, useState } from "react";
import { Session } from "@prisma/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "../ui/dialog";
import { Button } from "../ui/button";
import { LogoutButton } from "./logoutButton";
import { getTimeUntilExpiry } from "@/lib/auth";
import { SHOW_POPUP_DELAY_S } from "@/constants";
import { signOut } from "next-auth/react";

const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minutesStr = minutes.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');

    return `${minutesStr}:${secsStr}`; // Format as MM:SS
};

const ExpiryCountdownPopUp = ({ dbSession }: { dbSession: Session | null | undefined }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const isDev = process.env.NODE_ENV === 'development';

    // Fetch user data on component mount
    useEffect(() => {
        if (!dbSession) return;

        const fetchUserData = async () => {
            const time = await getTimeUntilExpiry(dbSession);
            setTimeLeft(time);
            setLoadingUser(false);
        };

        fetchUserData();
    }, [dbSession]);

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


                if (isLessThanOrEqualZero && dbSession) signOut().then(() => window.location.href = "/");
                return newTime;
            }); // Decrease timeLeft every second
        }, 1000);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [showPopup, dbSession]);


    if (!dbSession) {
        if (isDev) return <div>DEV MSG: No Session</div>;
        else return null
    }
    if (loadingUser) {
        if (isDev) return <div>DEV MSG: Loading</div>;
        else return null
    }

    const handleRefresh = () => {
        if (!dbSession) return;
        async function refresh() {
            const res = await fetch("/api/user");
            const user = await res.json();

            const time = await getTimeUntilExpiry(user);
            setTimeLeft(time);
            setShowPopup((prev) => !prev);
        }

        refresh();
    };

    return (
        <div>
            {isDev && <div>DEV MSG: Time Left: {formatTimeLeft(timeLeft)} | Session ID: {dbSession.id}</div>}
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
