import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as jobService from "../services/job.service.js";

// Create a new job for authenticated user
const createJob = asyncHandler(async (req, res) => {
    const job = await jobService.createJob(
        req.user._id,
        req.body
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                job,
                "Job created successfully"
            )
        );
});

// Get all jobs for authenticated user
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await jobService.getJobs(req.user._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                jobs,
                "Jobs fetched successfully"
            )
        );
});

// Get a single job
const getJob = asyncHandler(async (req, res) => {
    const job = await jobService.getJob(
        req.params.id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                job,
                "Job fetched successfully"
            )
        );
});

// Update a job
const updateJob = asyncHandler(async (req, res) => {
    const job = await jobService.updateJob(
        req.params.id,
        req.body
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                job,
                "Job updated successfully"
            )
        );
});

// Delete a job
const deleteJob = asyncHandler(async (req, res) => {
    await jobService.deleteJob(
        req.params.id
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Job deleted successfully"
            )
        );
});

export {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
};