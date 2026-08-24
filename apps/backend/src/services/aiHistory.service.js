import aiHistoryRepository from "../repositories/aiHistory.repository.js";
import ApiError from "../utils/ApiError.js";

// =====================================================
// CREATE AI HISTORY
// =====================================================

const createAIHistory = async (
    userId,
    aiHistoryData
) => {
    const {
        application,
        job,
        type,
        model,
        input,
        output,
        accepted = false,
        usage,
    } = aiHistoryData;

    const aiHistory =
        await aiHistoryRepository.create({
            user: userId,
            application,
            job,
            type,
            model,
            input,
            output,
            accepted,
            usage,
        });

    return aiHistory;
};

// =====================================================
// GET ALL AI HISTORY OF USER
// =====================================================

const getUserAIHistory = async (
    userId
) => {
    return await aiHistoryRepository.findByUser(
        userId
    );
};

// =====================================================
// GET SINGLE AI HISTORY
// =====================================================

const getAIHistory = async (
    aiHistoryId,
    userId
) => {
    const aiHistory =
        await aiHistoryRepository.findByIdAndUser(
            aiHistoryId,
            userId
        );

    if (!aiHistory) {
        throw new ApiError(
            404,
            "AI history not found"
        );
    }

    return aiHistory;
};

// =====================================================
// GET AI HISTORY FOR APPLICATION
// =====================================================

const getApplicationAIHistory = async (
    applicationId,
    userId
) => {
    return await aiHistoryRepository.findByApplication(
        applicationId,
        userId
    );
};

// =====================================================
// GET AI HISTORY FOR JOB
// =====================================================

const getJobAIHistory = async (
    jobId,
    userId
) => {
    return await aiHistoryRepository.findByJob(
        jobId,
        userId
    );
};

// =====================================================
// GET AI HISTORY BY TYPE
// =====================================================

const getAIHistoryByType = async (
    userId,
    type
) => {
    return await aiHistoryRepository.findByType(
        userId,
        type
    );
};

// =====================================================
// UPDATE AI HISTORY
// =====================================================

const updateAIHistory = async (
    aiHistoryId,
    userId,
    updateData
) => {
    const aiHistory =
        await aiHistoryRepository.findByIdAndUser(
            aiHistoryId,
            userId
        );

    if (!aiHistory) {
        throw new ApiError(
            404,
            "AI history not found"
        );
    }

    const allowedFields = [
        "accepted",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    const updatedAIHistory =
        await aiHistoryRepository.update(
            aiHistoryId,
            updates
        );

    if (!updatedAIHistory) {
        throw new ApiError(
            404,
            "AI history not found"
        );
    }

    return updatedAIHistory;
};

// =====================================================
// DELETE AI HISTORY
// =====================================================

const deleteAIHistory = async (
    aiHistoryId,
    userId
) => {
    const aiHistory =
        await aiHistoryRepository.findByIdAndUser(
            aiHistoryId,
            userId
        );

    if (!aiHistory) {
        throw new ApiError(
            404,
            "AI history not found"
        );
    }

    await aiHistoryRepository.deleteById(
        aiHistoryId
    );

    return true;
};

// =====================================================
// EXPORTS
// =====================================================

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