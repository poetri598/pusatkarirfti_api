import dotenv from "dotenv";
dotenv.config();

export default function validateEnv() {
  const REQUIRED = ["PORT", "DB_HOST", "DB_USER", "DB_NAME"];
  const missing = REQUIRED.filter((k) => !process.env[k]);

  if (missing.length) {
    console.error(`❌  Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}
