import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        // Connect Database
        await connectDB();

        // Start Express Server
        app.listen(PORT, () => {
            console.log("=================================");
            console.log("🚀 CareerOS Backend Started");
            console.log(`🌐 Server : http://localhost:${PORT}`);
            console.log(`📦 Environment : ${process.env.NODE_ENV || "development"}`);
            console.log("=================================");
        });
    } catch (error) {
        console.error("Failed to start server.");
        console.error(error.message);
        process.exit(1);
    }
};

startServer();