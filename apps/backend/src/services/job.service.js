import jobRepository from "../repositories/job.repository.js";
import ApiError from "../utils/ApiError.js";

// Create a new job
const createJob = async (jobData) => {
    const job = await jobRepository.create(jobData);

    return job;
};

// Get all jobs
const getJobs = async () => {
    return await jobRepository.findAll();
};

// Get a single job
const getJob = async (jobId) => {
    const job = await jobRepository.findById(jobId);

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    return job;
};

// Update a job
const updateJob = async (
    jobId,
    updateData
) => {
    const allowedFields = [
        "company",
        "jobTitle",
        "jobUrl",
        "description",
        "location",
        "employmentType",
        "workMode",
        "salary",
        "skills",
        "requirements",
        "responsibilities",
        "source",
        "extractedEntities",
        "postedAt",
        "expiresAt",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    const job = await jobRepository.update(
        jobId,
        updates
    );

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    return job;
};

// Delete a job
const deleteJob = async (jobId) => {
    const job = await jobRepository.deleteById(
        jobId
    );

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    return true;
};

export {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
};