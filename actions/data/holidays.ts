"use server";

import { untis } from "@/lib/untis";
import { Holiday } from "webuntis";

export const getHolidays = async (): Promise<Holiday[]> => {
    await untis.login();

    // Get the class id
    const holidays = await untis.getHolidays(true);

    return holidays;
};