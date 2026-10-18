import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";



const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        // Connect Database
        await connectDB();

        // Start Express Server
        app.listen(PORT, async () => {
            console.log("=================================");
            console.log("🚀 CareerOS Backend Started");
            console.log(`🌐 Server : http://localhost:${PORT}`);
            console.log(`📦 Environment : ${process.env.NODE_ENV || "development"}`);

            // Diagnostic SMTP status check (non-blocking, never reveals secrets)
            try {
                const { verifySmtpConnection } = await import("./services/email.service.js");
                const smtpStatus = await verifySmtpConnection();
                if (!smtpStatus.configured) {
                    console.log("✉️  Email Service : Local Development Simulation (SMTP unconfigured)");
                } else if (smtpStatus.verified) {
                    console.log("✉️  Email Service : SMTP Ready & Verified");
                } else if (smtpStatus.isAuthError) {
                    console.log("⚠️  Email Service : SMTP Configured but Authentication Failed (535 BadCredentials). Check Google App Password.");
                } else {
                    console.log(`⚠️  Email Service : SMTP Verification Warning (${smtpStatus.error})`);
                }
            } catch (smtpErr) {
                console.log("⚠️  Email Service check warning:", smtpErr.message);
            }

            console.log("=================================");
        });
    } catch (error) {
        console.error("Failed to start server.");
        console.error(error.message);
        process.exit(1);
    }
};

startServer();