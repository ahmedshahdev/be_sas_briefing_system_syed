const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const LogSchemas = new Schema({
    logtitle: {
        type: String,
        required: false
    },
    logcategory: {
        type: String,
        required: false
    },
    logby: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'stafflist'
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

const LogsModel = mongoose.model('Logs', LogSchemas);
// BriefingModel.createIndexes();
module.exports = LogsModel;