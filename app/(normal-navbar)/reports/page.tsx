"use client";

import { getReports } from '@/actions/data/report';
import { Report } from '@/actions/data/types';
import { RoleGate } from '@/components/auth/roleGate';
import ReportCards from '@/components/reports/reportCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const SearchArea = ({ handleSearch }: { handleSearch: (year: string, month: string, day: string, id: string) => void }) => {
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [id, setId] = useState('');

    useEffect(() => {
        handleSearch(year, month, day, id);
    }, [year, month, day, id, handleSearch]);

    return (
        <div className="space-y-2 mb-2">
            <div>
                <Label>Date</Label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                    <div>
                        <Input
                            id="year"
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="YYYY"
                            maxLength={4}
                        />
                    </div>
                    <div>
                        <Input
                            id="month"
                            type="text"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            placeholder="MM"
                            maxLength={2}
                        />
                    </div>
                    <div>
                        <Input
                            id="day"
                            type="text"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            placeholder="DD"
                            maxLength={2}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Label htmlFor="id">ID</Label>
                <Input
                    id="id"
                    type="number"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="##"
                    max={99}
                    min={1}
                />
            </div>
        </div>
    );
};

const ReportsPage = () => {
    const [filteredReports, setFilteredReports] = useState<Report[] | undefined>([]);
    const [createReportModalOpen, setCreateReportModalOpen] = useState(false);

    const { refetch: refetchReports, isLoading: isLoadingReports, data: reports, isError: isErrorReports, error } = useQuery({
        queryKey: ["reports"],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const { reports } = await getReports({ missionNumber: undefined });
            if (!reports) throw new Error('No reports found');

            return reports;
        },
    });

    const handleCreateReport = () => {
        setCreateReportModalOpen((prev) => !prev);
    };

    const handleSearch = (year: string, month: string, day: string, id: string) => {
        const filteredReports = reports?.filter((report) => {
            const missionNumber = report.missionNumber.toString();

            const reportYear = missionNumber.substring(0, 4);
            const reportMonth = missionNumber.substring(4, 6);
            const reportDay = missionNumber.substring(6, 8);
            const reportId = missionNumber.substring(8);

            return (
                (year === '' || reportYear === year) &&
                (month === '' || reportMonth === month) &&
                (day === '' || reportDay === day) &&
                (id === '' || reportId === id)
            );
        });

        setFilteredReports(filteredReports);
    };

    // TODO: Make more mobile friendly

    return (
        <div className="flex w-full min-h-full">
            <RoleGate
                allowedRoles={[
                    UserRole.USER,
                ]}
            >
                <div className="flex w-full h-full">
                    {/* Search Area on the Left */}
                    <div className="w-1/3 sm:w-1/4 bg-gray-100 p-4 border-r border-gray-300 flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">Search Reports</h2>
                        <SearchArea handleSearch={handleSearch} />
                        <hr className="mb-2" />
                        <div className="flex justify-between flex-grow items-end w-full"> {/* Ensure flex-grow is here to push the button down */}
                            <Button
                                className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 w-full"
                                size={"lg"}
                                onClick={handleCreateReport}
                            >
                                Create Report
                            </Button>
                        </div>
                    </div>

                    {/* Reports Display on the Right */}
                    <div className="w-2/3 sm:w-3/4 bg-white p-4 flex flex-col h-full overflow-y-auto"> {/* Allow this section to scroll */}
                        {isLoadingReports ? (
                            <div className="flex items-center justify-center bg-white w-full flex-grow">
                                <p>Loading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center bg-white w-full flex-grow">
                                <h1 className="text-2xl text-center font-bold mb-4 w-full">Reports</h1>
                                {isErrorReports ? (
                                    <div className="flex items-center justify-center bg-white w-full flex-grow">
                                        <p>{error.message}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 flex-grow overflow-y-auto"> {/* Allow this to scroll */}
                                        {filteredReports && filteredReports.map((report) => (
                                            <ReportCards key={report.id} report={report} />
                                        ))}
                                        {/* Example placeholder content */}
                                        {Array.from({ length: 50 }).map((_, index) => (
                                            <div key={index} className="h-10 bg-gray-200">Placeholder</div>
                                        ))}
                                    </div>
                                )}
                                <div className="h-10 bg-transparent"></div> {/* Optional padding for scrolling effect */}
                            </div>
                        )}
                    </div>
                </div>
            </RoleGate>
        </div>
    );
};

export default ReportsPage;
