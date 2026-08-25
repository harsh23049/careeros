import jobRepository from "../repositories/job.repository.js";
import resumeRepository from "../repositories/resume.repository.js";
import aiHistoryRepository from "../repositories/aiHistory.repository.js";
import { generateStructuredOutput } from "./gemini.service.js";
import ApiError from "../utils/ApiError.js";

const matchResumeToJob = async (
    jobId,
    resumeId,
    userId
) => {
    // 1. Fetch the job
    const job =
        await jobRepository.findById(jobId);

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    // 2. Make sure the job has been analyzed
    if (
        !job.extractedEntities ||
        Object.keys(job.extractedEntities).length === 0
    ) {
        throw new ApiError(
            400,
            "Job must be analyzed before matching a resume"
        );
    }

    // 3. Fetch the user's resume
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

    // 4. Build the prompt
    const prompt = `
Compare the candidate's resume against the analyzed job.

JOB ANALYSIS:
${JSON.stringify(
    job.extractedEntities,
    null,
    2
)}

RESUME:

Title:
${resume.title || ""}

Summary:
${resume.summary || ""}

Skills:
${JSON.stringify(resume.skills || [])}

Experience:
${JSON.stringify(resume.experience || [])}

Education:
${JSON.stringify(resume.education || [])}

Projects:
${JSON.stringify(resume.projects || [])}

Evaluate how well the candidate matches the job.

Consider:
- Skills
- Technologies
- Requirements
- Experience
- Projects
- Education
- Domain relevance

Do not assume the candidate has a skill or experience
unless it is present in the resume.

Return the result using the provided JSON schema.
`;

    // 5. Define structured response
    const responseSchema = {
        type: "object",

        properties: {
            matchScore: {
                type: "number",
            },

            matchingSkills: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            missingSkills: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            strengths: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            weaknesses: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            recommendations: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },

        required: [
            "matchScore",
            "matchingSkills",
            "missingSkills",
            "strengths",
            "weaknesses",
            "recommendations",
        ],
    };

    // 6. Ask Gemini for the match analysis
    const result =
        await generateStructuredOutput(
            prompt,
            responseSchema
        );

    // 7. Save the AI operation in AIHistory
    const aiHistory =
        await aiHistoryRepository.create({
            user: userId,

            job: jobId,

            type: "resume_match",

            model:
                process.env.GEMINI_MODEL ||
                "gemini-3.6-flash",

            input: {
                jobId,
                resumeId,
            },

            output: result.output,

            accepted: false,

            usage: {
                promptTokens:
                    result.usage?.promptTokenCount || 0,

                completionTokens:
                    result.usage?.candidatesTokenCount || 0,

                totalTokens:
                    result.usage?.totalTokenCount || 0,
            },
        });

    return {
        jobId,
        resumeId,
        matchAnalysis: result.output,
        aiHistory,
    };
};

export {
    matchResumeToJob,
};