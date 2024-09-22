
import { WebUntis } from "webuntis";

declare global {
    var untis: WebUntis | undefined
}

const school = process.env.UNTIS_SCHOOL;
const username = process.env.UNTIS_USERNAME;
const password = process.env.UNTIS_PWD;
const baseUrl = process.env.UNTIS_BASE_URL;

if (!school || !username || !password || !baseUrl) throw new Error(`Missing ${!school ? "School" : !username ? "Username" : !password ? "Password" : "Base URL"}! Check .env file`);
export const untis = globalThis.untis || new WebUntis(school, username, password, baseUrl);

if (process.env.NODE_ENV !== "production") globalThis.untis = untis;