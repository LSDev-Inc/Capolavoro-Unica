import fs from "fs";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (!key) continue;
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function seed() {
  loadEnvFile();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to .env before seeding.");
  }

  await mongoose.connect(mongoUri);
  await User.init();

  const demoEmail = process.env.SEED_EMAIL || "demo@capolavoro.local";
  const existing = await User.findOne({ email: demoEmail });

  if (!existing) {
    const password =
      process.env.SEED_PASSWORD ||
      crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "");
    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: "DemoStudent",
      email: demoEmail,
      password: hashed,
      is2FAEnabled: false,
      twoFactorCode: null,
      notes: [
        {
          id: crypto.randomUUID(),
          title: "Benvenuto al dashboard",
          content: "Questa e' una nota di esempio. Puoi modificarla o eliminarla.",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: crypto.randomUUID(),
          title: "Obiettivo della settimana",
          content: "Completare i primi capitoli di algebra e riassumere i concetti.",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    });

    console.log("Database seed completato.");
    console.log(`Utente demo creato: ${user.email}`);
    console.log(`Password demo: ${password}`);
  } else {
    console.log("Utente demo gia' presente. Nessuna modifica necessaria.");
  }

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seed fallito:", error.message);
  process.exit(1);
});
