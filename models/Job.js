const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let JobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    salary: {
        type: Number
    },
    location: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

let Job = mongoose.model("Job", JobSchema);

module.exports = Job;