import { createPool } from "mariadb";
import "server-only";

const pool = createPool({
    host: process.env.DB_URL!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
})

export async function getDBConnection() {
    return await pool.getConnection();
}
