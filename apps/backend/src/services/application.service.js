import applicationRepository from "../repositories/application.repository.js";
import ApiError from "../utils/ApiError.js";

const createApplication = async (userId, applicationData) => {
    const {
        company,
        jobTitle,
        jobUrl,
        status = "saved",
        appliedAt,
        location,
        employmentType,
        salary,
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
            company,
            jobTitle,
            jobUrl,
            status,
            appliedAt: applicationDate,
            location,
            employmentType,
            salary,
            notes,
            statusHistory,
        });

    return application;
};

// Get all applications belonging to the current user
const getUserApplications = async (userId, status) => {
    if (status) {
        return await applicationRepository.findByUserAndStatus(
            userId,
            status
        ); 
    }

    return await applicationRepository.findByUser(userId);
};

// Get a single application after verifying ownership
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

// Update application and record status changes
const updateApplication = async (
    applicationId,
    userId,
    updateData
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

    const allowedFields = [
        "company",
        "jobTitle",
        "jobUrl",
        "status",
        "appliedAt",
        "location",
        "employmentType",
        "salary",
        "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    // Record a new history entry when status changes
    if (
        updateData.status &&
        updateData.status !== application.status
    ) {
        application.statusHistory.push({
            status: updateData.status,
            changedAt: new Date(),
        });

        updates.statusHistory =
            application.statusHistory;

        if (
            updateData.status === "applied" &&
            !application.appliedAt &&
            !updateData.appliedAt
        ) {
            updates.appliedAt = new Date();
        }
    }

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

    return updatedApplication;
};

// Delete an application after verifying ownership
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

export {
    createApplication,
    getUserApplications,
    getApplication,
    updateApplication,
    deleteApplication,
};