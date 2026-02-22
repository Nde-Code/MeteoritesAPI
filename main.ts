import { checkTimeRateLimit, hashIp } from "./utilities/rate.ts"; 

import {

    cachedMeteoritesCleaned,

    cachedShuffledMeteorites,

    cachedStatsResult,

    meteoritesByID,

    meteoritesByName,

    isCacheReady

} from "./utilities/cache.ts";

import {
    
    Env,

    StaticConfig, 

    RuntimeConfig,
    
    Filters,
    
    Meteorite,
    
    Meteorites

} from "./types/types.ts";

import { config } from "./config.ts";

import {

    createJsonResponse,

    getTrimmedParam,

    isConfigValidWithMinValues,

    isPositiveInteger,

    normalizeString,

    printLogLine,

    toNumber,

} from "./utilities/utils.ts";

const configMinValues: Partial<Record<keyof StaticConfig, number>> = {

    RATE_LIMIT_INTERVAL_S: 1,

    MAX_RANDOM_METEORITES: 100,

    MAX_RETURNED_SEARCH_RESULTS: 100,

    MIN_RADIUS: 1,

    MAX_RADIUS: 1000,

    DEFAULT_RANDOM_NUMBER_OF_METEORITES: 100,

};

async function handler(req: Request, env: Env): Promise<Response> {
        
    const currentConfig: RuntimeConfig = {

        ...config,

        HASH_KEY: env.HASH_KEY ?? ""
        
    };

    const isConfigValid = isConfigValidWithMinValues(currentConfig, configMinValues) && currentConfig.DEFAULT_RANDOM_NUMBER_OF_METEORITES <= currentConfig.MAX_RANDOM_METEORITES;

    const url: URL = new URL(req.url);

    const pathname: string = url.pathname;

    if (pathname === "/favicon.ico") return new Response(null, { status: 204 });

    if (!currentConfig.HASH_KEY) return createJsonResponse({ "error": "Your credentials are missing." }, 500);
    
    if (!isConfigValid) return createJsonResponse({"error": "Invalid configuration detected. Please refer to the documentation."}, 500);
    
    if (!isCacheReady) {

        printLogLine("ERROR", "Data cache is not ready or empty.");

        return createJsonResponse({ "error": "Service is warming up or data source is unavailable." }, 503); 
    
    }

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

    if (req.method === "GET" && pathname === "/") return createJsonResponse({ "success": "Welcome to the API root. Refer to the documentation at https://github.com/Nde-Code/MeteoritesAPI." }, 200);

    if (req.method === "GET" && pathname === "/stats") {

        const hashedIP: string = await hashIp(req.headers.get("cf-connecting-ip") ?? "unknown", currentConfig.HASH_KEY);

        if (!(await checkTimeRateLimit(hashedIP, currentConfig.RATE_LIMIT_INTERVAL_S))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${currentConfig.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);  
        
        const statsResponse: Response = createJsonResponse({ "success": cachedStatsResult }, 200);

        printLogLine("INFO", `Returned /stats data.`);
        
        return statsResponse;

    }

    if (req.method === "GET" && pathname === "/random") {

        const hashedIP: string = await hashIp(req.headers.get("cf-connecting-ip") ?? "unknown", currentConfig.HASH_KEY);

        if (!(await checkTimeRateLimit(hashedIP, currentConfig.RATE_LIMIT_INTERVAL_S))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${currentConfig.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);  

        const countParam: string | null = url.searchParams.get("count");
        
        let requestedCount: number = countParam ? parseInt(countParam) : currentConfig.DEFAULT_RANDOM_NUMBER_OF_METEORITES;

        if (isNaN(requestedCount)) requestedCount = currentConfig.DEFAULT_RANDOM_NUMBER_OF_METEORITES;

        const actualLimit: number = Math.min(requestedCount, cachedShuffledMeteorites.length);

        if (actualLimit > currentConfig.MAX_RANDOM_METEORITES || actualLimit <= 0) return createJsonResponse({ "error": `The number of meteorites must be between 1 and ${currentConfig.MAX_RANDOM_METEORITES}.` }, 400);

        const maxStart: number = cachedShuffledMeteorites.length - actualLimit;

        const start: number = Math.floor(Math.random() * (maxStart + 1));

        const randomMeteorites: Meteorites = cachedShuffledMeteorites.slice(start, start + actualLimit);

        const randomResponse: Response = createJsonResponse({

            "success": {

                "count": randomMeteorites.length,

                "meteorites": randomMeteorites

            }

        }, 200);

        printLogLine("INFO", `Returned ${randomMeteorites.length} meteorites from ${pathname + url.search} (start index: ${start}).`);

        return randomResponse;
        
    }

    if (req.method === "GET" && pathname === "/get") {

        const hashedIP: string = await hashIp(req.headers.get("cf-connecting-ip") ?? "unknown", currentConfig.HASH_KEY);

        if (!(await checkTimeRateLimit(hashedIP, currentConfig.RATE_LIMIT_INTERVAL_S))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${currentConfig.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);  
        
        const query: URLSearchParams = url.searchParams;

        const id: string | null = getTrimmedParam(query.get("id"));

        const name: string | null = getTrimmedParam(query.get("name"));

        if (!id && !name) return createJsonResponse({ "error": "Please provide either 'id' or 'name' as a query parameter." }, 400);

        if (id && name) return createJsonResponse({ "error": "Please provide either 'id' or 'name', not both." }, 400);

        if (id && !/^[1-9]\d*$/.test(id)) return createJsonResponse({ "error": "The ID must be a positive integer." }, 400);

        let result: Meteorite | undefined;

        if (id) result = meteoritesByID.get(id);
            
        else if (name) result = meteoritesByName.get(normalizeString(name!));

        if (!result) {

            printLogLine("WARN", `Unable to find using ${pathname + url.search}.`);

            return createJsonResponse({ "error": "No meteorite found for the given identifier." }, 404);

        }

        printLogLine("INFO", `Returned meteorite from ${pathname + url.search}.`);
        
        return createJsonResponse({ "success": { "meteorite": result } }, 200);

    }

    if (req.method === "GET" && pathname === "/search") {

        const hashedIP: string = await hashIp(req.headers.get("cf-connecting-ip") ?? "unknown", currentConfig.HASH_KEY);

        if (!(await checkTimeRateLimit(hashedIP, currentConfig.RATE_LIMIT_INTERVAL_S))) return createJsonResponse({ "warning": `Rate limit exceeded: only 1 request per ${currentConfig.RATE_LIMIT_INTERVAL_S}s allowed.` }, 429);  
        
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

        if (filters.radius !== null && (filters.radius < currentConfig.MIN_RADIUS || filters.radius > currentConfig.MAX_RADIUS)) return createJsonResponse({ "error": `The radius must be between ${currentConfig.MIN_RADIUS} km and ${currentConfig.MAX_RADIUS} km.` }, 400);

        if ((filters.centerLat !== null || filters.centerLon !== null || filters.radius !== null) && !(filters.centerLat !== null && filters.centerLon !== null && filters.radius !== null)) return createJsonResponse({ "error": "Incomplete geographic parameters: centerLatitude, centerLongitude, and radius must all be provided together." }, 400);
        
        if (filters.limit !== null && !isPositiveInteger(filters.limit)) return createJsonResponse({ "error": "The limit parameter must be a positive integer." }, 400);

        const limit: number = (filters.limit !== null && isPositiveInteger(filters.limit)) ? Math.min(filters.limit, currentConfig.MAX_RETURNED_SEARCH_RESULTS) : currentConfig.MAX_RETURNED_SEARCH_RESULTS;

        const useLocation: boolean = filters.centerLat !== null && filters.centerLon !== null && filters.radius !== null;

        let latMin: number = 0, latMax: number = 0;

        const R_EARTH: number = 6371;

        let maxDistSq: number = 0;

        if (useLocation) {

            if (filters.centerLat! < -90 || filters.centerLat! > 90) return createJsonResponse({ "error": "Latitude must be between -90 and 90." }, 400);
            
            if (filters.centerLon! < -180 || filters.centerLon! > 180) return createJsonResponse({ "error": "Longitude must be between -180 and 180." }, 400);

            const latRad: number = filters.centerLat! * Math.PI / 180;

            const latDelta: number = filters.radius! / R_EARTH * (180 / Math.PI);

            const cosLat: number = Math.max(Math.cos(latRad), 0.000001);

            latMin = filters.centerLat! - latDelta;

            latMax = filters.centerLat! + latDelta;

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

                const lat: number | null = m.latitude as number | null;

                const lon: number | null = m.longitude as number | null;

                if (lat === null || lon === null || lat < latMin || lat > latMax) continue;

                let diffLon: number = Math.abs(lon - centerLon!);

                if (diffLon > 180) diffLon = 360 - diffLon; 
                
                const dLat: number = (lat - centerLat!) * degToRad;

                const dLon: number = diffLon * degToRad;

                const x: number = dLon * Math.cos((lat + centerLat!) * degToRad * 0.5);
                
                if ((x * x + dLat * dLat) > maxDistSq) continue;

            }

            results.push(m);

            if (results.length >= limit) break;

        }

        printLogLine("INFO", `Returned ${results.length} meteorite${(results.length !== 1) ? "s" : ""} from ${pathname + url.search}.`);

        return createJsonResponse({ "success": { "count": results.length, "meteorites": results } }, 200);

    }

    return createJsonResponse({ "error": "The requested endpoint is invalid." }, 404);
    
}

export default {

    async fetch(req: Request, env: Env): Promise<Response> {

        try {

            return await handler(req, env);

        } catch (_err) {

            printLogLine("ERROR", "An error occurred while handling the request.");

            return createJsonResponse({ error: "Internal server error." }, 500);

        }

    }

}
