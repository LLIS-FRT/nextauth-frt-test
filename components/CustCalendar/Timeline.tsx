const Timeline = () => {
    const calcTimePassedInDayPercentage = (): number | null => {
        const now = new Date();

        // Define the start and end times (08:00 to 21:00)
        const startHour = 8;
        const endHour = 21;

        const hour = now.getHours();
        const minute = now.getMinutes();

        // Check if the current time is outside the 08:00 - 21:00 window
        if (hour < startHour) return 0;
        if (hour >= endHour && minute > 0) return null;

        // Total minutes in the defined time range (08:00 - 21:00 is 780 minutes)
        const totalMinutes = (endHour - startHour) * 60;

        // Calculate how many minutes have passed since 08:00
        const minutesPassedToday = ((hour - startHour) * 60) + minute;

        // Calculate the percentage of the time range that has passed
        const perc = (minutesPassedToday / totalMinutes) * 100;

        return perc;
    };

    const percentage = calcTimePassedInDayPercentage();

    return percentage === null ? null : (
        <div
            className="h-[2px] absolute w-full bg-orange-400"
            style={{ top: `${percentage}%` }}
        />
    )
}

export default Timeline