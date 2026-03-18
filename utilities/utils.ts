import { StaticConfig, Meteorites } from "../types/types.ts";

export function createJsonResponse(body: object, status = 200, headers: HeadersInit = {}): Response {

    return new Response(JSON.stringify(body), {

        status,

        headers: {

            "Content-Type": "application/json",

            "Access-Control-Allow-Origin": "*",

            ...headers

        }

    });

}

export function normalizeString(str: string): string {

    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

}

export function isConfigValidWithMinValues(config: StaticConfig, rules: Partial<Record<keyof StaticConfig, number>>): boolean {
    
    for (const key in rules) {

        const typedKey = key as keyof StaticConfig;

        const minValue = rules[typedKey];

        const value = config[typedKey];

        if (minValue !== undefined && (value === undefined || value < minValue)) return false;

    }

    return true;

}

export function printLogLine(level: "INFO" | "WARN" | "ERROR", text: string): void {

    const MAX_LOG_LENGTH: number = 2000;

    const output: string = (text.length <= MAX_LOG_LENGTH) ? text : `${text.substring(0, MAX_LOG_LENGTH)} [...]`;

    console.log(`[${level}] ${output}`);

}

export function isPositiveInteger(n: number): boolean { return Number.isInteger(n) && n > 0; }

export function sortDistribution(countMap: Record<string, number>, field: "year" | "recclass"): Record<string, number> {

    const entries = Object.entries(countMap);

    if (field === "year") entries.sort((a, b) => Number(a[0]) - Number(b[0]));

    else entries.sort((a, b) => b[1] - a[1]);

    return Object.fromEntries(entries);

}

export function getTrimmedParam(param: string | null | undefined): string | null {

    const MAX_PARAM_LENGTH: number = 256;

    if (typeof param !== "string") return null;

    if (param.length > MAX_PARAM_LENGTH + 100) return null; 

    const trimmed: string = param.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_PARAM_LENGTH) return null;

    return trimmed;
    
}

export function toNumber(value: string | null | undefined): number | null {

    if (typeof value !== "string") return null;

    const trimmed: string = value.trim();

    if (trimmed.length === 0) return null;

    const n: number = Number(trimmed);

    return isNaN(n) ? null : n;
    
}