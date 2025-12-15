import { config } from "../config.ts";

interface CloudflareCache {

    default: {

        match(request: Request): Promise<Response | undefined>;

        put(request: Request, response: Response): Promise<void>;

    };

}

export async function checkTimeRateLimit(hashedIp: string, limitSeconds = config.RATE_LIMIT_INTERVAL_S): Promise<boolean> {
    
    const cache = caches as unknown as CloudflareCache;
    
    const cacheKey = new Request(`https://ratelimit/${hashedIp}`);

    const hit: Response | undefined = await cache.default.match(cacheKey);

    if (hit) return false;

    await cache.default.put(cacheKey,

        new Response("ok", {

            headers: { "Cache-Control": `max-age=${limitSeconds}` }

        })

    );

    return true;

}

export async function hashIp(ip: string, salt = config.HASH_KEY): Promise<string> {

    const encoder = new TextEncoder();
    
    const data = encoder.encode(ip + salt);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

}