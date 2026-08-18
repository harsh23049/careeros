import CoverLetter from "../models/coverLetter.model.js";

class CoverLetterRepository {
    // Create a new cover letter
    async create(coverLetterData) {
        return await CoverLetter.create(
            coverLetterData
        );
    }

    // Find a cover letter by ID
    async findById(coverLetterId) {
        return await CoverLetter.findById(
            coverLetterId
        );
    }

    // Find a cover letter belonging to a user
    async findByIdAndUser(
        coverLetterId,
        userId
    ) {
        return await CoverLetter.findOne({
            _id: coverLetterId,
            user: userId,
        });
    }

    // Find all cover letters of a user
    async findByUser(userId) {
        return await CoverLetter.find({
            user: userId,
        }).sort({
            createdAt: -1,
        });
    }

    // Find cover letters for an application
    async findByApplication(
        applicationId,
        userId
    ) {
        return await CoverLetter.find({
            application: applicationId,
            user: userId,
        }).sort({
            createdAt: -1,
        });
    }

    // Update a cover letter
    async update(
        coverLetterId,
        updateData
    ) {
        return await CoverLetter.findByIdAndUpdate(
            coverLetterId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // Delete a cover letter
    async deleteById(coverLetterId) {
        return await CoverLetter.findByIdAndDelete(
            coverLetterId
        );
    }

    // Delete all cover letters of a user
    async deleteByUserId(userId) {
        return await CoverLetter.deleteMany({
            user: userId,
        });
    }
}

export default new CoverLetterRepository();