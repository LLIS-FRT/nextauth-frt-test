import { Report } from '@prisma/client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const formatMissionNumber = (missionNumber: string) => {
    const datePart = missionNumber.slice(0, 8); // yyyymmdd
    const reportNumberPart = missionNumber.slice(8); // XX

    // Format date as DD/MM/YYYY
    const formattedDate = `${datePart.slice(6, 8)}/${datePart.slice(4, 6)}/${datePart.slice(0, 4)}`;

    return { formattedDate, reportNumberPart };
};

const ReportCards = ({ report }: { report: Report }) => {
    const { archived, missionNumber, resolved } = report;

    const firstResponders = report.firstResponders as {
        teamID: string;
        [key: string]: { position: string; IAM: string } | string;
    };

    const missionInfo = report.missionInfo as {
        quickReport: string;
    };

    const { formattedDate, reportNumberPart } = formatMissionNumber(missionNumber.toString());

    return (
        <Card className="mb-6 shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-blue-50 px-6 py-4">
                <CardTitle className="text-lg font-semibold text-blue-700">
                    Mission Report #{reportNumberPart}
                </CardTitle>
                <CardDescription className="text-gray-600">
                    <span className="font-medium">Date:</span> {formattedDate}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4">
                <div className="mb-4">
                    <strong className="block text-sm text-gray-700 mb-1">Quick Report:</strong>
                    <p className="text-sm text-gray-900">{missionInfo?.quickReport}</p>
                </div>
                <div className="mb-4">
                    <strong className="block text-sm text-gray-700 mb-1">Team ID:</strong>
                    <p className="text-sm text-gray-900">{firstResponders?.teamID}</p>
                </div>
                <div className="space-y-3">
                    {Object.entries(firstResponders).map(([key, value]) => {
                        if (key === 'teamID') return null; // Skip teamID
                        const position = typeof value === 'string' ? value : value.position;
                        const IAM = typeof value === 'string' ? '' : value.IAM;
                        return (
                            <div key={key} className="flex justify-between items-center">
                                <div className="font-semibold text-gray-800">{position}</div>
                                <div className="text-gray-600 text-sm">{IAM}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            resolved ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                        {resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                    {archived && (
                        <span className="ml-3 inline-block px-3 py-1 rounded-full bg-gray-500 text-white text-sm font-semibold">
                            Archived
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ReportCards;
