import { Config, Meteorites } from "../types/types.ts";

export function normalizeString(str: string): string {

    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

}

export function isConfigValidWithMinValues(config: Config,rules: Partial<Record<keyof Config, number>>): boolean {

    for (const [key, minValue] of Object.entries(rules)) {

        const value = config[key as keyof Config];

        if (typeof value !== "number" || value < (minValue ?? 0)) return false;

    }

    return true;

}

export function printLogLine(level: "INFO" | "WARN" | "ERROR", text: string): void {

    const now: Date = new Date();

    const timestamp: string = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    console.log(`[${timestamp}][${level}] ${text}`);

}

function getEquiRectangularDistance(latitude_1: number,longitude_1: number, latitude_2: number, longitude_2: number): number {
    
    const R: number = 6371;

    const toRad: (x: number) => number = (x: number) => (x * Math.PI) / 180;

    const lat1Rad: number = toRad(latitude_1);

    const lat2Rad: number = toRad(latitude_2);

    const dLat: number = lat2Rad - lat1Rad;

    const dLon: number = toRad(longitude_2 - longitude_1);

    const x: number = dLon * Math.cos((lat1Rad + lat2Rad) / 2);

    const distance: number = R * Math.sqrt(x * x + dLat * dLat);

    return distance;

}

export function isPositiveInteger(n: number): boolean { return Number.isInteger(n) && n > 0; }

export function filterByDate(results: Meteorites, year: number | null, minYear: number | null, maxYear: number | null): Meteorites {
    
    if (year === null && minYear === null && maxYear === null) return results;

    return results.filter((m) => {
        
        const y: number | null = m.year as number | null;

        if (y === null || isNaN(y)) return false;

        if (year !== null) return y === year;

        if (minYear !== null && y < minYear) return false;

        if (maxYear !== null && y > maxYear) return false;

        return true;

    });

}

export function filterByMass(results: Meteorites, mass: number | null, minMass: number | null, maxMass: number | null): Meteorites {
    
    if (mass === null && minMass === null && maxMass === null) return results;

    return results.filter((m) => {

        const massVal: number | null = m.mass as number | null;

        if (massVal === null || isNaN(massVal)) return false;

        if (mass !== null && massVal !== mass) return false;

        if (minMass !== null && massVal < minMass) return false;

        if (maxMass !== null && massVal > maxMass) return false;

        return true;

    });

}

export function filterByLocation(results: Meteorites, centerLat: number | null, centerLon: number | null, radius: number | null): Meteorites {
    
    if (centerLat === null || centerLon === null || radius === null) return results;

    if (isNaN(centerLat) || isNaN(centerLon) || isNaN(radius)) return results;

    const R_EARTH_KM: number = 6371;

    const latDelta: number = radius / R_EARTH_KM * (180 / Math.PI);

    const centerLatRad: number = centerLat * (Math.PI / 180);

    const cosLat: number = Math.cos(centerLatRad);

    const lonDelta: number = (cosLat === 0) ? latDelta : radius / (R_EARTH_KM * cosLat) * (180 / Math.PI);

    const latMin: number = centerLat - latDelta;

    const latMax: number = centerLat + latDelta;

    const lonMin: number = centerLon - lonDelta;

    const lonMax: number = centerLon + lonDelta;

    return results.filter((m) => {

        const latM: number | null = m.latitude as number | null;

        const lonM: number | null = m.longitude as number | null;

        if (latM === null || lonM === null || isNaN(latM) || isNaN(lonM)) return false;

        if (latM < latMin || latM > latMax || lonM < lonMin || lonM > lonMax) return false;

        return getEquiRectangularDistance(centerLat, centerLon, latM, lonM) <= radius;

    });
}

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