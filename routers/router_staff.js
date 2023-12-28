const express = require('express');
const router = express.Router();

const ModelStaff = require('../models/model_staff')
const ModelStaffSign = require('../models/model_staff_sign')
const ModelBriefing = require('../models/model_briefing');
const ModelStaffCategory = require('../models/model_staff_category');
const StaffModel = require('../models/model_staff');

router.post('/create', async (req, res) => {
    let {
        staffid,
        staffname,
        staffbriefing,
        staffcategory,
        controlpanelaccess,
        staffpassword,
        shift
    } = req.body;



    let newStaff = await ModelStaff.create({
        staffid,
        staffname,
        staffbriefing,
        staffcategory,
        staffpassword,
        controlpanelaccess,
        shift
    })

    let mb = await ModelStaffCategory.find({
        designation: staffcategory
    });
    if (mb.length > 0) {
        mb[0].totalstaff += 1
        await mb[0].save()
    }

    let allbriefing = await ModelBriefing.find({
        designation: staffcategory
    })
    if (allbriefing.length > 0) {
        await Promise.all(allbriefing.map(async (briefing) => {
            // let {
            //     staffid,
            //     staffname,
            //     designation,
            //     category,
            //     questions,
            //     id,
            //     briefingid
            // // } = req.body;


            let newStaff = await ModelStaffSign.create({
                staffid: staffid,
                staffname: staffname,
                designation: staffcategory,
                category: briefing.category,
                questions: briefing.questions,
                briefingid: briefing._id,
                briefingtitle: briefing.title
            })

        }));

        // let mb = await ModelBriefing.findById(newbriefing._id);
        // mb.noofsigned += allstaffs.length;
        // mb.save()
    }






    res.json('sucess')
})



router.post('/updatestaff', async (req, res) => {
    let {
        key,
        value,
        id
    } = req.body;

    // console.log(key, value) staffcategory

    let staff = await ModelStaff.findById(id);
    if (staff) {
        let mb0 = await ModelStaffCategory.find({
            designation: staff.staffcategory
        });
        if (mb0.length > 0) {
            mb0[0].totalstaff -= 1
            await mb0[0].save()
        }
    

        staff[key] = value;
        staff.save()

        if (key === 'staffcategory') {
        let allbriefing = await ModelBriefing.find({
            designation: value
        })
        if (allbriefing.length > 0) {
            await Promise.all(allbriefing.map(async (briefing) => {
                // let {
                //     staffid,
                //     staffname,
                //     designation,
                //     category,
                //     questions,
                //     id,
                //     briefingid
                // // } = req.body;


                let newStaff = await ModelStaffSign.create({
                    staffid: staff.staffid,
                    staffname: staff.staffname,
                    designation: staff.staffcategory,
                    category: briefing.category,
                    questions: briefing.questions,
                    briefingid: briefing._id,
                    briefingtitle: briefing.title
                })

            }));

            // let mb = await ModelBriefing.findById(newbriefing._id);
            // mb.noofsigned += allstaffs.length;
            // mb.save()
        }}

        let mb = await ModelStaffCategory.find({
            designation: value
        });
        if (mb.length > 0) {
            mb[0].totalstaff += 1
            await mb[0].save()
        }
    

    }

    res.json("success")

})

router.post('/updatestaffsign', async (req, res) => {
    let {
        key,
        value,
        id
    } = req.body;


    let staff = await ModelStaffSign.findById(id);
    if (staff) {
        staff[key] = value;
        staff.save()
    }

    res.json("success")

})

router.post('/updatestaffpassword', async (req, res) => {
    let {
        staffid,
        staffpassword,
        staffnewpassword
    } = req.body;

    let mb = await StaffModel.find({
        staffid: staffid,
        staffpassword: staffpassword
    });
    mb[0].staffpassword = staffnewpassword;
    await mb[0].save();

    res.json('success')

})

router.post('/addstaffcategory', async (req, res) => {
    let {
        noofbriefing,
        designation,
        totalstaff
    } = req.body;

    let newStaff = await ModelStaffCategory.create({
        noofbriefing,
        designation,
        totalstaff
    })

    res.json('sucess')
})


