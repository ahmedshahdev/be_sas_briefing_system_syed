const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const ActionScheme = new Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'stafflist'
    },
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'spmsrecords'
    },
    recordsids: {
        type: Schema.Types.Mixed,
        required: false,
        default: []
    },
    actionwith: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'stafflist'
    },
    actionnote: {
        type: String,
        required: false
    },
    actionnotebyrecipient: {
        type: String,
        required: false
    },
    status: {
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
});

const ActionRecordModel = mongoose.model('actions', ActionScheme);
// ActionRecordModel.createIndexes();
module.exports = ActionRecordModel;