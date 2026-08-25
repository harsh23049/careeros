import jobRepository from "../repositories/job.repository.js";
import aiHistoryRepository from "../repositories/aiHistory.repository.js";
import { generateStructuredOutput } from "./gemini.service.js";
import ApiError from "../utils/ApiError.js";

const analyzeJob = async (
    jobId,
    userId
) => {
    // 1. Find the job
    const job =
        await jobRepository.findById(jobId);

    if (!job) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    // 2. Create the prompt
    const prompt = `
Analyze the following job posting.

Extract the important information needed by a
job application management system.

Job Title:
${job.jobTitle}

Company:
${job.company}

Description:
${job.description || ""}

Location:
${job.location || ""}

Employment Type:
${job.employmentType || ""}

Existing Skills:
${job.skills?.join(", ") || ""}

Requirements:
${job.requirements?.join("\n") || ""}

Responsibilities:
${job.responsibilities?.join("\n") || ""}

Return the analysis using the provided JSON schema.
Do not include information that cannot reasonably
be inferred from the job posting.
`;

    // 3. Define the expected Gemini response
    const responseSchema = {
        type: "object",

        properties: {
            summary: {
                type: "string",
            },

            skills: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            requirements: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            responsibilities: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            technologies: {
                type: "array",
                items: {
                    type: "string",
                },
            },

            domains: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },

        required: [
            "summary",
            "skills",
            "requirements",
            "responsibilities",
            "technologies",
            "domains",
        ],
    };

    // 4. Ask Gemini to analyze the job
    const result =
        await generateStructuredOutput(
            prompt,
            responseSchema
        );

    // 5. Save AI analysis inside the Job
    const updatedJob =
        await jobRepository.update(
            jobId,
            {
                extractedEntities:
                    result.output,
            }
        );

    if (!updatedJob) {
        throw new ApiError(
            404,
            "Job not found"
        );
    }

    // 6. Store the AI operation in AIHistory
    const aiHistory =
        await aiHistoryRepository.create({
            user: userId,
            job: jobId,

            type: "job_analysis",

            model:
                process.env.GEMINI_MODEL ||
                "gemini-3.6-flash",

            input: {
                jobId,
                prompt,
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
        job: updatedJob,
        analysis: result.output,
        aiHistory,
    };
};

export {
    analyzeJob,
};