import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

// Security Middleware
app.use(helmet());

// Enable CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    })
);

// Logging
app.use(morgan("dev"));

// Parse JSON Body
app.use(express.json());

// Parse URL Encoded Data
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Parse Cookies
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

// Health Check Route
app.use("/api/v1/health", healthRoutes);
/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

// We'll add this later

export default app;