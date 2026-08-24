import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as aiHistoryService from "../services/aiHistory.service.js";

// =====================================================
// CREATE AI HISTORY
// =====================================================

const createAIHistory = asyncHandler(async (req, res) => {
    const aiHistory =
        await aiHistoryService.createAIHistory(
            req.user._id,
            req.body
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                aiHistory,
                "AI history created successfully"
            )
        );
});

// =====================================================
// GET ALL AI HISTORY
// =====================================================

const getUserAIHistory = asyncHandler(async (req, res) => {
    const aiHistory =
        await aiHistoryService.getUserAIHistory(
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                aiHistory,
                "AI history fetched successfully"
            )
        );
});

// =====================================================
// GET SINGLE AI HISTORY
// =====================================================

const getAIHistory = asyncHandler(async (req, res) => {
    const aiHistory =
        await aiHistoryService.getAIHistory(
            req.params.id,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                aiHistory,
                "AI history fetched successfully"
            )
        );
});

// =====================================================
// GET AI HISTORY FOR APPLICATION
// =====================================================

const getApplicationAIHistory =
    asyncHandler(async (req, res) => {
        const aiHistory =
            await aiHistoryService.getApplicationAIHistory(
                req.params.applicationId,
                req.user._id
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    aiHistory,
                    "Application AI history fetched successfully"
                )
            );
    });

// =====================================================
// GET AI HISTORY FOR JOB
// =====================================================

const getJobAIHistory =
    asyncHandler(async (req, res) => {
        const aiHistory =
            await aiHistoryService.getJobAIHistory(
                req.params.jobId,
                req.user._id
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    aiHistory,
                    "Job AI history fetched successfully"
                )
            );
    });

// =====================================================
// GET AI HISTORY BY TYPE
// =====================================================

const getAIHistoryByType =
    asyncHandler(async (req, res) => {
        const aiHistory =
            await aiHistoryService.getAIHistoryByType(
                req.user._id,
                req.params.type
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    aiHistory,
                    "AI history fetched successfully"
                )
            );
    });

// =====================================================
// UPDATE AI HISTORY
// =====================================================

const updateAIHistory =
    asyncHandler(async (req, res) => {
        const aiHistory =
            await aiHistoryService.updateAIHistory(
                req.params.id,
                req.user._id,
                req.body
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    aiHistory,
                    "AI history updated successfully"
                )
            );
    });

// =====================================================
// DELETE AI HISTORY
// =====================================================

const deleteAIHistory =
    asyncHandler(async (req, res) => {
        await aiHistoryService.deleteAIHistory(
            req.params.id,
            req.user._id
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "AI history deleted successfully"
                )
            );
    });

export {
    createAIHistory,
    getUserAIHistory,
    getAIHistory,
    getApplicationAIHistory,
    getJobAIHistory,
    getAIHistoryByType,
    updateAIHistory,
    deleteAIHistory,
};