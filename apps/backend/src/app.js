import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/user.routes.js";

import ApiError from "./utils/ApiError.js";
import errorHandler from "./middlewares/error.middleware.js";


const app = express();


// =====================================================
// MIDDLEWARES
// =====================================================

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    })
);

// Logging
app.use(morgan("dev"));

// Parse JSON
app.use(express.json());

// Parse URL-encoded data
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Parse cookies
app.use(cookieParser());


// =====================================================
// ROUTES
// =====================================================

// User routes
app.use("/api/v1/users", userRoutes);

// Health check
app.use("/api/v1/health", healthRoutes);


// =====================================================
// TEST ERROR ROUTE
// =====================================================

app.get("/api/v1/test-error", (req, res) => {
    throw new ApiError(
        404,
        "This is a test error"
    );
});


// =====================================================
// GLOBAL ERROR HANDLER
// MUST BE THE LAST MIDDLEWARE
// =====================================================

app.use(errorHandler);


export default app;