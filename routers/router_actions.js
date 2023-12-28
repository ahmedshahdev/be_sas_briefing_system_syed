const express = require('express');
const router = express.Router();

const ModelActions = require('../models/actions');

router.get('/view', async (req, res) => {
    let actions = await ModelActions.find().sort({ _id: -1 }).populate('staff').populate('actionwith');
    res.json(actions)
})

// 
router.post('/viewbyfilter', async (req, res) => {
    let { staff, actionwith, status } = req.body;
    console.log(req.body)

    const filter = {};

    if (staff) {
        filter.staff = staff;
    }

    if (actionwith) {
        filter.actionwith = actionwith;
    }

    if (status) {
        filter.status = status;
    }

    let actions = await ModelActions.find(filter).sort({ _id: -1 }).populate('staff').populate('actionwith');
    res.json(actions);
})

router.post('/viewbyid', async (req, res) => {
    let { actionwith } = req.body;
    // console.log('req ', req.body)

    const filter = {};

    if (actionwith) {
        filter.actionwith = actionwith;
    }
    let actions = [];
   try {
    actions = await ModelActions.find(filter).sort({ _id: -1 }).populate('staff').populate('actionwith');

   } catch (err) {
    actions = [];
   }
    res.json(actions);
})

router.post('/update', async (req, res) => {
    let {
        key,
        value,
        id
    } = req.body;


    let staff = await ModelActions.findById(id);
    if (staff) {
        staff[key] = value;
        staff.save()
    }

    res.json("success")

})

module.exports = router;
