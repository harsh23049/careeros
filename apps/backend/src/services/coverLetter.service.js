import coverLetterRepository from "../repositories/coverLetter.repository.js";
import ApiError from "../utils/ApiError.js";

// Create a new cover letter
const createCoverLetter = async (
    userId,
    coverLetterData
) => {
    const {
        application,
        job,
        title,
        content,
        generatedByAI = false,
        aiModel,
        prompt,
        version = 1,
        isUsed = false,
    } = coverLetterData;

    const coverLetter =
        await coverLetterRepository.create({
            user: userId,
            application,
            job,
            title,
            content,
            generatedByAI,
            aiModel,
            prompt,
            version,
            isUsed,
        });

    return coverLetter;
};

// Get all cover letters of the current user
const getUserCoverLetters = async (userId) => {
    return await coverLetterRepository.findByUser(
        userId
    );
};

// Get a single cover letter
const getCoverLetter = async (
    coverLetterId,
    userId
) => {
    const coverLetter =
        await coverLetterRepository.findByIdAndUser(
            coverLetterId,
            userId
        );

    if (!coverLetter) {
        throw new ApiError(
            404,
            "Cover letter not found"
        );
    }

    return coverLetter;
};

// Get cover letters for an application
const getApplicationCoverLetters = async (
    applicationId,
    userId
) => {
    return await coverLetterRepository.findByApplication(
        applicationId,
        userId
    );
};

// Update a cover letter
const updateCoverLetter = async (
    coverLetterId,
    userId,
    updateData
) => {
    const coverLetter =
        await coverLetterRepository.findByIdAndUser(
            coverLetterId,
            userId
        );

    if (!coverLetter) {
        throw new ApiError(
            404,
            "Cover letter not found"
        );
    }

    const allowedFields = [
        "title",
        "content",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(
            400,
            "No valid fields to update"
        );
    }

    const updatedCoverLetter =
        await coverLetterRepository.update(
            coverLetterId,
            updates
        );

    if (!updatedCoverLetter) {
        throw new ApiError(
            404,
            "Cover letter not found"
        );
    }

    return updatedCoverLetter;
};

// Delete a cover letter
const deleteCoverLetter = async (
    coverLetterId,
    userId
) => {
    const coverLetter =
        await coverLetterRepository.findByIdAndUser(
            coverLetterId,
            userId
        );

    if (!coverLetter) {
        throw new ApiError(
            404,
            "Cover letter not found"
        );
    }

    await coverLetterRepository.deleteById(
        coverLetterId
    );

    return true;
};

export {
    createCoverLetter,
    getUserCoverLetters,
    getCoverLetter,
    getApplicationCoverLetters,
    updateCoverLetter,
    deleteCoverLetter,
};