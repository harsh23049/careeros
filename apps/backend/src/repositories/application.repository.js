import Application from "../models/application.model.js";

class ApplicationRepository {
    // Create a new application
// Create a new application
async create(applicationData) {
    const application = await Application.create(
        applicationData
    );

    return await Application.findById(
        application._id
    )
        .populate("job")
        .populate("resume")
        .populate("coverLetter");
}
    // Find an application by ID
    async findById(applicationId) {
        return await Application.findById(applicationId)
            .populate("job")
            .populate("resume")
            .populate("coverLetter");
    }

    // Find an application belonging to a specific user
    async findByIdAndUser(applicationId, userId) {
        return await Application.findOne({
            _id: applicationId,
            user: userId,
        })
            .populate("job")
            .populate("resume")
            .populate("coverLetter");
    }

    // Find all applications of a user
    async findByUser(userId) {
        return await Application.find({
            user: userId,
        })
            .populate("job")
            .populate("resume")
            .populate("coverLetter")
            .sort({
                createdAt: -1,
            });
    }

    // Find applications of a user by status
    async findByUserAndStatus(userId, status) {
        return await Application.find({
            user: userId,
            status,
        })
            .populate("job")
            .populate("resume")
            .populate("coverLetter")
            .sort({
                createdAt: -1,
            });
    }

    // Update an application
    async update(applicationId, updateData) {
        return await Application.findByIdAndUpdate(
            applicationId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("job")
            .populate("resume")
            .populate("coverLetter");
    }

    // Delete an application
    async deleteById(applicationId) {
        return await Application.findByIdAndDelete(
            applicationId
        );
    }

    // Delete all applications belonging to a user
    async deleteByUserId(userId) {
        return await Application.deleteMany({
            user: userId,
        });
    }
}

export default new ApplicationRepository();