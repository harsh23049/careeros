const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Careeros backend is running' });
});

module.exports = router;
