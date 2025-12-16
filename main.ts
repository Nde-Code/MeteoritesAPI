import { createJsonResponse } from "./utilities/create_json.ts";

import { checkTimeRateLimit, hashIp } from "./utilities/rate.ts"; 

import {

    cachedMeteoritesCleaned,

    cachedShuffledMeteorites,

    cachedStatsResult,

    meteoritesByID,

    meteoritesByName,

    meteoritesByRecclass,

    meteoritesByFall, 

} from "./utilities/cache.ts";

import { Config, Env, Filters, Meteorite, Meteorites } from "./types/types.ts";

import { config } from "./config.ts";

import {

    filterByDate,

    filterByLocation,

    filterByMass,

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

        let requestedCount: number | null = countParam ? parseInt(countParam) : null;
        
        if (requestedCount !== null && (isNaN(requestedCount) || requestedCount <= 0)) requestedCount = config.DEFAULT_RANDOM_NUMBER_OF_METEORITES;

        const count: number = Math.min(requestedCount ?? config.DEFAULT_RANDOM_NUMBER_OF_METEORITES, config.MAX_RANDOM_METEORITES);

        if (count > config.MAX_RANDOM_METEORITES) return createJsonResponse({ "error": `The number of meteorites requested exceeded the limit of ${config.MAX_RANDOM_METEORITES}` }, 400);

        const startPerformanceWithRandom: number = performance.now();

        const shuffled: Meteorites = cachedShuffledMeteorites;

        const randomMeteorites: Meteorites = shuffled.slice(0, Math.min(count, shuffled.length));

        const randomResponse: Response = createJsonResponse({

            "success": {

                "count": randomMeteorites.length,

                "meteorites": randomMeteorites

            }

        }, 200);

        printLogLine("INFO", `Returned ${randomMeteorites.length} meteorite${(randomMeteorites.length !== 1) ? "s" : ""} from ${pathname + url.search} after: ${(performance.now() - startPerformanceWithRandom).toFixed(2)} ms.`,);

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

        const noFiltersProvided: boolean = Object.values(filters).every(value => value === null || value === undefined || value === "");

		if (noFiltersProvided) return createJsonResponse({ "error": "At least one valid filter parameter is required in the search query." }, 400);

		if (filters.fall && filters.fall.toLowerCase() !== "fell" && filters.fall.toLowerCase() !== "found") return createJsonResponse({ "error": "The fall filter must be set to either 'fell' or 'found', and only these two values are allowed." }, 400);

		if (filters.minYear !== null && filters.maxYear !== null && filters.minYear > filters.maxYear) return createJsonResponse({ "error": "Invalid year range: minYear cannot be greater than maxYear." }, 400);

		if (filters.year !== null && (filters.minYear !== null || filters.maxYear !== null)) return createJsonResponse({ "error": "Cannot combine 'year' with 'minYear' or 'maxYear'." }, 400);

		if (filters.minMass !== null && filters.maxMass !== null && filters.minMass > filters.maxMass) return createJsonResponse({ "error": "Invalid mass range: minMass cannot be greater than maxMass." }, 400);

		if (filters.mass !== null && (filters.minMass !== null || filters.maxMass !== null)) return createJsonResponse({ "error": "Cannot combine 'mass' with 'minMass' or 'maxMass'." }, 400);

		if ((filters.minYear && isPositiveInteger(filters.minYear) === false) || (filters.year && isPositiveInteger(filters.year) === false) || (filters.maxYear && isPositiveInteger(filters.maxYear) === false)) return createJsonResponse({ "error": "The parameters minYear, year, and maxYear must be positive integers." }, 400);

		if (filters.limit && (isPositiveInteger(filters.limit) === false || filters.limit < 1 || filters.limit > config.MAX_RETURNED_SEARCH_RESULTS)) return createJsonResponse({ "error": `The 'limit' parameter must be an integer between 1 and ${config.MAX_RETURNED_SEARCH_RESULTS}.` }, 400);

		const isInvalidCoord = (lat: number | null, lon: number | null, radius: number | null, minRadius: number, maxRadius: number): boolean => {
				
			return (lat === null || isNaN(lat) || lat < -90 || lat > 90 || lon === null || isNaN(lon) || lon < -180 || lon > 180 || radius === null || isNaN(radius) || radius <= 0 || radius < minRadius || radius > maxRadius);
			
		};

		if ((filters.centerLat !== null || filters.centerLon !== null || filters.radius !== null) && isInvalidCoord(filters.centerLat, filters.centerLon, filters.radius, config.MIN_RADIUS, config.MAX_RADIUS)) return createJsonResponse({ "error": "Invalid location search request. The parameters centerLatitude, centerLongitude, and radius must be included and valid." }, 400);

        const startPerformanceWithSearch: number = performance.now();

        const meteoritesData: Meteorites = cachedMeteoritesCleaned;

        if (!meteoritesData || meteoritesData.length === 0) return createJsonResponse({ "error": "No meteorites data available." }, 404);

        let results: Meteorites;

        const hasRecclassFilter: string | null = filters.recclass;

        const hasFallFilter: string | null = filters.fall;

        if (hasRecclassFilter) {

            const key: string = filters.recclass!.toLowerCase();

            const keyedResults: Meteorites | undefined = meteoritesByRecclass.get(key);

            results = keyedResults ? keyedResults.slice() : [];

        }
        
        else results = meteoritesData.slice();

        if (hasFallFilter) {

            const key = filters.fall!.toLowerCase();
            
            if (!hasRecclassFilter) {
                
                const keyedResults = meteoritesByFall.get(key);

                results = keyedResults ? keyedResults.slice() : [];

            }
            
            else if (hasRecclassFilter && results.length > 0) results = results.filter((m) => typeof m.fall === "string" && m.fall.toLowerCase() === key);
        
        }
        
        results = filterByDate(results, filters.year, filters.minYear, filters.maxYear);

        results = filterByMass(results, filters.mass, filters.minMass, filters.maxMass);

        results = filterByLocation(results, filters.centerLat, filters.centerLon, filters.radius);

        results = results.slice(0, (filters.limit !== null) ? filters.limit : config.MAX_RETURNED_SEARCH_RESULTS);

        if (results.length === 0) {
            
            printLogLine("WARN", `No data found with: ${pathname + url.search} after: ${(performance.now() - startPerformanceWithSearch).toFixed(2)} ms.`,);
            
            return createJsonResponse({

                "success": {

                    "count": 0,

                    "meteorites": [],

                    note: "No results found for the given criteria.",

                },

            }, 200);

        }

        const searchResponse: Response = createJsonResponse({"success": { "count": results.length, "meteorites": results }}, 200);

        printLogLine("INFO", `Returned ${results.length} meteorite${(results.length !== 1) ? "s" : ""} from ${pathname + url.search} after: ${(performance.now() - startPerformanceWithSearch).toFixed(2)} ms.`);

        return searchResponse;

    }

    return createJsonResponse({ "error": "The requested endpoint is invalid." }, 404);
    
}

export default {

    async fetch(req: Request, env: Env): Promise<Response> { return handler(req, env); }

};