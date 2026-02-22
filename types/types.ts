export interface Env {

    HASH_KEY: string;

}

export interface StaticConfig  {

    RATE_LIMIT_INTERVAL_S: number;

    MAX_RANDOM_METEORITES: number;

    MAX_RETURNED_SEARCH_RESULTS: number;

    MIN_RADIUS: number;

    MAX_RADIUS: number;

    DEFAULT_RANDOM_NUMBER_OF_METEORITES: number;

}

export interface RuntimeConfig extends StaticConfig {

    HASH_KEY: string;

}

export interface Filters { 

    recclass: string | null;

    fall: string | null;

    year: number | null;

    minYear: number | null;

    maxYear: number | null;

    mass: number | null;

    minMass: number | null;

    maxMass: number | null;

    centerLat: number | null;

    centerLon: number | null;

    radius: number | null;

    limit: number | null;
    
}

export interface Meteorite {

    id: string;

    name: string;

    recclass: string;

    mass: number | null;

    year: number | null; 

    latitude: number | null;

    longitude: number | null;
    
    fall: string;
}

export type Meteorites = Meteorite[];

export interface MeteoriteRaw {

    id: string;

    name: string;

    recclass: string;

    mass: string;

    fall: string;

    year: string;

    latitude: string;

    longitude: string;

}

export type MeteoritesDBFormat = Record<string, MeteoriteRaw>;