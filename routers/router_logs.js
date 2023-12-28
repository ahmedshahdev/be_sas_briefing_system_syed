const express = require('express');
const router = express.Router();

const ModelLogs = require('../models/model_logs')

router.get('/getlogslist', async (req, res) => {
    let logs = await ModelLogs.find().sort({ _id: -1 }).populate('logby');
    res.json(logs)
})

module.exports = router;
