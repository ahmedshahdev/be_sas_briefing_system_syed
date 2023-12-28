const express = require('express');
const router = express.Router();

const ModelBriefing = require('../models/model_briefing')
const ModelStaffCategory = require('../models/model_staff_category')
const ModelStaff = require('../models/model_staff')
const ModelStaffSign = require('../models/model_staff_sign')
const ModelLog = require('../models/model_logs')


router.post('/create', async (req, res) => {

    let {
        title,
        designation,
        category,
        stafftype,
        questions,
        content,
        attachments,
        customDesignation,
        initialBlockTimer,
        logby
    } = req.body;
    initialBlockTimer = initialBlockTimer == null ? 30 : initialBlockTimer


    // console.log(logby);

    // res.end();
    // return false;
 
    if (designation === "custom") {


        const alldesignations = customDesignation;



        await Promise.all(alldesignations.map(async (des) => {
            // Inside this callback, you can use await safely
            const newbriefing = await ModelBriefing.create({
                title,
                designation: des,
                category,
                stafftype,
                questions,
                content,
                attachments,
                initialBlockTimer
            });

            let allstaffs = await ModelStaff.find({
                staffcategory: des
            })
            if (allstaffs.length > 0) {
                await Promise.all(allstaffs.map(async (staff) => {

                    let newStaff = await ModelStaffSign.create({
                        staffid: staff.staffid,
                        staffname: staff.staffname,
                        designation: staff.staffcategory,
                        category: category,
                        questions: questions,
                        briefingtitle: newbriefing.title,
                        briefingid: newbriefing._id,
                    })

                }));

                let mb = await ModelBriefing.findById(newbriefing._id);
                mb.noofsigned += allstaffs.length;
                mb.save()
            }


        }));

        await Promise.all(alldesignations.map(async (des) => {
            let mb = await ModelStaffCategory.find({
                designation: designation
            });
            if (mb.length > 0) {
                mb[0].noofbriefing += 1
                await mb[0].save()
            }
        }));

        const newLog = await ModelLog.create({
            logtitle: 'Create New briefing',
            logcategory: 'Briefing',
            logby:logby
        });


    } else if (designation != 'all') {
        let newbriefing = await ModelBriefing.create({
            title,
            designation,
            category,
            stafftype,
            questions,
            content,
            attachments,
            initialBlockTimer
        });

        let mb = await ModelStaffCategory.find({
            designation: designation
        });
        if (mb.length > 0) {
            mb[0].noofbriefing += 1
            await mb[0].save()
        }

        let allstaffs = await ModelStaff.find({
            staffcategory: designation
        })
        if (allstaffs.length > 0) {
            await Promise.all(allstaffs.map(async (staff) => {
                // let {
                //     staffid,
                //     staffname,
                //     designation,
                //     category,
                //     questions,
                //     id,
                //     briefingid
                // } = req.body;


                let newStaff = await ModelStaffSign.create({
                    staffid: staff.staffid,
                    staffname: staff.staffname,
                    designation: staff.staffcategory,
                    category: category,
                    questions: questions,
                    briefingtitle: newbriefing.title,
                    briefingid: newbriefing._id,
                })

            }));

            let mb = await ModelBriefing.findById(newbriefing._id);
            mb.noofsigned += allstaffs.length;
            mb.save()
        }

        const newLog = await ModelLog.create({
            logtitle: 'Create New briefing',
            logcategory: 'Briefing',
            logby:logby
        });

    } else {
        const staffCategories = await ModelStaffCategory.find({}, {
            designation: 1
        });
        if (staffCategories.length > 0) {

            const alldesignations = staffCategories.map(category => category.designation);

            await Promise.all(alldesignations.map(async (des) => {
                // Inside this callback, you can use await safely
                const newbriefing = await ModelBriefing.create({
                    title,
                    designation: des,
                    category,
                    stafftype,
                    questions,
                    content,
                    attachments,
                    initialBlockTimer
                });

                let allstaffs = await ModelStaff.find({
                    staffcategory: des
                })
                if (allstaffs.length > 0) {
                    await Promise.all(allstaffs.map(async (staff) => {

                        let newStaff = await ModelStaffSign.create({
                            staffid: staff.staffid,
                            staffname: staff.staffname,
                            designation: staff.staffcategory,
                            category: category,
                            questions: questions,
                            briefingtitle: newbriefing.title,
                            briefingid: newbriefing._id,
                        })

                    }));

                    let mb = await ModelBriefing.findById(newbriefing._id);
                    mb.noofsigned += allstaffs.length;
                    mb.save()
                }


            }));

            await Promise.all(alldesignations.map(async (des) => {
                let mb = await ModelStaffCategory.find({
                    designation: designation
                });
                if (mb.length > 0) {
                    mb[0].noofbriefing += 1
                    await mb[0].save()
                }
            }));

        }

        const newLog = await ModelLog.create({
            logtitle: 'Create New briefing',
            logcategory: 'Briefing',
            logby:logby
        });

    }

    res.json('success')
})

