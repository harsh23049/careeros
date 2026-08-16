import Resume from "../models/resume.model.js";

class ResumeRepository {
    // Create a new resume
    async create(resumeData) {
        return await Resume.create(resumeData);
    }

    // Find a resume by ID
    async findById(resumeId) {
        return await Resume.findById(resumeId);
    }

    // Find a resume belonging to a user
    async findByIdAndUser(resumeId, userId) {
        return await Resume.findOne({
            _id: resumeId,
            user: userId,
        });
    }

    // Find all resumes of a user
    async findByUser(userId) {
        return await Resume.find({
            user: userId,
        }).sort({
            createdAt: -1,
        });
    }

    // Find the default resume of a user
    async findDefaultByUser(userId) {
        return await Resume.findOne({
            user: userId,
            isDefault: true,
        });
    }

    // Update a resume
    async update(resumeId, updateData) {
        return await Resume.findByIdAndUpdate(
            resumeId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // Delete a resume
    async deleteById(resumeId) {
        return await Resume.findByIdAndDelete(
            resumeId
        );
    }

    // Delete all resumes of a user
    async deleteByUserId(userId) {
        return await Resume.deleteMany({
            user: userId,
        });
    }

    // Set all resumes of a user to not default
async unsetDefaultResumes(userId) {
    return await Resume.updateMany(
        {
            user: userId,
            isDefault: true,
        },
        {
            $set: {
                isDefault: false,
            },
        }
    );
}  
}

export default new ResumeRepository();