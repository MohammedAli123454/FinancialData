import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
// import * as schema from "./schema"
import * as schema from "@/app/config/schema"
//export const sql = neon(process.env.DATABASE_URL!);
export const sql = neon('postgresql://azcsmohdali1:f1NauxJ0RikY@ep-morning-snowflake-15132543-pooler.ap-southeast-1.aws.neon.tech/domus-dashboard?sslmode=require');
export const db = drizzle(sql,{schema});