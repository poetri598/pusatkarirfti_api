import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { startUpdateRoleCron } from "./cron/updateRoleCron.js";

import routers from "./routers/mainRouter.js";
import validateEnv from "./configs/validateEnv.js";
import buildRateLimiter from "./configs/rateLimiter.js";

import notFound from "./utils/notFound.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Env Validation
validateEnv();
const PORT = process.env.PORT || 5000;
const HOST = process.env.DB_HOST || "localhost";

// App Init
const app = express();

// Security & Essentials
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://${HOST}:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use(cookieParser());
app.use(morgan("dev"));
app.use(buildRateLimiter());

app.use(express.static(path.join(__dirname, "..", "public")));

// ─── API Routers ────────────────────────────────────────────
routers.forEach((router) => app.use("/api", router));

// ─── Home (Landing) ─────────────────────────────────────────
app.get("/", (_, res) => {
  res.type("html").send(`
    <!DOCTYPE html><html lang="en"><head>
      <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Api Pusat Karir FTI UNSAP</title><script src="https://cdn.tailwindcss.com"></script>
        <link rel="icon" type="image/png" href="/logofti.png">
    </head><body class="bg-gray-100">
      <div class="w-11/12 md:w-10/12 mx-auto flex flex-col items-center gap-2 min-h-screen justify-center">
        <h1 class="text-sm md:text-4xl font-bold text-center text-cyan-700">
          Welcome to the Pusat Karir Fakultas Teknologi Informasi's APIs
        </h1>
        <p class="text-xs text-center text-gray-500">
          Everything is up & running on port <a>http://${HOST}:${PORT}</a>
        </p>
        <a href="https://github.com/poetri598/pusatkarirfti_api.git"
           class="underline text-cyan-600 text-xs hover:text-cyan-900">
          Read the docs
        </a>
      </div>
    </body></html>
  `);
});

// 404 & Global Error
app.use(notFound); // Route tidak ditemukan
app.use(globalErrorHandler); // Error tak ter-handle

// Start Server
app.listen(PORT, () => console.log(`Server running on http://${HOST}:${PORT}`));

//  Start CRON Job
startUpdateRoleCron();

export default app;