router.get('/view', async (req, res) => {
    let allstaffs = await ModelStaff.find().limit(20).sort({
        _id: -1
    });

    if (allstaffs.length > 0) {
        allstaffs = await Promise.all(allstaffs.map(async (staff) => {
            let allbriefing = await ModelBriefing.find({
                designation: staff.staffcategory
            }).sort({
                _id: -1
            })
            // const mostaff = {
            //     ...staff,
            //     briefingquantity: allbriefing.length
            // };
            const mostaff = staff.toObject()
            mostaff.briefingquantity = allbriefing.length
            return mostaff;
        }))

    }



    res.json(allstaffs)
})


router.get('/signnotsignstaff', async (req, res) => {


    let allbriefing = await ModelStaffSign.find({
        "status": "no-sign"
    }).limit(20).sort({
        _id: -1
    });
    res.json(allbriefing)
})

router.get('/allbriefing', async (req, res) => {
    let allbriefing = await ModelBriefing.find().sort({
        _id: -1
    }).select('_id title category designation')
    res.json(allbriefing)
})

router.get('/signnotsignstaffbyfilter', async (req, res) => {
    const {
        staffid,
        staffcategory,
        stafffetchlimit,
        briefingcategory,
        signstatus,
        briefingid
    } = req.query;
    const filter = {};

    if (staffid) {
        filter.staffid = staffid
    }
    if (staffcategory) {
        filter.designation = staffcategory
    }

    if (briefingcategory) {
        filter.category = briefingcategory
    }

    if (signstatus) {
        filter.status = signstatus;
    }

    if (briefingid) {
        filter.briefingid = briefingid;
    }


    let allbriefing = await ModelStaffSign.find(filter).limit(stafffetchlimit).sort({
        _id: -1
    });
    res.json(allbriefing)
})



router.post('/viewbyfilter', async (req, res) => {
    const {
        staffname,
        staffid,
        staffcategory,
        stafffetchlimit,
        shift
    } = req.body;


    const filter = {};
    if (staffname) {
        filter.staffname = staffname;
    }

    if (staffid) {
        filter.staffid = staffid;
    }

    if (staffcategory) {
        filter.staffcategory = staffcategory;
    }

    if (shift) {
        filter.shift = shift;
    }




    let allstaffs = await ModelStaff.find(filter).limit(parseInt(stafffetchlimit)).sort({
        _id: -1
    });

    if (allstaffs.length > 0) {
        allstaffs = await Promise.all(allstaffs.map(async (staff) => {
            let allbriefing = await ModelBriefing.find({
                designation: staff.staffcategory
            }).sort({
                _id: -1
            })
            // const mostaff = {
            //     ...staff,
            //     briefingquantity: allbriefing.length
            // };
            const mostaff = staff.toObject()
            mostaff.briefingquantity = allbriefing.length
            return mostaff;
        }))

    }


    res.json(allstaffs)
})

router.post('/addstaffsign', async (req, res) => {
    let {
        staffid,
        staffname,
        designation,
        category,
        questions,
        id,
        briefingid
    } = req.body;

    // let newStaff = await ModelStaffSign.create({
    //     staffid,
    //     staffname,
    //     designation,
    //     category,
    //     questions,
    //     briefingid
    // })


    let Modelstaffs = await ModelStaffSign.find({
        briefingid: briefingid,
        staffid: staffid
    })
    if (Modelstaffs.length > 0) {
        Modelstaffs[0].status = "sign"
        await Modelstaffs[0].save()
    }

    let staff = await ModelStaff.find({
        staffid: staffid
    });
    staff[0].totalbriefingsign += 1
    await staff[0].save()


    // let mb = await ModelBriefing.findById(id);
    // mb.noofsigned +=1
    // mb.save()
    res.json('sucess')
})



router.post('/staffallowaccess', async (req, res) => {
    let {
        staffid,
        staffpassword
    } = req.body;

    let filter = {
        staffid,
        staffpassword
    }

    let query = await ModelStaff.find(filter);
    res.json(query)
})

module.exports = router;


router.post('/adminallowaccess', async (req, res) => {
    let {
        staffid,
        staffpassword
    } = req.body;

    let filter = {
        staffid,
        staffpassword,
        controlpanelaccess: true
    }

    let query = await ModelStaff.find(filter);
    res.json(query)
})

module.exports = router;