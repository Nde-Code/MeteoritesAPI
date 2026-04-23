import rawData from "../data/meteorites_small.json";

import { normalizeString, sortDistribution } from "./utils.ts";

import { Meteorite, Meteorites, MeteoriteRaw, MeteoritesRaw, MeteoritesDBFormat } from "../types/types.ts";

type MeteoritesRoot = { meteorites: MeteoritesDBFormat };

export let cachedMeteoritesCleaned: Meteorites = [];

export let cachedShuffledMeteorites: Meteorites = [];

export let cachedStatsResult: unknown = null;

export const meteoritesByID: Map<string, Meteorite> = new Map<string, Meteorite>();

export const meteoritesByName: Map<string, Meteorite> = new Map<string, Meteorite>();

const safeParse = (v: string | undefined, parser: typeof parseInt | typeof parseFloat) => {

    if (!v || v.trim() === "") return null;

    const n = parser(v);

    return isNaN(n) ? null : n;

};

function initializeData() {

    const rootData: MeteoritesRoot = rawData as MeteoritesRoot;

    const initialRawData: MeteoritesRaw = Object.values(rootData.meteorites);
    
    const cleaned: Meteorites = [];

    const yearsDist: Record<string, number> = {};

    const classesDist: Record<string, number> = {};
    
    let minYear = Infinity, maxYear = -Infinity;

    let minMass = Infinity, maxMass = -Infinity;

    let totalMass = 0, countMass = 0, geolocatedCount = 0;

    let countFell = 0, countFound = 0;

    for (const m of initialRawData) {

        const year = safeParse(m.year, parseInt);

        const mass = safeParse(m.mass, parseFloat);

        const lat = safeParse(m.latitude, parseFloat);

        const lon = safeParse(m.longitude, parseFloat);

        const meteorite: Meteorite = { ...m, year, mass, latitude: lat, longitude: lon };

        cleaned.push(meteorite);

        if (m.id) meteoritesByID.set(m.id, meteorite);

        if (m.name) meteoritesByName.set(normalizeString(m.name), meteorite);

        if (year !== null) {

            if (year < minYear) minYear = year;

            if (year > maxYear) maxYear = year;

            yearsDist[year] = (yearsDist[year] || 0) + 1;

        }

        if (mass !== null && mass > 0) {

            if (mass < minMass) minMass = mass;

            if (mass > maxMass) maxMass = mass;

            totalMass += mass;

            countMass++;

        }

        if (m.recclass) {

            const rc = m.recclass.trim();

            classesDist[rc] = (classesDist[rc] || 0) + 1;

        }

        const fall = m.fall?.toLowerCase();

        if (fall === "fell") countFell++;

        else if (fall === "found") countFound++;
        
        if (lat !== null && lon !== null) geolocatedCount++;

    }

    cachedMeteoritesCleaned = cleaned;

    const shuffled = [...cleaned];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

    }

    cachedShuffledMeteorites = shuffled;

    cachedStatsResult = {

        meteorites_count: cleaned.length,

        min_year: (minYear === Infinity) ? null : minYear.toString(),

        max_year: (maxYear === -Infinity) ? null : maxYear.toString(),

        min_mass_g: (minMass === Infinity) ? null : minMass,

        max_mass_g: (maxMass === -Infinity) ? null : maxMass,

        avg_mass_g: (countMass > 0) ? parseFloat((totalMass / countMass).toFixed(2)) : null,

        years: Object.keys(yearsDist).sort((a, b) => Number(a) - Number(b)),

        years_distribution: sortDistribution(yearsDist, "year"),

        recclasses: Object.keys(classesDist).sort(),

        recclasses_distribution: sortDistribution(classesDist, "recclass"),

        geolocated_count: geolocatedCount,

        fall_counts: { fell: countFell, found: countFound }

    };

}

initializeData();

export const isCacheReady: boolean = cachedMeteoritesCleaned.length > 0 && meteoritesByID.size > 0 && cachedStatsResult !== null;