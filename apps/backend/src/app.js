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

import userRoutes from "./routes/user.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import jobRoutes from "./routes/job.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import coverLetterRoutes from "./routes/coverLetter.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import aiHistoryRoutes from "./routes/aiHistory.routes.js";



app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/cover-letters",coverLetterRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/ai-history", aiHistoryRoutes);

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
import errorHandler from "./middlewares/error.middleware.js";

app.get("/api/v1/test-error", (req, res) => {
    throw new ApiError(404, "This is a test error");
});

app.use(errorHandler);

// We'll add this later

export default app;