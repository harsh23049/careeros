import jobRepository from "../repositories/job.repository.js";
import resumeRepository from "../repositories/resume.repository.js";
import coverLetterRepository from "../repositories/coverLetter.repository.js";
import aiHistoryRepository from "../repositories/aiHistory.repository.js";

import { generateText } from "./gemini.service.js";
import ApiError from "../utils/ApiError.js";

const generateCoverLetter = async (
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

    // 2. Make sure the resume belongs to the user
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

    // 3. Get job analysis if available
    const jobAnalysis =
        job.extractedEntities || {};

    // 4. Build the prompt
    const prompt = `
Write a personalized professional cover letter
for the candidate applying to the following job.

JOB INFORMATION

Company:
${job.company}

Job Title:
${job.jobTitle}

Description:
${job.description || ""}

Location:
${job.location || ""}

Employment Type:
${job.employmentType || ""}

Job Analysis:
${JSON.stringify(
    jobAnalysis,
    null,
    2
)}


CANDIDATE RESUME

Resume Title:
${resume.title || ""}

Summary:
${resume.summary || ""}

Skills:
${JSON.stringify(
    resume.skills || [],
    null,
    2
)}

Experience:
${JSON.stringify(
    resume.experience || [],
    null,
    2
)}

Education:
${JSON.stringify(
    resume.education || [],
    null,
    2
)}

Projects:
${JSON.stringify(
    resume.projects || [],
    null,
    2
)}


INSTRUCTIONS

1. Write a professional and personalized cover letter.
2. Focus on the candidate's relevant skills and experience.
3. Connect the candidate's background with the job requirements.
4. Do not invent skills, experience, education, achievements,
   or qualifications that are not present in the resume.
5. Avoid generic statements where specific resume information
   can be used.
6. Keep the letter concise and professional.
7. Do not include a subject line.
8. Return only the cover letter text.
`;

    // 5. Generate the cover letter
    const result =
        await generateText(prompt);

    if (!result.text) {
        throw new ApiError(
            500,
            "Gemini failed to generate cover letter"
        );
    }

    const latestCoverLetter =
    await coverLetterRepository.findLatestVersion(
        userId,
        jobId,
        resumeId
    );


    const nextVersion =
    latestCoverLetter
        ? latestCoverLetter.version + 1
        : 1;

        
    // 6. Create the CoverLetter document
    const coverLetter =
        await coverLetterRepository.create({
            user: userId,
            job: jobId,
            title: `${job.company} - ${job.jobTitle} Cover Letter`,
            content: result.text,
            generatedByAI: true,
            aiModel:
                process.env.GEMINI_MODEL ||
                "gemini-3.6-flash",
            prompt,
            version: 1,
            isUsed: false,
        });

    // 7. Save AI operation in AIHistory
    const aiHistory =
        await aiHistoryRepository.create({
            user: userId,
            job: jobId,

            type: "cover_letter",

            model:
                process.env.GEMINI_MODEL ||
                "gemini-3.6-flash",

            input: {
                jobId,
                resumeId,
                jobAnalysis,
            },

            output: {
                coverLetter: result.text,
            },

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
        coverLetter,
        aiHistory,
    };
};

export {
    generateCoverLetter,
};