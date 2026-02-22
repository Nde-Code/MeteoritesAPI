export async function checkTimeRateLimit(hashedIp: string, limitSeconds: number): Promise<boolean> {
    
    const cache = (caches as any).default;

    const cacheKey = `https://ratelimit.local/${hashedIp}`;

    const hit = await cache.match(cacheKey);

    if (hit) return false;

    await cache.put(cacheKey, new Response("1", {

        headers: { "Cache-Control": `max-age=${limitSeconds}` }

    }));

    return true;

}

export async function hashIp(ip: string, salt: string): Promise<string> {

    const msgBuffer = new TextEncoder().encode(ip + salt);

    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

    const hashArray = new Uint8Array(hashBuffer);
    
    let hexString = "";

    for (let i = 0; i < hashArray.length; i++) {

        const b = hashArray[i];

        hexString += (b < 16 ? '0' : '') + b.toString(16);

    }

    return hexString;

}