import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as jobAnalysisService from "../services/jobAnalysis.service.js";

const analyzeJob = asyncHandler(async (req, res) => {
    const result =
        await jobAnalysisService.analyzeJob(
            req.params.jobId,
            req.user._id
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Job analyzed successfully"
            )
        );
});

export {
    analyzeJob,
};