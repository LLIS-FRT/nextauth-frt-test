import TimeSlots from "./TimeSlots";
import { DayColumnProps } from "./types";
import { formatWeekHeaderDate } from "./utils";

const DayColumn: React.FC<DayColumnProps> = ({
    allPossibleTimeUnits,
    day,
    selectedSlots,
    setSelectedSlots,
    calendarRef,
    events,
    showExam,
    showShift,
    showAvailability
}) => {
    const selectAllSlotsOfDay = () => {
        const allSlotsOfDay = allPossibleTimeUnits.map(slot => ({ slot, day }));
        
        // If all slots are already selected, unselect all of this day's slots
        if (selectedSlots.some(slot => slot.day.toDateString() === day.toDateString())) {
            setSelectedSlots(selectedSlots.filter(slot => slot.day.toDateString() !== day.toDateString()));
        } else {
            return;
            // TODO: We need to add logic to prevent the selection of unselectable slots
            setSelectedSlots([...selectedSlots, ...allSlotsOfDay]);
        }
    }
    
    return (
        <div key={day.toDateString()} className="flex flex-col border-r">
            <div className="border-b font-bold flex items-center justify-center h-14 overflow-hidden bg-gray-100" onClick={selectAllSlotsOfDay}>
                <h3 className="font-bold p-2">{formatWeekHeaderDate(day)}</h3>
            </div>
            <TimeSlots
                showAvailability={showAvailability}
                showExam={showExam}
                showShift={showShift}
                events={events}
                allPossibleTimeUnits={allPossibleTimeUnits}
                day={day}
                setSelectedSlots={setSelectedSlots}
                calendarRef={calendarRef}
                selectedSlots={selectedSlots}
            />
        </div>
    );
};

export default DayColumn;