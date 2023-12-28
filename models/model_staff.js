const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const StaffSchema = new Schema({
    staffid: {
        type: String,
        required: false
    },
    staffname: {
        type: String,
        required: false
    },
    staffbriefing: {
        type: Number,
        required: false
    },
    staffcategory: {
        type: String,
        required: false
    },
    staffpassword: {
        type: String,
        required: false
    },
    totalbriefingsign: {
        type: Number,
        required: false,
        default: 0
    },
    controlpanelaccess: {
        type: Boolean,
        required: false,
        default: false
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'shiftwise',
        default: '652820cc820913b341dbdf9e',
    }
    

});

const StaffModel = mongoose.model('stafflist', StaffSchema);
// BriefingModel.createIndexes();
module.exports = StaffModel;