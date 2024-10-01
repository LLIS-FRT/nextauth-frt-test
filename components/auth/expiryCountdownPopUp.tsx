"use client";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "../ui/dialog";
import { Button } from "../ui/button";
import { LogoutButton } from "./logoutButton";

const fetchUser = async (userID: string): Promise<User> => {
    const res = await fetch(`/api/user/${userID}`);
    const data = await res.json();
    return data.user;
}

// When to show the warning
const SHOW_POPUP_DELAY_S = 5 * 60; // 5 minutes

// When to refresh the user data
const REFRESH_INTERVAL_S = 20 * 60; // 10 minutes

const ExpiryCountdownPopUp = ({ userID }: { userID: string | undefined }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch user data on component mount
    useEffect(() => {
        if (!userID) return;

        const fetchUserData = async () => {
            const user = await fetchUser(userID);
            setTimeLeft(user.timeUntilExpiration);
            setLoadingUser(false);
        };

        fetchUserData();
    }, [userID]);

    // Update timeLeft every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime > 0 ? prevTime - 1 : 0;
                if (newTime <= SHOW_POPUP_DELAY_S && !showPopup && newTime > 0) {
                    setShowPopup(true);
                }
                return newTime;
            }); // Decrease timeLeft every second
        }, 1000);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [showPopup]);

    // Refetch user data after 10 minutes
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (userID) {
                const fetchUserData = async () => {
                    const user = await fetchUser(userID);
                    setTimeLeft(user.timeUntilExpiration);
                    setLoadingUser(false);
                };

                fetchUserData();
            }
        }, REFRESH_INTERVAL_S * 1000);

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, [userID]);

    if(!userID) return null;

    const formatTimeLeft = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // Format as MM:SS
    };

    if (loadingUser) return null;


    const handleRefresh = () => {
        // Make an api call just to refresh the session
        if (userID) {
            const fetchUserData = async () => {
                const user = await fetchUser(userID);
                setTimeLeft(user.timeUntilExpiration);
                setLoadingUser(false);
            };

            fetchUserData();
        }

        setShowPopup((prev) => !prev);
    };

    return (
        <div>
            {/* Popup notification */}
            {showPopup && (
                <Dialog open={showPopup} onOpenChange={setShowPopup}>
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
