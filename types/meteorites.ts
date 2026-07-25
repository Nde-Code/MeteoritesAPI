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

export type MeteoritesRaw = MeteoriteRaw[];

export type MeteoritesDBFormat = Record<string, MeteoriteRaw>;