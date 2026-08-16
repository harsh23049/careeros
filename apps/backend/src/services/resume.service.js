import resumeRepository from "../repositories/resume.repository.js";
import ApiError from "../utils/ApiError.js";

// Create a new resume
const createResume = async (userId, resumeData) => {
    const {
        title,
        file,
        version,
        isDefault = false,
        skills,
        summary,
        experience,
        education,
        projects,
        extractedData,
    } = resumeData;

    if (isDefault) {
        await resumeRepository.unsetDefaultResumes(userId);
    }

    const resume = await resumeRepository.create({
        user: userId,
        title,
        file,
        version,
        isDefault,
        skills,
        summary,
        experience,
        education,
        projects,
        extractedData,
    });

    return resume;
};

// Get all resumes of the current user
const getUserResumes = async (userId) => {
    return await resumeRepository.findByUser(userId);
};

// Get a single resume after verifying ownership
const getResume = async (resumeId, userId) => {
    const resume =
        await resumeRepository.findByIdAndUser(
            resumeId,
            userId
        );

    if (!resume) {
        throw new ApiError(
            404,
            "Resume not found"
        );
    }

    return resume;
};

// Get the default resume
const getDefaultResume = async (userId) => {
    const resume =
        await resumeRepository.findDefaultByUser(
            userId
        );

    if (!resume) {
        throw new ApiError(
            404,
            "Default resume not found"
        );
    }

    return resume;
};

// Update a resume
const updateResume = async (
    resumeId,
    userId,
    updateData
) => {
    const resume =
        await resumeRepository.findByIdAndUser(
            resumeId,
            userId
        );

    if (!resume) {
        throw new ApiError(
            404,
            "Resume not found"
        );
    }

    const allowedFields = [
        "title",
        "file",
        "version",
        "isDefault",
        "skills",
        "summary",
        "experience",
        "education",
        "projects",
        "extractedData",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    if (updateData.isDefault === true) {
        await resumeRepository.unsetDefaultResumes(
            userId
        );
    }

    const updatedResume =
        await resumeRepository.update(
            resumeId,
            updates
        );

    if (!updatedResume) {
        throw new ApiError(
            404,
            "Resume not found"
        );
    }

    return updatedResume;
};

// Delete a resume
const deleteResume = async (
    resumeId,
    userId
) => {
    const resume =
        await resumeRepository.findByIdAndUser(
            resumeId,
            userId
        );

    if (!resume) {
        throw new ApiError(
            404,
            "Resume not found"
        );
    }

    await resumeRepository.deleteById(
        resumeId
    );

    return true;
};

export {
    createResume,
    getUserResumes,
    getResume,
    getDefaultResume,
    updateResume,
    deleteResume,
};