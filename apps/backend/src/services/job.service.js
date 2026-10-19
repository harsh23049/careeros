import jobRepository from "../repositories/job.repository.js";
import ApiError from "../utils/ApiError.js";

// Create a new job with user-scoped duplicate checking
const createJob = async (userId, jobData) => {
    if (!userId) {
        throw new ApiError(401, "Authentication required to save jobs");
    }

    // 1. Check if job with exact URL already exists for THIS user
    if (jobData?.jobUrl?.trim()) {
        const existingByUrl = await jobRepository.findByUrlAndUser(
            jobData.jobUrl.trim(),
            userId
        );
        if (existingByUrl) {
            const error = new ApiError(409, "Job is already saved in CareerOS");
            error.data = existingByUrl;
            throw error;
        }
    }

    // 2. Check if job with same company and title already exists for THIS user
    if (jobData?.company?.trim() && jobData?.jobTitle?.trim()) {
        const existingByDetails = await jobRepository.findByCompanyAndTitleAndUser(
            jobData.company.trim(),
            jobData.jobTitle.trim(),
            userId
        );
        if (existingByDetails) {
            const error = new ApiError(409, "Job is already saved in CareerOS");
            error.data = existingByDetails;
            throw error;
        }
    }

    const job = await jobRepository.create({
        ...jobData,
        user: userId,
    });
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