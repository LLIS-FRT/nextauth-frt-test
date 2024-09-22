"use client";

import { RoleGate } from '@/components/auth/roleGate'
import ReportCards from '@/components/reports/reportCards';
import { UnderConstruction } from '@/components/underConstruction'
import { Report, UserRole } from '@prisma/client'
import React, { useEffect, useState } from 'react'

const ReportsPage = () => {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports') // Fetch data from the API route
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setReports(data)
            } catch (err) {
                setError('Failed to load reports')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchReports()
    }, [])


    return (
        <div className="flex bg-white w-full" style={{ height: "calc(100vh - 72px)" }}>
            <RoleGate
                allowedRoles={[
                    UserRole.ADMIN,
                    UserRole.MEMBER,
                ]}
            >
                {loading ? (
                    <div className="flex items-center justify-center bg-white w-full" style={{ height: "calc(100vh - 72px)" }}>
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center bg-white w-full" style={{ height: "calc(100vh - 72px)" }}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="flex items-center bg-white w-full flex-col" style={{ height: "calc(100vh - 72px)" }}>
                        <h1 className="text-2xl text-center font-bold mb-4 w-full">Reports</h1>
                        {reports.map((report) => (
                            <ReportCards key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </RoleGate>
        </div>
    )
}

export default ReportsPage
