const { env } = process;

module.exports = {
  NODE_ENV: env.NODE_ENV || 'development',
  PORT: env.PORT || 4000,
  MONGO_URI: env.MONGO_URI || 'mongodb://127.0.0.1:27017/careeros',
  JWT_SECRET: env.JWT_SECRET || 'change-me',
  CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET || '',
};
