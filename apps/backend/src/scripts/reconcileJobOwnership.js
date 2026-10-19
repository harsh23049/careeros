import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";

dotenv.config();

const reconcileJobOwnership = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;
        console.log("Connecting to database for job ownership reconciliation...");
        await mongoose.connect(uri);

        console.log("Connected successfully. Analyzing legacy job records...");

        const legacyJobs = await Job.find({
            $or: [
                { user: { $exists: false } },
                { user: null },
            ],
        });

        console.log(`Found ${legacyJobs.length} legacy job records without an owner.`);

        if (legacyJobs.length === 0) {
            console.log("No legacy jobs to reconcile. All jobs have owners.");
            await mongoose.disconnect();
            return;
        }

        let reconciledCount = 0;
        let preservedUnownedCount = 0;

        for (const job of legacyJobs) {
            // Check if any application references this job
            const applications = await Application.find({ job: job._id }).select("user");

            const ownerIds = Array.from(
                new Set(applications.map((app) => app.user?.toString()).filter(Boolean))
            );

            if (ownerIds.length === 1) {
                // Exactly one user owns applications for this job -> reconcile ownership
                job.user = new mongoose.Types.ObjectId(ownerIds[0]);
                job.isLegacyUnowned = false;
                await job.save({ validateBeforeSave: false });
                reconciledCount++;
                console.log(`Reconciled Job ${job._id} ("${job.jobTitle}" at "${job.company}") to User ${ownerIds[0]}`);
            } else {
                // Either no applications or multiple users -> preserve as legacy unowned without deleting or leaking
                job.isLegacyUnowned = true;
                await job.save({ validateBeforeSave: false });
                preservedUnownedCount++;
                console.log(`Preserved Job ${job._id} ("${job.jobTitle}" at "${job.company}") as legacy unowned.`);
            }
        }

        console.log("\n--- Reconciliation Summary ---");
        console.log(`Total legacy jobs analyzed: ${legacyJobs.length}`);
        console.log(`Reconciled to application owner: ${reconciledCount}`);
        console.log(`Preserved as isolated legacy unowned: ${preservedUnownedCount}`);
        console.log("-------------------------------\n");

        await mongoose.disconnect();
        console.log("Database disconnected. Reconciliation complete.");
    } catch (error) {
        console.error("Error during job reconciliation:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

reconcileJobOwnership();
