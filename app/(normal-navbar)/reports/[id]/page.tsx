"use client";

import { getReports } from '@/actions/data/report';
import ReportForm from '@/components/report/reportForm';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation'
import { Suspense } from 'react';

const ReportPage = () => {
    const missionNumber = useParams().id.toString();

    const { refetch: refetchReports, isLoading: isLoadingReports, data: report } = useQuery({
        queryKey: ["reports", missionNumber],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const { reports } = await getReports({ missionNumber });

            if (!reports) return undefined;

            return reports[0];
        },
        retry: 0
    })

    if (isLoadingReports) return <div>Loading Reports...</div>

    return (
        <div className="flex justify-center w-full h-full bg-white">
            <div className="mt-2 w-full h-full">
                <Suspense>
                    <ReportForm report={report} missionNumber={missionNumber} />
                </Suspense>
            </div>
        </div>
    )
}

export default ReportPage