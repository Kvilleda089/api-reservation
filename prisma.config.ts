import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/config/envs";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env.database_url,
  },
});