router.get('/view', async (req, res) => {
    let allbriefing = await ModelBriefing.find().sort({
        _id: -1
    }).limit(20)
    res.json(allbriefing)
})

router.get('/viewforsummary', async (req, res) => {
    let allbriefing = await ModelBriefing.find().sort({
        _id: -1
    }).limit(10).select('category title designation noofsigned')

    const allbriefingtranformed = [
        ["BTitle", "Total", "Sign", "Not Sign"],
    ]

    for (const doc of allbriefing) {
        let btitle = doc.title
        let category = doc.category;
        // let noOfSigned = doc.noofsigned;
        let designation = doc.designation;
        let notSigned = 0;


        let mb = await ModelStaffCategory.find({
            designation: designation
        }, {
            totalstaff: 1
        });

        totalstaff = mb[0]['totalstaff']

        let Modelstaffs = await ModelStaffSign.find({
            briefingid: doc._id,
            status: 'sign'
        })
        let noOfSigned = Modelstaffs.length


        // noOfSigned == 0  ? 0.05 : noOfSigned


        // Push the data as an array to the transformed data
        allbriefingtranformed.push([`${category} - ${designation} - ${totalstaff} - ${btitle} `, totalstaff, noOfSigned == 0 ? 0.05 : noOfSigned, totalstaff = totalstaff - noOfSigned == 0 ? 0.05 : totalstaff - noOfSigned]);
    }



    const data = {
        allbriefing,
        allbriefingtranformed
    }
    res.json(data)
})

router.get('/chartbriefingquantity', async (req, res) => {
    const staffCategories = await ModelStaffCategory.find({}, {
        designation: 1
    });
    if (staffCategories.length > 0) {
        const alldesignations = staffCategories.map(category => category.designation);
        // console.log(alldesignations)
        await Promise.all(alldesignations.map(async (des) => {
            const briefings = await ModelBriefing.find({
                designation
            })
         
        }));
    }

    res.json([])

})

router.get('/viewforsummaryfilter', async (req, res) => {
    let {
        designation,
        briefinglimit,
        category,
        startdate,
        enddate
    } = req.query;

    const filter = {};
    if (designation) {
        filter.designation = designation
    }
    if (category) {
        filter.category = category
    }
    let daterange = {
        '$gte': '',
        '$lte': ''
    };
    if (startdate) {
        startdate = new Date(startdate).toISOString()
        daterange['$gte'] = startdate;
    }

    if (enddate) {
        enddate = new Date(enddate).toISOString()
        daterange['$lte'] = enddate;
    }

    let modifyfilter;
    if (daterange['$gte'] == '') {
        modifyfilter = {
            ...filter
        };
    } else if (daterange['$lte'] == '') {
        modifyfilter = {
            ...filter
        };
    } else {
        modifyfilter = {
            ...filter,
            createdDate: daterange
        };
    }

    let allbriefing = await ModelBriefing.find(modifyfilter).sort({
        _id: -1
    }).limit(briefinglimit).select('category title designation noofsigned')

    const allbriefingtranformed = [
        ["BTitle", "Total", "Sign", "Not Sign"],
    ]

    for (const doc of allbriefing) {
        const btitle = doc.title
        const category = doc.category;
        // const noOfSigned = doc.noofsigned;
        const designation = doc.designation;
        let notSigned = 0;

        let mb = await ModelStaffCategory.find({
            designation: designation
        }, {
            totalstaff: 1
        });

        totalstaff = mb[0]['totalstaff']


        let Modelstaffs = await ModelStaffSign.find({
            briefingid: doc._id,
            status: 'sign'
        })
        let noOfSigned = Modelstaffs.length


        // noOfSigned == 0  ? 0.05 : noOfSigned


        // Push the data as an array to the transformed data
        allbriefingtranformed.push([`${category} - ${designation} - ${totalstaff} - ${btitle} `, totalstaff, noOfSigned == 0 ? 0.05 : noOfSigned, totalstaff = totalstaff - noOfSigned == 0 ? 0.05 : totalstaff - noOfSigned]);



        // Push the data as an array to the transformed data
        // allbriefingtranformed.push([`${category} - ${designation} - ${totalstaff} - ${btitle} `, totalstaff, noOfSigned, totalstaff - noOfSigned]);
        // allbriefingtranformed.push([`${category} - ${designation} - ${totalstaff} - ${btitle} `, totalstaff, noOfSigned == 0  ? 0.05 : noOfSigned, totalstaff = totalstaff - noOfSigned == 0  ? 0.05 : totalstaff - noOfSigned]);
    }



    const data = {
        allbriefing,
        allbriefingtranformed
    }
    res.json(data)
})

