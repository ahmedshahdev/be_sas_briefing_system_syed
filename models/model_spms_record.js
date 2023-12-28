const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const SpmsRecordScheme = new Schema({
    staffid: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'stafflist'
    },
    area: {
        type: String,
        required: false
    },
    destination: {
        type: String,
        required: false
    },
    flightno: {
        type: String,
        required: false
    },
    recordtype: {
        type: String,
        required: false
    },
    reportedby: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'stafflist'
    },
    meetingdone: {
        type: String,
        required: false,
        default: 'not-yet'
    },
    meetingwith: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'stafflist',
    },
    meetingconclusion: {
        type: String,
        required: false,
        default: ''
    },
    meetingdate: {
        type: Date, // Date field for the creation date
        required: false, // You can change this to false if it's optional
        default: Date.now // Set a default value to the current date/time
    },

    comments: {
        type: String,
        required: false
    },
 
    createdDate: {
        type: Date, // Date field for the creation date
        required: false, // You can change this to false if it's optional
        default: Date.now // Set a default value to the current date/time
    },
    createdTime: {
        type: String, // String field for the creation time (you can use a different data type if needed)
        required: false, // You can change this to false if it's optional
        default: new Date().toLocaleTimeString() // Set a default value to the current time
    },
    attachments: {
        type: Schema.Types.Mixed, // Use Mixed data type for flexibility
        required: false,
        default:[]
    },
 

});

const SpmsRecordModel = mongoose.model('spmsrecord', SpmsRecordScheme);
// SpmsRecordModel.createIndexes();
module.exports = SpmsRecordModel;