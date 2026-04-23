import { 
    
    cachedMeteoritesCleaned,

    cachedShuffledMeteorites,

    cachedStatsResult,

    meteoritesByID,

    meteoritesByName,

    isCacheReady

} from "./cache.ts";

import { createJsonResponse } from "./utils.ts";

import { HealthCheckResult } from "../types/types.ts";

export async function handleHealthCheck(): Promise<Response> {

    const checks = {

        cache_ready: isCacheReady,

        meteorites_count: cachedMeteoritesCleaned.length,

        shuffled_meteorites_count: cachedShuffledMeteorites.length,

        stats_available: cachedStatsResult !== null,

        by_id_index_size: meteoritesByID.size,

        by_name_index_size: meteoritesByName.size

    };

    const allHealthy: boolean = checks.cache_ready && checks.meteorites_count > 0 && checks.shuffled_meteorites_count > 0 && checks.stats_available && checks.by_id_index_size > 0 && checks.by_name_index_size > 0;

    const result: HealthCheckResult = {

        status: allHealthy ? "healthy" : "unhealthy",

        timestamp: new Date().toISOString(),

        checks,

        message: allHealthy ? "All endpoints are functional." : "One or more endpoints may be unavailable."

    };

    const statusCode: 200 | 503 = allHealthy ? 200 : 503;

    return createJsonResponse(result, statusCode);

}