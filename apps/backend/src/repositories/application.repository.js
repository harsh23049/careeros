import Application from "../models/application.model.js";

// =====================================================
// CREATE
// =====================================================

const create = async (applicationData) => {
    return await Application.create(applicationData);
};

// =====================================================
// FIND BY ID
// =====================================================

const findById = async (applicationId) => {
    return await Application.findById(applicationId);
};

// =====================================================
// FIND BY ID + USER
// =====================================================
// Used when we want to make sure the application
// actually belongs to the authenticated user.
// =====================================================

const findByIdAndUser = async (
    applicationId,
    userId
) => {
    return await Application.findOne({
        _id: applicationId,
        user: userId,
    });
};

// =====================================================
// FIND ALL APPLICATIONS OF A USER
// =====================================================

const findByUser = async (userId) => {
    return await Application.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });
};

// =====================================================
// FIND APPLICATIONS BY STATUS
// =====================================================

const findByUserAndStatus = async (
    userId,
    status
) => {
    return await Application.find({
        user: userId,
        status,
    }).sort({
        createdAt: -1,
    });
};

// =====================================================
// UPDATE
// =====================================================

const update = async (
    applicationId,
    updateData
) => {
    return await Application.findByIdAndUpdate(
        applicationId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
};

// =====================================================
// DELETE
// =====================================================

const deleteById = async (applicationId) => {
    return await Application.findByIdAndDelete(
        applicationId
    );
};

// =====================================================
// DELETE ALL APPLICATIONS OF A USER
// =====================================================
// Important for future account deletion.
// =====================================================

const deleteByUserId = async (userId) => {
    return await Application.deleteMany({
        user: userId,
    });
};

// =====================================================
// EXPORTS
// =====================================================

export {
    create,
    findById,
    findByIdAndUser,
    findByUser,
    findByUserAndStatus,
    update,
    deleteById,
    deleteByUserId,
};