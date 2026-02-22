import { StaticConfig, Meteorites } from "../types/types.ts";

export function createJsonResponse(body: object, status: number = 200, headers: HeadersInit = {}): Response {

    return new Response(JSON.stringify(body), {

        status,

        headers: {

            "Content-Type": "application/json",

            "Access-Control-Allow-Origin": "*",

            ...headers,

        },

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

        if (minValue !== undefined && value < minValue) return false;

    }

    return true;

}

export function printLogLine(level: "INFO" | "WARN" | "ERROR", text: string): void { console.log(`[${level}] ${text}`); }

export function isPositiveInteger(n: number): boolean { return Number.isInteger(n) && n > 0; }

export function getDistribution(meteorites: Meteorites, field: "year" | "recclass"): Record<string, number> {
    
    const countMap: Record<string, number> = {};

    for (const m of meteorites) {

        const value = m[field];

        if (!value) continue;

        const key: string = value.toString().trim();

        if (!key) continue;

        countMap[key] = (countMap[key] || 0) + 1;

    }

    const sorted: [string, number][] = Object.entries(countMap).sort((a, b) => {

        if (field === "year") return (Number(a[0]) - Number(b[0]));

        else return (b[1] - a[1]);

    });

    const distribution: Record<string, number> = {};

    for (const [key, count] of sorted) {

        distribution[key] = count;

    }

    return distribution;
    
}

export function getTrimmedParam(param: string | null | undefined): string | null {

    if (typeof param !== "string") return null;

    const trimmed: string = param.trim();

    return (trimmed.length === 0) ? null : trimmed;

}

export function toNumber(value: string | null | undefined): number | null {

    if (typeof value !== "string") return null;

    const trimmed: string = value.trim();

    if (trimmed.length === 0) return null;

    const n: number = Number(trimmed);

    return isNaN(n) ? null : n;

}
