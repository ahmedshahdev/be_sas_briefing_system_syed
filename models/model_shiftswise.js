const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const ShiftwiseSchema = new Schema({
    shiftlabel: {
        type: String,
        required: false
    },
    shiftadm: {
        type: String,
        required: false
    },
});

const ShiftwiseModel = mongoose.model('shiftwise', ShiftwiseSchema);
// BriefingModel.createIndexes();
module.exports = ShiftwiseModel;