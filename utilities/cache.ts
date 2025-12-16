import rawData from "../data/meteorites_medium.json" assert { type: "json" };

import { getDistribution, normalizeString } from "./utils.ts";

import { Meteorite, Meteorites, MeteoriteRaw, MeteoritesDBFormat } from "../types/types.ts";

type MeteoritesRoot = { meteorites: MeteoritesDBFormat; };

const rootData = rawData as MeteoritesRoot;

const initialRawData: MeteoriteRaw[] = Object.values(rootData.meteorites);

const safeParseInt = (s: string | undefined): number | null => {

    if (!s || s.trim() === "") return null;

    const n = parseInt(s);

    return isNaN(n) ? null : n;

};

const safeParseFloat = (s: string | undefined): number | null => {

    if (!s || s.trim() === "") return null;

    const n = parseFloat(s);

    return isNaN(n) ? null : n;

};

export const cachedMeteoritesCleaned: Meteorites = initialRawData.map((m) => ({...m,

        year: safeParseInt(m.year),

        mass: safeParseFloat(m.mass),

        latitude: safeParseFloat(m.latitude),

        longitude: safeParseFloat(m.longitude),

    })

);

export let cachedStatsResult: unknown | null = null;

export let cachedShuffledMeteorites: Meteorites = [];

export const meteoritesByID: Map<string, Meteorite> = new Map();

export const meteoritesByName: Map<string, Meteorite> = new Map();

export const meteoritesByRecclass: Map<string, Meteorite[]> = new Map();

export const meteoritesByFall: Map<string, Meteorite[]> = new Map();

function initializeIndexes(meteorites: Meteorites) {

    for (const m of meteorites) {

        if (m.id) meteoritesByID.set(m.id, m);

        if (m.name) meteoritesByName.set(normalizeString(m.name), m);

        if (m.recclass) {

            const key = m.recclass.toLowerCase();

            if (!meteoritesByRecclass.has(key)) {

                meteoritesByRecclass.set(key, []);

            }

            meteoritesByRecclass.get(key)!.push(m);

        }

        if (m.fall) {

            const key = m.fall.toLowerCase();

            if (!meteoritesByFall.has(key)) meteoritesByFall.set(key, []);

            meteoritesByFall.get(key)!.push(m);

        }

    }

}

function preShuffle(meteorites: Meteorites) {

    const shuffled: Meteorites = meteorites.slice();

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j: number = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

    }

    cachedShuffledMeteorites = shuffled;

}

function calculateAndCacheStats(meteorites: Meteorites) {

    let minYear: number | null = null;

    let maxYear: number | null = null;

    let minMass: number | null = null;

    let maxMass: number | null = null;

    let totalMass: number = 0;

    let countMass: number = 0;

    const yearsSet: Set<string> = new Set();

    const recclassesSet: Set<string> = new Set();

    let countFell: number = 0;

    let countFound: number = 0;

    let totalCount: number = 0;

    let geolocatedCount: number = 0;

    for (const m of meteorites) {

        totalCount++;

        const y: number | null = m.year as number | null;

        if (y !== null && !isNaN(y)) {

            if (minYear === null || y < minYear) minYear = y;

            if (maxYear === null || y > maxYear) maxYear = y;

        }

        const mass: number | null = m.mass as number | null;

        if (mass !== null && !isNaN(mass) && mass > 0) {

            if (minMass === null || mass < minMass) minMass = mass;

            if (maxMass === null || mass > maxMass) maxMass = mass;

            totalMass += mass;

            countMass++;

        }

        if (m.year) yearsSet.add(m.year.toString());

        if (m.recclass) recclassesSet.add(m.recclass.trim());

        if (m.fall?.toLowerCase() === "fell") countFell++;

        if (m.fall?.toLowerCase() === "found") countFound++;

        if (m.latitude !== null && m.longitude !== null && !isNaN(m.latitude as number) && !isNaN(m.longitude as number)) geolocatedCount++;
    
    }

    cachedStatsResult = {

        "meteorites_count": totalCount,

        "min_year": minYear?.toString(),

        "max_year": maxYear?.toString(),

        "min_mass_g": minMass,

        "max_mass_g": maxMass,

        "avg_mass_g": (countMass > 0) ? parseFloat((totalMass / countMass).toFixed(2)) : null,
        
        "years": Array.from(yearsSet).map(Number).sort((a, b) => a - b).map(String),

        "years_distribution": getDistribution(meteorites, "year"),

        "recclasses": Array.from(recclassesSet).sort(),

        "recclasses_distribution": getDistribution(meteorites, "recclass"),

        "geolocated_count": geolocatedCount,

        "fall_counts": {

            "fell": countFell,

            "found": countFound,

        },

    };

}

initializeIndexes(cachedMeteoritesCleaned);

preShuffle(cachedMeteoritesCleaned);

calculateAndCacheStats(cachedMeteoritesCleaned);

export async function loadMeteorites(): Promise<Meteorites> { return cachedMeteoritesCleaned; }