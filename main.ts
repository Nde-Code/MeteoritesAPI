import { createJsonResponse } from "./utilities/create_json.ts";

import { checkTimeRateLimit, hashIp } from "./utilities/rate.ts"; 

import {

    cachedMeteoritesCleaned,

    cachedShuffledMeteorites,

    cachedStatsResult,

    meteoritesByID,

    meteoritesByName,

} from "./utilities/cache.ts";

import { Config, Env, Filters, Meteorite, Meteorites } from "./types/types.ts";

import { config } from "./config.ts";

import {

    getTrimmedParam,

    isConfigValidWithMinValues,

    isPositiveInteger,

    normalizeString,

    printLogLine,

    toNumber,

} from "./utilities/utils.ts";

async function handler(req: Request, env: Env): Promise<Response> {
        
    config.HASH_KEY = env.HASH_KEY ?? "";

    const url: URL = new URL(req.url);

    const pathname: string = url.pathname;

    const ip: string = req.headers.get("cf-connecting-ip") ?? "unknown";

    const hashedIP: string = await hashIp(ip);

    const configMinValues: Partial<Record<keyof Config, number>> = {

        RATE_LIMIT_INTERVAL_S: 1,

        MAX_RANDOM_METEORITES: 100,

        MAX_RETURNED_SEARCH_RESULTS: 100,

        MIN_RADIUS: 1,

        MAX_RADIUS: 1000,

        DEFAULT_RANDOM_NUMBER_OF_METEORITES: 100,

    };

    if (!config.HASH_KEY) return createJsonResponse({ "error": "Your credentials are missing." }, 500);
    
    if (!isConfigValidWithMinValues(config, configMinValues)) return createJsonResponse({"error": "Invalid configuration detected. Please refer to the documentation."}, 500);

    if (!hashedIP || hashedIP.length !== 64) return createJsonResponse({"error": "Unable to hash your IP, which is required for security."}, 403);
    
    if (req.method === "OPTIONS") {

        return new Response(null, {

            status: 204,

            headers: {

                "Access-Control-Allow-Origin": "*",

                "Access-Control-Allow-Methods": "GET, OPTIONS",

                "Access-Control-Allow-Headers": "Content-Type",

                "Access-Control-Max-Age": "86400"

            }

        });

    }

    if (req.method === "GET" && pathname === "/") return createJsonResponse({ "success": "Welcome to the API root. Refer to the documentation at https://github.com/Nde-Code/meteorites-api." }, 200);

    if (req.method === "GET" && pathname === "/stats") {

        if (!(await checkTimeRateLimit(hashedIP))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${config.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);  
        
        const startPerformanceWithStats: number = performance.now();

        if (!cachedStatsResult) return createJsonResponse({ "error": "Internal error: Stats not pre-calculated." }, 500);

        const statsResponse: Response = createJsonResponse({ "success": cachedStatsResult }, 200);

        printLogLine("INFO", `Returned /stats data after: ${(performance.now() - startPerformanceWithStats).toFixed(2)} ms.`);
        
        return statsResponse;

    }

    if (req.method === "GET" && pathname === "/random") {

        if (!(await checkTimeRateLimit(hashedIP))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${config.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);

        const countParam: string | null = url.searchParams.get("count");

        let requestedCount: number = countParam ? parseInt(countParam) : config.DEFAULT_RANDOM_NUMBER_OF_METEORITES;

        if (isNaN(requestedCount) || requestedCount <= 0) requestedCount = config.DEFAULT_RANDOM_NUMBER_OF_METEORITES;

        if (requestedCount > config.MAX_RANDOM_METEORITES) return createJsonResponse({ "error": `The number of meteorites requested exceeded the limit of ${config.MAX_RANDOM_METEORITES}` }, 400);

        const startPerformanceWithRandom: number = performance.now();
    
        const randomMeteorites: Meteorites = cachedShuffledMeteorites.slice(0, requestedCount);

        const randomResponse: Response = createJsonResponse({

            "success": {

                "count": randomMeteorites.length,

                "meteorites": randomMeteorites

            }

        }, 200);

        printLogLine("INFO", `Returned ${randomMeteorites.length} meteorite${randomMeteorites.length !== 1 ? "s" : ""} from ${pathname + url.search} after: ${(performance.now() - startPerformanceWithRandom).toFixed(2)} ms.`);

        return randomResponse;

    }

    if (req.method === "GET" && pathname === "/get") {

        if (!(await checkTimeRateLimit(hashedIP))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${config.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);  
        
        const query: URLSearchParams = url.searchParams;

        const id: string | null = getTrimmedParam(query.get("id"));

        const name: string | null = getTrimmedParam(query.get("name"));

        if (!id && !name) return createJsonResponse({ "error": "Please provide either 'id' or 'name' as a query parameter." }, 400);

        if (id && name) return createJsonResponse({ "error": "Please provide either 'id' or 'name', not both." }, 400);

        if (id && isPositiveInteger(parseFloat(id)) === false) return createJsonResponse({ "error": "The ID must be a positive integer." }, 400);

        const startPerformanceWithGet: number = performance.now();

        let result: Meteorite | undefined;

        if (id) result = meteoritesByID.get(id);
            
        else if (name) result = meteoritesByName.get(normalizeString(name!));

        if (!result) {

            printLogLine("WARN", `Unable to find using ${pathname + url.search} after: ${(performance.now() - startPerformanceWithGet).toFixed(2)} ms.`);

            return createJsonResponse({ "error": "No meteorite found for the given identifier." }, 404);

        }

        printLogLine("INFO", `Returned meteorite from ${pathname + url.search} after: ${(performance.now() - startPerformanceWithGet).toFixed(2)} ms.`);
        
        return createJsonResponse({ "success": { "meteorite": result } }, 200);

    }

    if (req.method === "GET" && pathname === "/search") {

        if (!(await checkTimeRateLimit(hashedIP))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${config.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);

        const query: URLSearchParams = url.searchParams;

        const filters: Filters = {

            recclass: getTrimmedParam(query.get("recclass")),

            fall: getTrimmedParam(query.get("fall")),

            year: toNumber(getTrimmedParam(query.get("year"))),

            minYear: toNumber(getTrimmedParam(query.get("minYear"))),

            maxYear: toNumber(getTrimmedParam(query.get("maxYear"))),

            mass: toNumber(getTrimmedParam(query.get("mass"))),

            minMass: toNumber(getTrimmedParam(query.get("minMass"))),

            maxMass: toNumber(getTrimmedParam(query.get("maxMass"))),

            centerLat: toNumber(getTrimmedParam(query.get("centerLatitude"))),

            centerLon: toNumber(getTrimmedParam(query.get("centerLongitude"))),

            radius: toNumber(getTrimmedParam(query.get("radius"))),

            limit: toNumber(getTrimmedParam(query.get("limit")))

        };

        if (!filters.recclass && !filters.fall && filters.year === null && filters.minYear === null && filters.maxYear === null && filters.mass === null && filters.minMass === null && filters.maxMass === null && filters.centerLat === null && filters.centerLon === null && filters.radius === null) return createJsonResponse({ "error": "At least one valid filter parameter is required in the search query." }, 400);

        if (filters.fall && filters.fall.toLowerCase() !== "fell" && filters.fall.toLowerCase() !== "found") return createJsonResponse({ "error": "The fall filter must be set to either 'fell' or 'found'." }, 400);

        if (filters.year !== null && (filters.minYear !== null || filters.maxYear !== null)) return createJsonResponse({ "error": "Cannot combine 'year' with 'minYear' or 'maxYear'." }, 400);

        if (filters.mass !== null && (filters.minMass !== null || filters.maxMass !== null)) return createJsonResponse({ "error": "Cannot combine 'mass' with 'minMass' or 'maxMass'." }, 400);

        if (filters.radius !== null && (filters.radius < config.MIN_RADIUS || filters.radius > config.MAX_RADIUS)) return createJsonResponse({ "error": `The radius must be between ${config.MIN_RADIUS} km and ${config.MAX_RADIUS} km.` }, 400);

        const limit = (filters.limit && isPositiveInteger(filters.limit)) ? Math.min(filters.limit, config.MAX_RETURNED_SEARCH_RESULTS) : config.MAX_RETURNED_SEARCH_RESULTS;

        const useLocation: boolean = filters.centerLat !== null && filters.centerLon !== null && filters.radius !== null;

        const startPerformanceWithSearch: number = performance.now();

        let latMin = 0, latMax = 0, lonMin = 0, lonMax = 0;

        const R_EARTH = 6371;

        let maxDistSq: number = 0;

        if (useLocation) {

            const latRad = filters.centerLat! * Math.PI / 180;

            const latDelta = filters.radius! / R_EARTH * (180 / Math.PI);

            const cosLat = Math.cos(latRad) || 1;

            latMin = filters.centerLat! - latDelta;

            latMax = filters.centerLat! + latDelta;

            lonMin = filters.centerLon! - latDelta / cosLat;

            lonMax = filters.centerLon! + latDelta / cosLat;

            maxDistSq = (filters.radius! / R_EARTH) ** 2;

        }

        const results: Meteorites = [];

        const data: Meteorites = cachedMeteoritesCleaned;

        const recclassFilter = filters.recclass?.toLowerCase() ?? null;

        const fallFilter = filters.fall?.toLowerCase() ?? null;

        const centerLat: number | null = filters.centerLat;

        const centerLon: number | null = filters.centerLon;

        const degToRad = Math.PI / 180;

        for (let i = 0; i < data.length; i++) {

            const m = data[i];

            if (recclassFilter && m.recclass?.toLowerCase() !== recclassFilter) continue;

            if (fallFilter && m.fall?.toLowerCase() !== fallFilter) continue;

            if (filters.year !== null) {

                if (m.year !== filters.year) continue;

            } else {

                if (filters.minYear !== null && (m.year === null || m.year < filters.minYear)) continue;

                if (filters.maxYear !== null && (m.year === null || m.year > filters.maxYear)) continue;

            }

            if (filters.mass !== null) {

                if (m.mass !== filters.mass) continue;

            } else {

                if (filters.minMass !== null && (m.mass === null || m.mass < filters.minMass)) continue;

                if (filters.maxMass !== null && (m.mass === null || m.mass > filters.maxMass)) continue;

            }

            if (useLocation) {

                const lat = m.latitude as number | null;

                const lon = m.longitude as number | null;

                if (lat === null || lon === null || lat < latMin || lat > latMax || lon < lonMin || lon > lonMax) continue;

                const dLat = (lat - centerLat!) * degToRad;

                const dLon = (lon - centerLon!) * degToRad;

                const x = dLon * Math.cos((lat + centerLat!) * degToRad * 0.5);

                if ((x * x + dLat * dLat) > maxDistSq) continue;

            }

            results.push(m);

            if (results.length >= limit || results.length >= config.MAX_RETURNED_SEARCH_RESULTS) break;

        }

        printLogLine("INFO", `Returned ${results.length} meteorite${(results.length !== 1) ? "s" : ""} from ${pathname + url.search} after: ${(performance.now() - startPerformanceWithSearch).toFixed(2)} ms.`);

        return createJsonResponse({ "success": { "count": results.length, "meteorites": results } }, 200);

    }

    return createJsonResponse({ "error": "The requested endpoint is invalid." }, 404);
    
}

export default {

    async fetch(req: Request, env: Env): Promise<Response> { return handler(req, env); }

};