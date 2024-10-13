"use client";

import { generateMissionNumber } from "@/actions/data/report"
import { MissionInfo, Report, PatientInfo, AbcdeSchema, SamplerSchema, FirstResponders } from "@/actions/data/types"
import { useEffect, useState } from "react";
import MissionNumber from "./missionNumber";
import FirstRespondersForm from "./firstRespondersForm";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ReportForm = ({ report, missionNumber }: { report: Report | undefined, missionNumber: string }) => {
    const newDate = new Date();

    const [missionInfo, setMissionInfo] = useState<MissionInfo | undefined>(report?.missionInfo);
    const [patientInfo, setPatientInfo] = useState<PatientInfo | undefined>(report?.patientInfo)
    const [abcdeSchema, setAbcdeSchema] = useState<AbcdeSchema | undefined>(report?.abcdeSchema)
    const [samplerSchema, setSamplerSchema] = useState<SamplerSchema | undefined>(report?.samplerSchema)
    const [firstResponders, setFirstResponders] = useState<FirstResponders | undefined>(report?.firstResponders)
    const [isValidMissionNumber, setIsValidMissionNumber] = useState<boolean>(false);
    const [generatedID, setGeneratedID] = useState<string>("");

    let state: "create" | "update" | "view" = "view"

    if (!report) state = "create";

    if (report) {
        // TODO: Check if the user can actually update this report
    }

    const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const data = {
            missionInfo,
            patientInfo,
            abcdeSchema,
            samplerSchema,
            firstResponders,
            missionNumber
        }
        toast.success("Submitted")
        console.log({ data })
    }

    useEffect(() => {
        const checkValidity = async () => {
            const generatedID = await generateMissionNumber();
            setGeneratedID(generatedID.toString());
            if(missionNumber === generatedID.toString()) return setIsValidMissionNumber(true);
        }

        if (!missionNumber) return setIsValidMissionNumber(false);
        if (missionNumber.length != 10) return setIsValidMissionNumber(false);
        checkValidity();
    }, [])

    if (!isValidMissionNumber) {
        return (
            <div className="w-full h-full flex flex-col items-center">
                <MissionNumber />
                <p>This is not a valid mission number</p>
                <p>If you are trying to view an existing report, please double check the url.</p>
                <p>If you are creating a new report, use the following mission number: <a href={`${window.location.origin}/reports/${generatedID}`}>{generatedID}</a></p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col items-center">
            <MissionNumber missionNumber={missionNumber} />
            <FirstRespondersForm firstRespondersData={firstResponders} setFirstResponders={setFirstResponders} disabled={state === "view"} />
            <Button disabled={state === "view"} onClick={handleSubmit}>
                Submit
            </Button>
        </div>
    )
}

export default ReportForm