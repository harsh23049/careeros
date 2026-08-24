import AIHistory from "../models/aiHistory.model.js";

class AIHistoryRepository {
    // Create a new AI history record
    async create(aiHistoryData) {
        return await AIHistory.create(
            aiHistoryData
        );
    }

    // Find an AI history record by ID
    async findById(aiHistoryId) {
        return await AIHistory.findById(
            aiHistoryId
        )
            .populate("job")
            .populate("application");
    }

    // Find an AI history record belonging to a user
    async findByIdAndUser(
        aiHistoryId,
        userId
    ) {
        return await AIHistory.findOne({
            _id: aiHistoryId,
            user: userId,
        })
            .populate("job")
            .populate("application");
    }

    // Find all AI history records of a user
    async findByUser(userId) {
        return await AIHistory.find({
            user: userId,
        })
            .populate("job")
            .populate("application")
            .sort({
                createdAt: -1,
            });
    }

    // Find AI history for an application
    async findByApplication(
        applicationId,
        userId
    ) {
        return await AIHistory.find({
            application: applicationId,
            user: userId,
        })
            .populate("job")
            .sort({
                createdAt: -1,
            });
    }

    // Find AI history for a job
    async findByJob(jobId, userId) {
        return await AIHistory.find({
            job: jobId,
            user: userId,
        })
            .populate("application")
            .sort({
                createdAt: -1,
            });
    }

    // Find AI history by type
    async findByType(
        userId,
        type
    ) {
        return await AIHistory.find({
            user: userId,
            type,
        })
            .populate("job")
            .populate("application")
            .sort({
                createdAt: -1,
            });
    }

    // Update an AI history record
    async update(
        aiHistoryId,
        updateData
    ) {
        return await AIHistory.findByIdAndUpdate(
            aiHistoryId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("job")
            .populate("application");
    }

    // Delete an AI history record
    async deleteById(aiHistoryId) {
        return await AIHistory.findByIdAndDelete(
            aiHistoryId
        );
    }

    // Delete all AI history of a user
    async deleteByUserId(userId) {
        return await AIHistory.deleteMany({
            user: userId,
        });
    }
}

export default new AIHistoryRepository();