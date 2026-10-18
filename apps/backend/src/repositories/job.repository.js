import Job from "../models/job.model.js";

class JobRepository {
    // Create a new job
    async create(jobData) {
        return await Job.create(jobData);
    }

    // Find all jobs
    async findAll() {
        return await Job.find().sort({
            createdAt: -1,
        });
    }

    // Find a job by ID
    async findById(jobId) {
        return await Job.findById(jobId);
    }

    // Find a job by exact URL
    async findByUrl(jobUrl) {
        if (!jobUrl) return null;
        return await Job.findOne({ jobUrl: jobUrl.trim() });
    }

    // Find a job by company and title (case-insensitive)
    async findByCompanyAndTitle(company, jobTitle) {
        if (!company || !jobTitle) return null;
        return await Job.findOne({
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