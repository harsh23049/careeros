import applicationRepository from "../repositories/application.repository.js";
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

    const statusHistory = [
        {
            status,
            changedAt: new Date(),
        },
    ];

    let applicationDate = appliedAt;

    if (status === "applied" && !applicationDate) {
        applicationDate = new Date();
    }

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
    // 6. Create notification AFTER successful update
    // -------------------------------------------------

    if (statusChanged) {
        await notificationService.createNotification(
            userId,
            {
                type: "application_update",

                title: "Application status updated",

                message:
                    `Your application status changed ` +
                    `from ${application.status} ` +
                    `to ${updateData.status}.`,

                relatedApplication: applicationId,
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