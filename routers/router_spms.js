const express = require('express');
const router = express.Router();

const ModelStaff = require('../models/model_staff');
const ModelSpmsRecord = require('../models/model_spms_record');
const ModelActions = require('../models/actions');

router.get('/getstafflist', async (req, res) => {
    let allstaffs = await ModelStaff.find().sort({
        _id: -1
    });
    res.json(allstaffs)
})

router.post('/addrecord', async (req, res) => {
    let {
        staffid,
        area,
        destination,
        flightno,
        recordtype,
        reportedby,
        comments,
        attachments,
    } = req.body;

    let newStaff = await ModelSpmsRecord.create({
        staffid,
        area,
        destination,
        flightno,
        recordtype,
        reportedby,
        comments,
        attachments,
    })

    res.json(req.body)
})

router.get('/viewrecord', async (req, res) => {
    try {
        // Fetch unique staff IDs
        const uniqueStaffIds = await ModelSpmsRecord.distinct('staffid');

        let defaultLimit = 10;
        // let currentLimit = 0;

        // Fetch records for each staff and sort by number of records in descending order
        const spmsrecords = [];
        for (const staffid of uniqueStaffIds) {
            const records = await ModelSpmsRecord.find({
                    staffid
                })
                .sort({
                    _id: -1
                }) // Sort by record ID in descending order
                .populate('staffid')
                .populate('reportedby')
                .populate('meetingwith')
            if (spmsrecords.length >= defaultLimit) {
                break;
            }
            spmsrecords.push(...records);

        }

        // Sort the overall result by the number of records each staff has (descending order)
        spmsrecords.sort((a, b) => {
            const countA = spmsrecords.filter(record => record.staffid === a.staffid).length;
            const countB = spmsrecords.filter(record => record.staffid === b.staffid).length;
            return countB - countA;
        });

        res.json(spmsrecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
})

router.post('/updaterecord', async (req, res) => {

    let {
        recordsids,
        meetingwith,
        meetingconclusion,
        staffid,
        actionwith,
        actionnote
    } = req.body;

    // console.log(recordsids)
    // req.end();
    // return false;


    try {
        // Use updateMany to update records with specified _id values
        const result = await ModelSpmsRecord.updateMany({
                _id: {
                    $in: recordsids
                }
            }, // Find records by _id in the list
            {
                $set: {
                    meetingdone: 'yes',
                    meetingwith: meetingwith,
                    meetingconclusion: meetingconclusion
                }
            }
        );

        let meeting = await ModelSpmsRecord.create({
            staffid,
            // area,
            // destination,
            // flightno,
            recordtype: 'meeting',
            // reportedby,
            // comments,
            // attachments,
            meetingdone: 'yes',
            meetingwith: meetingwith,
            meetingconclusion: meetingconclusion
        })


        if (actionwith != '') {
            // processing action here
            let newaction = await ModelActions.create({
                staff: staffid,
                meeting: meeting._id,
                recordsids: recordsids,
                actionwith: actionwith,
                actionnote: actionnote,
                actionnotebyrecipient: '',
                status: 'assigner-release'
            })
        }


    } catch (error) {
        console.error('Error updating records:', error);
    }

    res.json('success')
})


router.get('/viewrecordsaggregate', async (req, res) => {
    try {
        const result = await ModelSpmsRecord.aggregate([{
                $group: {
                    _id: {
                        staffid: '$staffid',
                        recordtype: '$recordtype',
                        meetingdone: '$meetingdone'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $match: {
                    $and: [{
                            $or: [{
                                    '_id.recordtype': 'ROD',
                                    count: {
                                        $gte: 1
                                    }
                                },
                                {
                                    '_id.recordtype': 'Interview Note',
                                    count: {
                                        $gte: 1
                                    }
                                }
                            ]
                        },
                        {
                            $or: [{
                                    '_id.meetingdone': 'not-yet'
                                },
                                {
                                    '_id.meetingdone': {
                                        $ne: 'yes'
                                    }
                                }
                            ]
                        }
                    ]
                    // '_id.meetingdone': { $ne: 'not-yet' }

                }
            },
            {
                $group: {
                    _id: '$_id.staffid',
                    recordTypes: {
                        $addToSet: '$_id.recordtype'
                    },
                    count: {
                        $sum: '$count'
                    }
                }
            },
            {
                $match: {
                    recordTypes: {
                        $all: ['ROD', 'Interview Note']
                    },
                    count: {
                        $gte: 2
                    }
                }
            },
            {
                $lookup: {
                    from: 'spmsrecords',
                    localField: '_id',
                    foreignField: 'staffid',
                    as: 'data'
                }
            },
            {
                $unwind: '$data'
            },
            {
                $match: {
                    'data.recordtype': {
                        $in: ['Interview Note', 'ROD']
                    }
                }
            },
            {
                $lookup: {
                    from: 'stafflists',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staffdetails'
                }
            },
            {
                $unwind: '$staffdetails'
            },

            {
                $project: {
                    _id: 1,
                    recordTypes: 1,
                    staffdetails: '$staffdetails',
                    count: 1,
                    data: {
                        _id: '$data._id',
                        staffid: '$data.staffid',
                        meetingdone: '$data.meetingdone',

                        area: '$data.area',
                        destination: '$data.destination',
                        flightno: '$data.flightno',
                        comments: '$data.comments',
                        recordtype: '$data.recordtype',
                        reportedby: '$data.reportedby',
                        createdDate: '$data.createdDate',
                        createdTime: '$data.createdTime',
                        attachments: '$data.attachments',

                        // Add more fields as needed
                    }
                }
            }
        ]);

        // const newData = [];

        // await Promise.all(result.map(async (data) => {
        //     newData.push({_id: data["_id"]})
        // }))

        const groupedData = await result.reduce((result, item) => {
            const id = item._id;

            if (!result[id]) {
                result[id] = {
                    _id: id,
                    records: [],
                    staffDetails: {}
                };
                result[id].staffDetails = item.staffdetails
            }

            result[id].records.push(item.data);

            return result;
        }, {});

        const groupedArray = Object.values(groupedData);

        //   console.log(groupedArray)

        res.json(groupedArray);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});


router.get('/viewrecordbyfilter', async (req, res) => {
    try {
        let {
            staffid,
            area,
            destination,
            flightno,
            limit,
            startdate,
            enddate,
            recordtype,
            reportedby
        } = req.query;

        const filter = {};

        if (staffid) {
            filter.staffid = staffid;
        }
        if (area) {
            filter.area = area;
        }
        if (destination) {
            filter.destination = destination;
        }
        if (flightno) {
            filter.flightno = flightno;
        }

        if (recordtype && recordtype.includes(',')) {
            filter.recordtype = {
                $in: recordtype.split(',')
            };
        } else if (recordtype && recordtype !== '') {
            filter.recordtype = recordtype;
        }

        if (reportedby) {
            filter.reportedby = reportedby;
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
        if (daterange['$gte'] === '' && daterange['$lte'] === '') {
            modifyfilter = {
                ...filter
            };
        } else {
            modifyfilter = {
                ...filter,
                createdDate: daterange
            };
        }

        // Fetch unique staff IDs for the given filter
        const uniqueStaffIds = await ModelSpmsRecord.distinct('staffid', modifyfilter);

        // Fetch records for each staff and sort them by the number of records in descending order
        const spmsrecords = [];
        for (const staffid of uniqueStaffIds) {
            const records = await ModelSpmsRecord.find({
                    ...modifyfilter,
                    staffid
                })
                .sort({
                    _id: -1
                }) // Sort by record ID in descending order
                .populate('staffid')
                .populate('reportedby')
                .populate('meetingwith')
                .limit(parseInt(limit));
            spmsrecords.push(...records);
        }

        // Sort the overall result by the number of records each staff has (descending order)
        spmsrecords.sort((a, b) => {
            const countA = spmsrecords.filter(record => record.staffid === a.staffid).length;
            const countB = spmsrecords.filter(record => record.staffid === b.staffid).length;
            return countB - countA;
        });

        res.json(spmsrecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});



router.post('/updaterecordspms', async (req, res) => {
    let {
        key,
        value,
        id
    } = req.body;


    let staff = await ModelSpmsRecord.findById(id);
    if (staff) {
        staff[key] = value;
        staff.save()
    }

    res.json("success")

})

module.exports = router;