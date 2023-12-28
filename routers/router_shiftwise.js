const express = require('express');
const router = express.Router();

const ModelShiftWise = require('../models/model_shiftswise')

router.get('/getlist', async (req, res) => {
    let msw = await ModelShiftWise.find().sort({ _id: -1 });
    res.json(msw)
})

router.post('/create', async (req, res) => {
    
    let {
        shiftlabel,
        shiftadm
    } = req.body;

    let newshift = await ModelShiftWise.create({
        shiftlabel,
        shiftadm
    })
    
    res.json(req.body)
})

module.exports = router;
