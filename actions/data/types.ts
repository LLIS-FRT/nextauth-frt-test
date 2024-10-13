export interface GetReportsProps {
    missionNumber?: string | number; // The mission number
}

export interface GetReportsResponse {
    reports: Report[];
}

export enum PatientGender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other",
}

export interface PatientInfo {
    firstName: string;
    lastName: string;
    matricule: string;
    IAM: string;
    age: number;
    gender: PatientGender;
}

export enum AirwayState {
    FREE = "Free",
    OBSTRUCTED = "Obstructed",
}

export enum RespiratoryRate {
    APNEA = "Apnea",
    BRADYPNEA = "Bradypnea",
    EUPNEA = "Eupnea",
    TACHYPNEA = "Tachypnea",
}

export enum Letters {
    TRAUMA = "T",
    SUSPECTED_FRACTURE = "F",
    INTERNAL_PAIN = "I",
    BLEEDING = "B",
    BURN_OR_CHEMICAL_BURN = "V",
}

export interface BodyDiagramLetters {
    id: number;
    x: number;
    y: number;
    letter: Letters;
}

export interface AbcdeSchema {
    criticalBleeding: {
        problem: boolean;
        tourniquet: {
            applied: boolean;
            time: Date;
        };
        manualCompression: boolean;
    };
    airway: {
        problem: boolean;
        airwayState: AirwayState;
        cervicalSpineTrauma: boolean;
        stiffneck: boolean;
    };
    breathing: {
        problem: boolean;
        respiratoryRate: RespiratoryRate;
        auscultationEqual: boolean;
        thorax: "Stable" | "Unstable";
        oxygenAdministration: {
            performed: boolean;
            amountL: number;
            method: "Nasal Cannula" | "Oxygen Mask" | "Ambu Bag";
        };
        assistedBreathing: boolean;
        hyperventilationMask: boolean;
        upperBodyElevated: boolean;
    };
    circulation: {
        problem: boolean;
        pulsRegularity: "Regular" | "Irregular";
        pulsePalpability: "Good Palpability" | "Poor Palpability";
        pulseBPM: number;
        systolicBP: number;
        diastolicBP: number;
        spo2: number;
        abdomenState: "Soft" | "Hard";
        pelvisState: "Stable" | "Unstable";
        thighState: "Stable" | "Unstable";
        supinePosition: boolean;
        shockPosition: boolean;
        recoveryPosition: boolean;
    };
    disability: {
        problem: boolean;
        movement: {
            right: "Normal" | "Limited" | "None";
            left: "Normal" | "Limited" | "None";
        };
        pupils: {
            left: {
                size: "Tight" | "Normal" | "Wide" | "Dyscoria";
                lightReactive: boolean;
            };
            right: {
                size: "Tight" | "Normal" | "Wide" | "Dyscoria";
                lightReactive: boolean;
            };
        };
        avpu: "Alert" | "Voice" | "Pain" | "Unresponsive";
        dms: {
            performed: boolean;
            dProblem: boolean;
            mProblem: boolean;
            sProblem: boolean;
        };
        beFast: {
            performed: boolean;
            balanceProblem: boolean;
            eyesProblem: boolean;
            faceProblem: boolean;
            armsProblem: boolean;
            speachProblem: boolean;
            symptomOnset: Date;
            details: string;
        };
        bodyTemperatureC: number;
        bloodSugar: number;
    };
    exposureEnvironment: {
        problem: boolean;
        painScale: number;
        bodyCheckPerformed: boolean;
        furtherInjuries: string;
        bodyDiagramLetters: BodyDiagramLetters[];
        heatRetention: boolean;
        woundCare: boolean;
        limbSplinting: boolean;
    }
}

export interface SamplerSchema {
    symptoms: {
        problem: boolean;
        text: string;
        onsetTime: Date;
    };
    allergies: {
        problem: boolean;
        text: string;
    };
    medications: {
        problem: boolean;
        text: string;
    };
    pastMedicalHistory: {
        problem: boolean;
        text: string;
    };
    lastOralIntake: {
        problem: boolean;
        type: "Solid" | "Liquid";
        time: Date;
        text: string;
    };
    events: {
        problem: boolean;
        text: string;
    };
    riskFactors: {
        problem: boolean;
        text: string;
    };
}

export interface MissionInfo {
    shortReport: string;
    location: string;
    valuablesGivenTo: string;
    urgencyLevel: "U4" | "U3" | "U2" | "U1";
    sepasContacted: boolean;
    ambulanceCalled: boolean;
    times: {
        callTime: Date;
        responseTime: Date;
        onSiteTime: Date;
        freeOnRadioTime: Date;
        finishedTime: Date;
    };
}

export interface FirstResponders {
    teamId: string;
    firstResponders: {
        firstName: string;
        lastName: string;
        email: string;
        position: string;
        id: string;
        IAM: string;
    }[];
}

export interface Report {
    id: string;
    missionNumber: number;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    archived: boolean;
    resolved: boolean;
    patientInfo?: PatientInfo;
    firstResponders?: FirstResponders;
    abcdeSchema?: AbcdeSchema;
    samplerSchema?: SamplerSchema;
    missionInfo?: MissionInfo;
}

export interface CreateReportResponse {
    report: Report;
}
