const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const StaffSignSchema = new Schema({
    staffid: {
        type: String,
        required: false
    },
    briefingid: {
        type: String,
        required: false
    },
    briefingtitle: {
        type: String,
        required: false
    },
    staffname: {
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
    questions: {
        type: Schema.Types.Mixed, // Use Mixed data type for flexibility
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
    status: {
        type: String,
        required: false,
        default: 'no-sign'
    },
    assign: {
        type: String,
        required: false,
        default: 'assign'
    }

});

const StaffSignModel = mongoose.model('StaffSign', StaffSignSchema);
// BriefingModel.createIndexes();
module.exports = StaffSignModel;