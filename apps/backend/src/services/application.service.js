import applicationRepository from "../repositories/application.repository.js";
import jobRepository from "../repositories/job.repository.js";
import resumeRepository from "../repositories/resume.repository.js";
import coverLetterRepository from "../repositories/coverLetter.repository.js";
import * as notificationService from "./notification.service.js";
import ApiError from "../utils/ApiError.js";

// =====================================================
// CREATE APPLICATION
// =====================================================

const createApplication = async (
    userId,
    applicationData
) => {
    const {
        job,
        resume,
        coverLetter,
        status = "saved",
        appliedAt,
        notes,
    } = applicationData;

    // -------------------------------------------------
    // 1. Verify job exists
    // -------------------------------------------------

    const existingJob =
        await jobRepository.findById(job);

    if (!existingJob) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    // -------------------------------------------------
    // 2. Verify resume belongs to current user
    // -------------------------------------------------

    const existingResume =
        await resumeRepository.findByIdAndUser(
            resume,
            userId
        );

    if (!existingResume) {
        throw new ApiError(
            404,
            "Resume not found"
        );
    }

    // -------------------------------------------------
    // 3. Verify cover letter if provided
    // -------------------------------------------------

    if (coverLetter) {
        const existingCoverLetter =
            await coverLetterRepository.findByIdAndUser(
                coverLetter,
                userId
            );

        if (!existingCoverLetter) {
            throw new ApiError(
                404,
                "Cover letter not found"
            );
        }

        // Cover letter must belong to selected job
        if (
            !existingCoverLetter.job ||
            existingCoverLetter.job.toString() !==
                job.toString()
        ) {
            throw new ApiError(
                400,
                "Cover letter does not belong to this job"
            );
        }

        // Cover letter must belong to selected resume
        if (
            !existingCoverLetter.resume ||
            existingCoverLetter.resume.toString() !==
                resume.toString()
        ) {
            throw new ApiError(
                400,
                "Cover letter does not belong to this resume"
            );
        }
    }

    // -------------------------------------------------
    // 4. Create initial status history
    // -------------------------------------------------

    const statusHistory = [
        {
            status,
            changedAt: new Date(),
        },
    ];

    // -------------------------------------------------
    // 5. Set appliedAt automatically
    // -------------------------------------------------

    let applicationDate = appliedAt;

    if (
        status === "applied" &&
        !applicationDate
    ) {
        applicationDate = new Date();
    }

    // -------------------------------------------------
    // 6. Create application
    // -------------------------------------------------

    const application =
        await applicationRepository.create({
            user: userId,
            job,
            resume,
            coverLetter,
            status,
            appliedAt: applicationDate,
            notes,
            statusHistory,
        });

    // -------------------------------------------------
    // 7. Notify user if application was submitted
    // -------------------------------------------------

    if (status === "applied") {
        await notificationService.createNotification(
            userId,
            {
                type: "application_update",

                title: "Application submitted",

                message:
                    `Your application for ${existingJob.jobTitle} ` +
                    `at ${existingJob.company} has been submitted.`,

                relatedApplication:
                    application._id,
            }
        );
    }

    return application;
};

// =====================================================
// GET ALL USER APPLICATIONS
// =====================================================

const getUserApplications = async (
    userId,
    status
) => {
    if (status) {
        return await applicationRepository.findByUserAndStatus(
            userId,
            status
        );
    }

    return await applicationRepository.findByUser(
        userId
    );
}; 

// =====================================================
// GET SINGLE APPLICATION
// =====================================================

const getApplication = async (
    applicationId,
    userId
) => {
    const application =
        await applicationRepository.findByIdAndUser(
            applicationId,
            userId
        );

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    return application;
};

// =====================================================
// UPDATE APPLICATION
// =====================================================

const updateApplication = async (
    applicationId,
    userId,
    updateData
) => {
    // -------------------------------------------------
    // 1. Check ownership
    // -------------------------------------------------

    const application =
        await applicationRepository.findByIdAndUser(
            applicationId,
            userId
        );

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    // -------------------------------------------------
    // 2. Allowed fields
    // -------------------------------------------------

    const allowedFields = [
        "job",
        "resume",
        "coverLetter",
        "status",
        "appliedAt",
        "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    // -------------------------------------------------
    // 3. Detect status change
    // -------------------------------------------------

    const statusChanged =
        updateData.status &&
        updateData.status !== application.status;

    const oldStatus = application.status;

    // -------------------------------------------------
    // 4. Update status history
    // -------------------------------------------------

    if (statusChanged) {
        application.statusHistory.push({
            status: updateData.status,
            changedAt: new Date(),
        });

        updates.statusHistory =
            application.statusHistory;

        // Automatically set appliedAt
        if (
            updateData.status === "applied" &&
            !application.appliedAt &&
            !updateData.appliedAt
        ) {
            updates.appliedAt = new Date();
        }
    }

    // -------------------------------------------------
    // 5. Update application in database
    // -------------------------------------------------

    const updatedApplication =
        await applicationRepository.update(
            applicationId,
            updates
        );

    if (!updatedApplication) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    // -------------------------------------------------
    // 6. Create notification after successful update
    // -------------------------------------------------

    if (statusChanged) {
        await notificationService.createNotification(
            userId,
            {
                type: "application_update",

                title: "Application status updated",

                message:
                    `Your application status changed ` +
                    `from ${oldStatus} ` +
                    `to ${updateData.status}.`,

                relatedApplication:
                    updatedApplication._id,
            }
        );
    }

    return updatedApplication;
};

// =====================================================
// DELETE APPLICATION
// =====================================================

const deleteApplication = async (
    applicationId,
    userId
) => {
    const application =
        await applicationRepository.findByIdAndUser(
            applicationId,
            userId
        );

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    await applicationRepository.deleteById(
        applicationId
    );

    return true;
};

// =====================================================
// EXPORTS
// =====================================================

export {
    createApplication,
    getUserApplications,
    getApplication,
    updateApplication,
    deleteApplication,
};