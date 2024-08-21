'use client';

import { Views } from "react-big-calendar"
import { Calendar } from "../_components/calendar"

const CalendarPage = () => {
  const startDate = new Date(2024, 7, 20, 0, 0, 0);
  const startDate2 = new Date(2024, 7, 21, 0, 0, 0);
  const endDate = new Date(2024, 7, 20, 20, 0, 0);

  return (
    <div className="h-full w-full mt-5 items-center bg-white justify-center no-scrollbar">
      <Calendar
        defaultView={Views.WEEK}
        events={[
          {
            allDay: false,
            title: "Timed Event",
            // Start time is this morning at 8
            start: startDate,
            end: endDate
          }, 
          {
            allDay: true,
            title: "All Day Event",
            // Start time is this morning at 8
            start: startDate2,
            end: startDate2
          }
        ]}
      />
    </div>
  )
}

export default CalendarPage