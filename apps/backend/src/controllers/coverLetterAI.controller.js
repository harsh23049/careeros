import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as coverLetterAIService from "../services/coverLetterAI.service.js";

const generateCoverLetter = asyncHandler(async (req, res) => {
    const result =
        await coverLetterAIService.generateCoverLetter(
            req.params.jobId,
            req.params.resumeId,
            req.user._id
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                result,
                "Cover letter generated successfully"
            )
        );
});

export {
    generateCoverLetter,
};