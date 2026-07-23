export interface Liver {
    birthmonth: string;
    color_group: string;
    color_hex: string;
    debut: number;
    gender: string;
    name: string;
    species: string;
}

export function relatedSpecies(query: string | undefined, allSpecies: string[]): string[] {
    if (!query) return [];
    const base = query.split(/[,:]/)[0].trim().toLowerCase();
    return allSpecies.filter((s) => s.toLowerCase().includes(base) && s.toLowerCase() != base);
}

export function uniqueValues<T, K extends keyof T>(items: T[], key: K): T[K][] {
    return [...new Set(items.map((item) => item[key]))];
}