
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