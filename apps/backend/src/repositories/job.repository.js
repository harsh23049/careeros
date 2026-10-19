import Job from "../models/job.model.js";

class JobRepository {
    // Create a new job
    async create(jobData) {
        return await Job.create(jobData);
    }

    // Find all saved jobs belonging to a specific user
    async findByUser(userId) {
        return await Job.find({
            user: userId,
        }).sort({
            createdAt: -1,
        });
    }

    // Find a single saved job belonging to a specific user
    async findByIdAndUser(jobId, userId) {
        return await Job.findOne({
            _id: jobId,
            user: userId,
        });
    }

    // Find a job by ID
    async findById(jobId) {
        return await Job.findById(jobId);
    }

    // Find a job by exact URL belonging to a specific user (scoped duplicate check)
    async findByUrlAndUser(jobUrl, userId) {
        if (!jobUrl || !userId) return null;
        return await Job.findOne({
            jobUrl: jobUrl.trim(),
            user: userId,
        });
    }

    // Find a job by company and title belonging to a specific user (scoped duplicate check)
    async findByCompanyAndTitleAndUser(company, jobTitle, userId) {
        if (!company || !jobTitle || !userId) return null;
        return await Job.findOne({
            user: userId,
            company: { $regex: new RegExp(`^${company.trim()}$`, "i") },
            jobTitle: { $regex: new RegExp(`^${jobTitle.trim()}$`, "i") },
        });
    }

    // Update a job
    async update(jobId, updateData) {
        return await Job.findByIdAndUpdate(
            jobId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // Delete a job
    async deleteById(jobId) {
        return await Job.findByIdAndDelete(jobId);
    }
}

export default new JobRepository();