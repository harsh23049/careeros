import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as coverLetterService from "../services/coverLetter.service.js";

// Create a new cover letter
const createCoverLetter = asyncHandler(async (req, res) => {
    const coverLetter =
        await coverLetterService.createCoverLetter(
            req.user._id,
            req.body
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                coverLetter,
                "Cover letter created successfully"
            )
        );
});

// Get all cover letters of the current user
const getUserCoverLetters = asyncHandler(async (req, res) => {
    const coverLetters =
        await coverLetterService.getUserCoverLetters(
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                coverLetters,
                "Cover letters fetched successfully"
            )
        );
});

// Get a single cover letter
const getCoverLetter = asyncHandler(async (req, res) => {
    const coverLetter =
        await coverLetterService.getCoverLetter(
            req.params.id,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                coverLetter,
                "Cover letter fetched successfully"
            )
        );
});

// Get cover letters for an application
const getApplicationCoverLetters =
    asyncHandler(async (req, res) => {
        const coverLetters =
            await coverLetterService.getApplicationCoverLetters(
                req.params.applicationId,
                req.user._id
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    coverLetters,
                    "Application cover letters fetched successfully"
                )
            );
    });

// Update a cover letter
const updateCoverLetter = asyncHandler(async (req, res) => {
    const coverLetter =
        await coverLetterService.updateCoverLetter(
            req.params.id,
            req.user._id,
            req.body
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                coverLetter,
                "Cover letter updated successfully"
            )
        );
});

// Delete a cover letter
const deleteCoverLetter = asyncHandler(async (req, res) => {
    await coverLetterService.deleteCoverLetter(
        req.params.id,
        req.user._id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Cover letter deleted successfully"
            )
        );
});

export {
    createCoverLetter,
    getUserCoverLetters,
    getCoverLetter,
    getApplicationCoverLetters,
    updateCoverLetter,
    deleteCoverLetter,
};