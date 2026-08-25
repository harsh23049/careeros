import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as resumeMatchingService from "../services/resumeMatching.service.js";

const matchResumeToJob = asyncHandler(async (req, res) => {
    const result =
        await resumeMatchingService.matchResumeToJob(
            req.params.jobId,
            req.params.resumeId,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Resume matched with job successfully"
            )
        );
});

export {
    matchResumeToJob,
};