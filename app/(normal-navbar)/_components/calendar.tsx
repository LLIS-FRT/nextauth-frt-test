import React, { useCallback, useState } from 'react';
import { Calendar as BigCalendar, DateCellWrapperProps, DateHeaderProps, Event, EventProps, EventWrapperProps, HeaderProps, ResourceHeaderProps, ToolbarProps, View, Views, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';

dayjs().format();

const localizer = dayjsLocalizer(dayjs);

interface CalendarProps {
    events?: Event[];
    defaultView?: View;
    views?: View[];
}

// Calendar component definition
export const Calendar = ({
    events,
    defaultView = Views.WEEK,
    views = [Views.WORK_WEEK, Views.WEEK, Views.DAY, Views.MONTH, Views.AGENDA],
}: CalendarProps) => {
    const [view, setView] = useState<View>(defaultView);

    const handleOnChangeView = (selectedView: View) => setView(selectedView);

    const [date, setDate] = useState(new Date());
    const onNavigate = useCallback(
        (newDate: Date) => {
            return setDate(newDate);
        },
        [setDate]
    );

    return (
        <BigCalendar
            localizer={localizer}
            date={date}
            events={events}
            view={view}
            defaultView={defaultView}
            views={views}
            onNavigate={onNavigate}
            onView={handleOnChangeView}
            formats={{
                timeGutterFormat: 'HH:mm',
            }}
            components={{
                event: (args: EventProps<Event>) => {
                    const {
                        continuesAfter,
                        continuesPrior,
                        event,
                        localizer,
                        slotStart,
                        slotEnd,
                        title,
                        isAllDay,
                    } = args;

                    return (
                        <div>
                            Event
                        </div>
                    )
                },
                eventContainerWrapper: (args: { children?: React.ReactNode, className?: string }) => {
                    const { children, className } = args;

                    return (
                        <div className={`${className}`}>
                            {children}
                            Event Container Wrapper
                        </div>
                    )
                },
                // Done: The Events (basically)
                eventWrapper: (args: EventWrapperProps<Event>) => {
                    const {
                        accessors,
                        className,
                        continuesEarlier,
                        continuesLater,
                        event,
                        getters,
                        isRtl,
                        label,
                        onClick,
                        onDoubleClick,
                        selected,
                        style
                    } = args;

                    const {
                        allDay,
                        end,
                        resource,
                        start,
                        title
                    } = event;

                    const DateComponent = ({ startDate, endDate }: { startDate: Date | undefined, endDate: Date | undefined }) => {

                        return (
                            <div>
                                Start: {startDate?.toLocaleDateString()}<br />
                                End: {endDate?.toLocaleDateString()}
                                <br /><br />
                                Start Time: {startDate?.toLocaleTimeString()}<br />
                                End Time: {endDate?.toLocaleTimeString()}<br /><br />
                            </div>
                        )
                    }

                    // TODO: Fix

                    return (
                        <div className={`${className} bg-blue-200`} onClick={onClick} onDoubleClick={onDoubleClick}>
                            {/* Start with the time at the top left */}
                            {/* Then the title underneath */}
                            <DateComponent
                                startDate={start}
                                endDate={end}
                            />
                            {title}
                        </div>
                    )
                },
                // Done: The small cells at the top of each day colum (contains the all day events)
                dateCellWrapper: (args: DateCellWrapperProps) => {
                    const {
                        children,
                        range,
                        value
                    } = args;

                    return (
                        <div className="w-full h-full">
                            {children}
                        </div>
                    )
                },
                // Done: The columns of each day
                dayColumnWrapper: (args: { children?: React.ReactNode, className?: string, date?: Date, slotMetrics?: any }) => {
                    const { children, className, date, slotMetrics } = args;

                    return (
                        <div className={`${className}`}>
                            {children}
                        </div>
                    )
                },
                // Done: Each line of time slots, so to say each time lane
                timeSlotWrapper: (args: { children?: React.ReactNode, resource?: any, value?: Date }) => {
                    const {
                        children,
                        resource,
                        value
                    } = args;

                    return (
                        <div>
                            {children}
                        </div>
                    )
                },
                // The little box at the top left of the calendar
                timeGutterHeader: () => {
                    return (
                        <div className='h-full w-full'>
                            ???
                        </div>
                    )
                },
                // ???
                resourceHeader: (args: ResourceHeaderProps<object>) => {
                    const {
                        index,
                        label,
                        resource
                    } = args;

                    return (
                        <div>
                            Resource Header
                        </div>
                    )
                },
                // Done
                toolbar: (args: ToolbarProps<Event, object>) => {
                    const {
                        date,
                        label,
                        localizer,
                        onNavigate,
                        onView,
                        view,
                        views,
                        children
                    } = args;

                    const formatViewLabel = (view: View) => {
                        let formattedViewLabel: string = "";

                        switch (view) {
                            case Views.AGENDA: formattedViewLabel = "Agenda";
                                break;

                            case Views.DAY: formattedViewLabel = "Day";
                                break;

                            case Views.MONTH: formattedViewLabel = "Month";
                                break;

                            case Views.WEEK: formattedViewLabel = "Week";
                                break;

                            case Views.WORK_WEEK: formattedViewLabel = "Work Week";
                                break;

                            default: formattedViewLabel = "Uknown?";
                                break;
                        }

                        return formattedViewLabel;
                    }

                    const viewsArray = Object.values(views);
                    const leftButtons = [
                        "Today",
                        "Back",
                        "Next",
                    ];

                    const onClickLeftButton = (button: string) => {
                        switch (button) {
                            case "Today":
                                onNavigate("TODAY");
                                break;

                            case "Back":
                                onNavigate("PREV");
                                break;

                            case "Next":
                                onNavigate("NEXT");
                                break;

                            default:
                                console.error("Unknown button type:", button);
                                break;
                        }
                    };

                    return (
                        <div className="flex items-center justify-between bg-gray-100">
                            <div className="items-center p-2">
                                {leftButtons.map((v, index) => {
                                    return (
                                        <Button
                                            key={index}
                                            variant={v === view ? "secondary" : "outline"}
                                            onClick={() => onClickLeftButton(v)}
                                        >
                                            {v}
                                        </Button>
                                    )
                                })}
                            </div>
                            {label}
                            <div className="items-center p-2">
                                {viewsArray.map((v, index) => {
                                    return (
                                        <Button
                                            key={index}
                                            variant={v === view ? "secondary" : "outline"}
                                            onClick={() => onView(v)}
                                        >
                                            {formatViewLabel(v)}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                },
                agenda: {
                    event: (args: EventProps<Event>) => {
                        const {
                            continuesAfter,
                            continuesPrior,
                            event,
                            localizer,
                            slotStart,
                            slotEnd,
                            title,
                            isAllDay,
                        } = args;

                        return (
                            <div>
                                Agenda {" > "} Event
                            </div>
                        )
                    },
                    time: (args: { day?: Date, event?: Event, label?: string }) => {
                        const {
                            day,
                            event,
                            label
                        } = args;

                        return (
                            <div>
                                Agenda {" > "} Time
                            </div>
                        )
                    },
                    date: (args: { day?: Date, label?: string }) => {
                        const {
                            day,
                            label
                        } = args;

                        return (
                            <div>
                                Agenda {" > "} Date
                            </div>
                        )
                    },
                },
                day: {
                    header: (args: HeaderProps) => {
                        const {
                            date,
                            label,
                            localizer,
                        } = args;

                        return (
                            <div>
                                Day {" > "} Header
                            </div>
                        )
                    },
                    event: (args: EventProps<Event>) => {
                        const {
                            continuesAfter,
                            continuesPrior,
                            event,
                            localizer,
                            slotStart,
                            slotEnd,
                            title,
                            isAllDay,
                        } = args;

                        return (
                            <div>
                                Day {" > "} Event
                            </div>
                        )
                    },
                },
                week: {
                    // Done
                    header: (args: HeaderProps) => {
                        // The label where it says the day of the week in the week view
                        const {
                            date,
                            label,
                            localizer,
                        } = args;

                        return (
                            <div>
                                {label}
                            </div>
                        )
                    },
                    event: (args: EventProps<Event>) => {
                        const {
                            continuesAfter,
                            continuesPrior,
                            event,
                            localizer,
                            slotStart,
                            slotEnd,
                            title,
                            isAllDay,
                        } = args;

                        return (
                            <div>
                                Week {" > "} Event
                            </div>
                        )
                    },
                },
                month: {
                    dateHeader: (args: DateHeaderProps) => {
                        const {
                            date,
                            label,
                            drilldownView,
                            isOffRange,
                            onDrillDown,
                        } = args;

                        return (
                            <div>
                                Month {" > "} Date Header
                            </div>
                        )
                    },

                    header: (args: HeaderProps) => {
                        const {
                            date,
                            label,
                            localizer,
                        } = args;

                        return (
                            <div>
                                Month {" > "} Header
                            </div>
                        )
                    },
                    event: (args: EventProps<Event>) => {
                        const {
                            continuesAfter,
                            continuesPrior,
                            event,
                            localizer,
                            slotStart,
                            slotEnd,
                            title,
                            isAllDay,
                        } = args;

                        return (
                            <div>
                                Month {" > "} Event
                            </div>
                        )
                    },
                },
                header: (args: HeaderProps) => {
                    const {
                        date,
                        label,
                        localizer,
                    } = args;

                    return (
                        <div>
                            Header
                        </div>
                    )
                },
                // ???
                timeGutterWrapper: (args: { children?: React.ReactNode, slotMetrics?: any }) => {
                    const { children, slotMetrics } = args;

                    return (
                        <div className='h-full w-full'>
                            {children}
                        </div>
                    )
                },
                work_week: {
                    event: (args: EventProps<Event>) => {
                        const {
                            continuesAfter,
                            continuesPrior,
                            event,
                            localizer,
                            slotStart,
                            slotEnd,
                            title,
                            isAllDay,
                        } = args;

                        return (
                            <div>
                                Work Week {" > "} Event
                            </div>
                        )
                    },
                    header: (args: HeaderProps) => {
                        const {
                            date,
                            label,
                            localizer,
                        } = args;

                        return (
                            <div>
                                Work Week {" > "} Header
                            </div>
                        )
                    }
                }
            }}
        />
    );
};
