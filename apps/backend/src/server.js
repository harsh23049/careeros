const mongoose = require('mongoose');
const app = require('./app');
const { MONGO_URI, PORT } = require('./config/env');

const port = PORT || 4000;

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
