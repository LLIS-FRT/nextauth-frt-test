import { Button } from "../ui/button";
import { WeekHeaderProps } from "./types";
import { firstFriday, formatFullDate } from "./utils";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const WeekHeader = ({ currentWeek, setCurrentWeek }: WeekHeaderProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null); // Reference to the date picker element

  // Close the date picker when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [datePickerRef]);

  function getNextWeek() {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)));
  }

  function getPreviousWeek() {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)));
  }

  function goToToday() {
    setCurrentWeek(new Date());
  }

  function handleDateChange(date: Date | null) {
    if (!date) return setCurrentWeek(new Date());
    // Get the first Friday of the selected date
    const firstFridayOfWeek = firstFriday(date);
    setCurrentWeek(firstFridayOfWeek);
    setIsDatePickerOpen(false);
  }

  // Function to filter out weekends (Saturdays and Sundays)
  function isWeekday(date: Date) {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  }

  const variant: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" = "outline";

  return (
    <div className="flex justify-between items-center mb-6">
      <Button onClick={getPreviousWeek} variant={variant}>Previous Week</Button>

      <div className="relative text-center">
        <span
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          className="cursor-pointer text-lg font-medium"
        >
          Week of {formatFullDate(firstFriday(currentWeek))}
        </span>
        {isDatePickerOpen && (
          <div ref={datePickerRef} className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
            <DatePicker
              selected={currentWeek}
              onChange={handleDateChange}
              inline
              filterDate={isWeekday} // Hides weekends
              showWeekPicker
              dateFormatCalendar="'Friday', MMMM d, yyyy" // Escaping 'Week of' as a literal string
              className="bg-white p-2 shadow-lg border rounded"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button onClick={goToToday} variant="ghost">Today</Button>
        <Button onClick={getNextWeek} variant={variant}>Next Week</Button>
      </div>
    </div>
  );
};

export default WeekHeader;
