"use client";

import { useParams } from 'next/navigation'
import React from 'react'

const extractDateFromId = (id: string) => {
    const year = id.slice(0, 4);
    const month = id.slice(4, 6);
    const day = id.slice(6, 8);

    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

const ReportPage = () => {
    const missionNumber = useParams().id.toString();

    return (
        <div>ReportPage for {extractDateFromId(missionNumber).toDateString()}</div>
    )
}

export default ReportPage