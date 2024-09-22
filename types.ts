//#region Enums
enum PatientGender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other",
}

enum FoodType {
    SOLID = "Solid",
    LIQUID = "Liquid",
}

enum AirwayCondition {
    FREE = "Free",
    OBSTRUCTED = "Obstructed",
}

enum BreathingSpeed {
    NONE = "Apnea",
    SLOW = "Bradypnea",
    NORMAL = "Eupnea",
    FAST = "Tachypnea",
}

enum AdministrationMethod {
    NASAL = "Nasal Cannula",
    MASK = "Oxygen Mask",
    AMBU = "Ambu Bag",
}

enum PulseRythm {
    REGULAR = "Regular",
    IRREGULAR = "Irregular",
}

enum PulsePalpability {
    GOOD = "Good",
    POOR = "Poor",
}

enum AbdomenCondition {
    SOFT = "Soft",
    HARD = "Hard",
}

enum Stability {
    STABLE = "Stable",
    UNSTABLE = "Unstable",
}

enum MovementCondition {
    NORMAL = "Normal",
    LIMITED = "Limited",
    NONE = "None",
}

enum PupilCondition {
    THIGHT = "Thight",
    NORMAL = "Normal",
    WIDE = "Wide",
    DYSCORIA = "Dyscoria",
}

enum AVPU {
    ALERT = "Alert",
    VOICE = "Voice",
    PAIN = "Pain",
    UNRESPONSIVE = "Unresponsive",
}

enum Letters {
    TRAUMA = "T",
    SUSPECTED_FRACTURE = "F",
    PAIN = "I",
    BLEEDING = "B",
    BURN_OR_CHEMICAL_BURN = "V"
}
//#endregion

//#region Report Interfaces
interface PatientInfo {
    age: number;
    gender: PatientGender;
    firstName: string;
    lastName: string;
    IAM: string;
    matricule: string;
}

interface FirstResponders {
    teamID: string;
    responders: {
        [key: string]: FirstResponder;
    };
}

interface FirstResponder {
    userId: string;
    position: string;
}

interface MissionInfo {
    quickReport: string;
    location: string;
    valuablesGivenTo: string;
    sepasContacted: boolean;
    ambulanceCalled: boolean;
    urgenceLevel: number;
    callTime: Date;
    responseTime: Date;
    onSiteTime: Date;
    finishedTime: Date;
    freeOnRadioTime: Date;
}

interface SamplerSchema {
    symptoms: {
        text: string;
        problem: boolean;
    };
    allergies: {
        text: string;
        problem: boolean;
    };
    medications: {
        text: string;
        problem: boolean;
        hasImage: boolean;
        image: string;
    };
    pastMedicalHistory: {
        text: string;
        problem: boolean;
    };
    lastOralIntake: {
        text: string;
        problem: boolean;
        type: FoodType;
        time: Date;
    };
    events: {
        text: string;
        problem: boolean;
    };
    riskFactors: {
        text: string;
        problem: boolean;
    };
}

interface CMS {
    circulationProblem: boolean;
    motionProblem: boolean;
    sensationProblem: boolean;
}

interface FAST {
    facialProblem: boolean;
    armsProblem: boolean;
    speachProblem: boolean;
    time: Date;
    text: string;
}

interface BodyDiagramLetter {
    id: number;
    x: number;
    y: number;
    letter: Letters;
}

interface AbcdeSchema {
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
        airway: AirwayCondition;
        cervicalSpineTrauma: boolean;
        esmarch: boolean;
        wendl: boolean;
        guedl: boolean;
        suctionClearing: boolean;
        stiffneck: boolean;
    };

    breathing: {
        problem: boolean;
        breathingSpeed: BreathingSpeed;
        auscultationEqual: boolean;
        thoraxStability: Stability;
        oxygen: {
            administration: boolean;
            method: AdministrationMethod;
            amount: number;
        };
        assistedBreathing: boolean;
        hyperventilationMask: boolean;
        elevatedUpperBody: boolean;
    };

    circulation: {
        problem: boolean;
        pulseRythm: PulseRythm;
        pulsePalpable: PulsePalpability;
        bpm: number;
        bloodPressure: {
            systolic: number;
            diastolic: number;
        };
        abdomenCondition: AbdomenCondition;
        pelvisStability: Stability;
        thighStability: Stability;
        bloodOxygen: number;
        supinePosition: boolean;
        shockPosition: boolean;
        recoveryPosition: boolean;
        pressureBandage: boolean;
    };

    disability: {
        problem: boolean;
        movement: {
            right: MovementCondition;
            left: MovementCondition;
        },
        pupils: {
            right: {
                size: PupilCondition;
                lightReactive: boolean;
            };
            left: {
                size: PupilCondition;
                lightReactive: boolean;
            };
        }
        avpu: AVPU;
        CMS: CMS;
        FAST: FAST;
        temperatureC: number;
        bloodGlucose: number;
    };

    environment: {
        problem: boolean;
        painScale: number;
        bodyCheck: number;
        furtherInjuries: string;
        woundCare: boolean;
        heatRetention: boolean;
        limbSplinting: boolean;
        bodyDiagramLetters: BodyDiagramLetter[];
    };
}

interface ReportType {
    id?: string;
    createdById: string;
    missionNumber?: number;
    firstResponders?: FirstResponders;
    patientInfo?: PatientInfo;
    missionInfo?: MissionInfo;
    samplerSchema?: SamplerSchema;
    abcdeSchema?: AbcdeSchema;
    archived?: boolean;
    resolved?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
//#endregion
