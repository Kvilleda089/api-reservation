import 'dotenv/config';
import * as joi from 'joi';

interface EnVars {
  PORT: number;
  DATABASE_URL: string;
  POSTGRES_DB: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_USER: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    POSTGRES_DB: joi.string().required(),
    POSTGRES_PASSWORD: joi.string().required(),
    POSTGRES_USER: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.number().required(),

  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnVars = value;

export const env = {
  port: envVars.PORT,
  database_url: envVars.DATABASE_URL,
  postgres_db: envVars.POSTGRES_DB,
  postgres_password: envVars.POSTGRES_PASSWORD,
  posgres_user: envVars.POSTGRES_USER,
  jwt_secret: envVars.JWT_SECRET,
  jwt_expires_in: envVars.JWT_EXPIRES_IN,
  
}