import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.SITECHECK_DATABASE_URL!);

export default sql;
