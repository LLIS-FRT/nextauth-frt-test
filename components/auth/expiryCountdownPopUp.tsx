"use client";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "../ui/dialog";
import { Button } from "../ui/button";
import { LogoutButton } from "./logoutButton";
import { getTimeUntilExpiry } from "@/lib/auth";
import { SHOW_POPUP_DELAY_S } from "@/constants";
import { ExtendedUser } from "@/next-auth";
import { signOut } from "next-auth/react";

// When to show the warning

const ExpiryCountdownPopUp = ({ user }: { user: User | ExtendedUser | undefined }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch user data on component mount
    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            const time = await getTimeUntilExpiry(user);
            setTimeLeft(time);
            setLoadingUser(false);
        };

        fetchUserData();
    }, [user]);

    // Update timeLeft every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime > 0 ? prevTime - 1 : 0;
                const isLessThanShowPopupDelay = newTime <= SHOW_POPUP_DELAY_S;
                const isMoreThanZero = newTime > 0;
                const isLessThanOrEqualZero = newTime <= 0;

                console.log({
                    isLessThanShowPopupDelay,
                    isMoreThanZero,
                    isLessThanOrEqualZero,
                    showPopup
                });

                const shouldShowPopup = isLessThanShowPopupDelay && isMoreThanZero;

                if (shouldShowPopup && !showPopup) setShowPopup(true);
                else if (!shouldShowPopup && showPopup) setShowPopup(false);


                if (isLessThanOrEqualZero && user) {
                    signOut().then(() => window.location.href = "/");
                }

                return newTime;
            }); // Decrease timeLeft every second
        }, 1000);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [showPopup, user]);

    if (!user) return null;

    const formatTimeLeft = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const minutesStr = minutes.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');

        return `${minutesStr}:${secsStr}`; // Format as MM:SS
    };

    if (loadingUser) return null;


    const handleRefresh = () => {
        if (!user) return;
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
