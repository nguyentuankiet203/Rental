import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();
console.log("ENV:", process.env.DATABASE_URL);
export const AppDataSource = new DataSource({
  type: "postgres",

  url: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },

  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],

  synchronize: false,
  
});