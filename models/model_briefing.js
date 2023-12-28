const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const BriefingSchema = new Schema({
    title: {
        type: String,
        required: false
    },
    designation: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    stafftype: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: false
    },
    questions: {
        type: Schema.Types.Mixed, // Use Mixed data type for flexibility
        required: false
    },
    noofsigned: {
        type: Number,
        required: false,
        default: 0
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
    status: {
        type: String,
        required: false,
        default: 'no-sign'
    },
    assign: {
        type: String,
        required: false,
        default: 'assign'
    },
    initialBlockTimer: {
        type: Number,
        required: false,
        default: 30
    }

});

const BriefingModel = mongoose.model('briefing', BriefingSchema);
// BriefingModel.createIndexes();
module.exports = BriefingModel;