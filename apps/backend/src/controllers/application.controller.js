import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as applicationService from "../services/application.service.js";

// Create a new application
const createApplication = asyncHandler(async (req, res) => {
    const application =
        await applicationService.createApplication(
            req.user._id,
            req.body
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                application,
                "Application created successfully"
            )
        );
});

// Get all applications of the current user
const getUserApplications = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const applications =
        await applicationService.getUserApplications(
            req.user._id,
            status
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                applications,
                "Applications fetched successfully"
            )
        );
});

// Get a single application
const getApplication = asyncHandler(async (req, res) => {
    const application =
        await applicationService.getApplication(
            req.params.id,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                application,
                "Application fetched successfully"
            )
        );
});

// Update an application
const updateApplication = asyncHandler(async (req, res) => {
    const application =
        await applicationService.updateApplication(
            req.params.id,
            req.user._id,
            req.body
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                application,
                "Application updated successfully"
            )
        );
});

// Delete an application
const deleteApplication = asyncHandler(async (req, res) => {
    await applicationService.deleteApplication(
        req.params.id,
        req.user._id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Application deleted successfully"
            )
        );
});

export {
    createApplication,
    getUserApplications,
    getApplication,
    updateApplication,
    deleteApplication,
};