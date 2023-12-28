const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const StaffCategorySchema = new Schema({
    designation: {
        type: String,
        required: false
    },
    noofbriefing: {
        type:Number,
        required: false,
        default: 0
    },
    totalstaff: {
        type: Number,
        required: false,
        default: 0
    }

});

const StaffCategoryModel = mongoose.model('staffcategory', StaffCategorySchema);
// BriefingModel.createIndexes();
module.exports = StaffCategoryModel;