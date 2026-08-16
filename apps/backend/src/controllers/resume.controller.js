import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as resumeService from "../services/resume.service.js";

// Create a new resume
const createResume = asyncHandler(async (req, res) => {
    const resume = await resumeService.createResume(
        req.user._id,
        req.body
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                resume,
                "Resume created successfully"
            )
        );
});

// Get all resumes of the current user
const getUserResumes = asyncHandler(async (req, res) => {
    const resumes =
        await resumeService.getUserResumes(
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resumes,
                "Resumes fetched successfully"
            )
        );
});

// Get a single resume
const getResume = asyncHandler(async (req, res) => {
    const resume =
        await resumeService.getResume(
            req.params.id,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resume,
                "Resume fetched successfully"
            )
        );
});

// Get the default resume
const getDefaultResume = asyncHandler(async (req, res) => {
    const resume =
        await resumeService.getDefaultResume(
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resume,
                "Default resume fetched successfully"
            )
        );
});

// Update a resume
const updateResume = asyncHandler(async (req, res) => {
    const resume =
        await resumeService.updateResume(
            req.params.id,
            req.user._id,
            req.body
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                resume,
                "Resume updated successfully"
            )
        );
});

// Delete a resume
const deleteResume = asyncHandler(async (req, res) => {
    await resumeService.deleteResume(
        req.params.id,
        req.user._id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Resume deleted successfully"
            )
        );
});

export {
    createResume,
    getUserResumes,
    getResume,
    getDefaultResume,
    updateResume,
    deleteResume,
};