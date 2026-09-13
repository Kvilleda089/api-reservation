import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is required");
}

const requiredEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is required`);
    }

    return value;
};

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const firstName = requiredEnv("SEED_ADMIN_FIRST_NAME");
    const surname = requiredEnv("SEED_ADMIN_SURNAME");
    const email = requiredEnv("SEED_ADMIN_EMAIL");
    const username = requiredEnv("SEED_ADMIN_USERNAME");
    const plainPassword = requiredEnv("SEED_ADMIN_PASSWORD");

    const password = await bcrypt.hash(plainPassword, 10);

    const existingAdministrator = await prisma.employee.findFirst({
        where: {
            role: "SUPER_ADMINISTRATOR",
        },
    });

    if (existingAdministrator) {
        console.log("SUPER_ADMINISTRATOR already exists.");
        return;
    }

    const administrator = await prisma.employee.create({
        data: {
            firstName,
            middleName: "",
            surname,
            secondSurname: "",
            email,
            username,
            phoneNumber: null,
            password,
            role: "SUPER_ADMINISTRATOR",
            status: true,
            hireDate: new Date(),
        },
    });

    console.log(`SUPER_ADMINISTRATOR created: ${administrator.username}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });