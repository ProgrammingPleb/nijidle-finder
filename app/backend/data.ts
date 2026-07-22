import { unstable_cache } from "next/cache";
import { Liver } from "../model/nijisanji";
import { getDBConnection } from "./db"

export const getAllLivers = unstable_cache(
    async (): Promise<Liver[]> => {
        const conn = await getDBConnection()
        const rows = await conn.query("SELECT * FROM nijisanji");
        conn.end();
        return rows;
    },
    ["all-livers"],
    { revalidate: 60 * 60 * 4 }
);
