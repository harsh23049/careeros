import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import ApiError from "./utils/ApiError.js";



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
// app.get("/api/v1/error", (req, res) => {
//     throw new ApiError(404, "Testing Global Error Handler");
// });
app.get("/api/v1/test-error", (req, res) => {
    throw new ApiError(404, "This is a test error");
});

// We'll add this later

export default app;