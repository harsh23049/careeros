import Job from "../models/job.model.js";

class JobRepository {
    // Create a new job with owner association
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

    // Update a job belonging to a specific user
    async updateByIdAndUser(jobId, userId, updateData) {
        return await Job.findOneAndUpdate(
            {
                _id: jobId,
                user: userId,
            },
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // Delete a job belonging to a specific user
    async deleteByIdAndUser(jobId, userId) {
        return await Job.findOneAndDelete({
            _id: jobId,
            user: userId,
        });
    }

    // Delete all jobs belonging to a user (account cleanup)
    async deleteByUserId(userId) {
        return await Job.deleteMany({
            user: userId,
        });
    }
}

export default new JobRepository();