import User from "../models/user.model.js";

class userRepository {

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }

    async findById(userId) {
        return await User.findById(userId);
    }

    async create(userData) {
        return await User.create(userData);
    }

    async updateRefreshToken(userId, refreshToken) {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );
    }
}

export default new userRepository();