router.get('/viewbyfilter', async (req, res) => {
    let {
        designation,
        briefinglimit,
        category,
        startdate,
        enddate
    } = req.query;

    const filter = {};
    if (designation) {
        filter.designation = designation
    }
    if (category) {
        filter.category = category
    }

    let daterange = {
        '$gte': '',
        '$lte': ''
    };
    if (startdate) {
        startdate = new Date(startdate).toISOString()
        daterange['$gte'] = startdate;
    }

    if (enddate) {
        enddate = new Date(enddate).toISOString()
        daterange['$lte'] = enddate;
    }

    let modifyfilter;
    if (daterange['$gte'] == '') {
        modifyfilter = {
            ...filter
        };
    } else if (daterange['$lte'] == '') {
        modifyfilter = {
            ...filter
        };
    } else {
        modifyfilter = {
            ...filter,
            createdDate: daterange
        };
    }

    let allbriefing = await ModelBriefing.find(modifyfilter).sort({
        _id: -1
    }).limit(parseInt(briefinglimit));
    res.json(allbriefing)
})

router.get('/viewbyfiltersign', async (req, res) => {
    const {
        id
    } = req.query;
    // const filter = {};
    // if (id) {
    //     filter.id = id
    // }
    let allbriefing = await ModelBriefing.findById(id)
    res.json(allbriefing)
})
router.get('/briefingstaffview', async (req, res) => {
    const {
        designation,
        staffid
    } = req.query;
    const filter = {};
    if (designation) {
        filter.designation = designation
    }



    let allbriefing = await ModelBriefing.find(filter).sort({
        _id: -1
    })



    allbriefing = await Promise.all(allbriefing.map(async (briefing) => {
        
        const sss = await ModelStaffSign.find({briefingid:briefing._id, staffid: staffid})
        // console.log(sss[0].status)
        
        briefing['status'] = await sss[0]['status']
        briefing['assign'] = await sss[0]['assign']
   
        // console.log()
        return briefing;
    }))
    // console.log(allbriefing)

    res.json(allbriefing)
})

router.get('/briefingstaffviewbyfilter', async (req, res) => {
    const {
        designation,
        briefinglimit,
        category,
        staffid
    } = req.query;

    const filter = {};
    if (designation) {
        filter.designation = designation
    }
    if (category) {
        filter.category = category
    }

    let allbriefing = await ModelBriefing.find(filter).limit(parseInt(briefinglimit)).sort({
        _id: -1
    })


    allbriefing = await Promise.all(allbriefing.map(async (briefing) => {
        
        const sss = await ModelStaffSign.find({briefingid:briefing._id, staffid: staffid})
        // console.log(sss[0].status)
        
        briefing['status'] = await sss[0]['status']
        briefing['assign'] = await sss[0]['assign']
        
        // console.log()
        return briefing;
    }))

    res.json(allbriefing)
})

module.exports = router;