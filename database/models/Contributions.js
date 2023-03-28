const mongoose = require("mongoose");

const ContributionSchema = new mongoose.Schema({
    Date: {
        type:Date,
        required:true
    },
    DataType: {
        type:String,
        enum: ['ecoli','devicedata','satellite'],
        required:true
    },
    paymentId: {
        type:Number,
        required:false,

    },
    email:{
        type:String,
        required:true,
    }
   
})

const Contributions = mongoose.model('Contributions',ContributionSchema);

module.exports = Contributions