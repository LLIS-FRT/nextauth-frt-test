import { untis } from "@/lib/untis";
import { Klasse } from 'webuntis';

export const getClasses = async (): Promise<Klasse[]> => {
    await untis.login();

    // Get current school year
    const currentSchoolYear = await untis.getCurrentSchoolyear(true);
    if (!currentSchoolYear) throw new Error("No current school year found");

    const classes = await untis.getClasses(true, currentSchoolYear.id);
    return classes;
}