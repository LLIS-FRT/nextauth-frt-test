import { WeekHeaderProps } from "./types"
import { firstFriday, formatFullDate } from "./utils"

const WeekHeader = ({ currentWeek, setCurrentWeek }: WeekHeaderProps) => {
  function getNextWeek() {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)));
  }

  function getPreviousWeek() {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)));
  }

  return (
    <div className="flex justify-between mb-4">
      <button onClick={() => getPreviousWeek()}>Previous Week</button>
      <span>Week of {formatFullDate(firstFriday(currentWeek))}</span>
      <button onClick={() => getNextWeek()}>Next Week</button>
    </div>
  )
}

export default WeekHeader