const express = require('express');
const router = express.Router();


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, callback) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    callback(null, uniqueName);
  },
});

const upload = multer({
  storage
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json('No file uploaded.');
  }
  // Handle the uploaded file here (e.g., save it to a database)
  // You can access the file path with req.file.path
  res.json({
    key: req.body.key,
    newfilename: req.file.filename
  });
});


module.exports = router;