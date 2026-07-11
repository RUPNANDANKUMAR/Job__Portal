const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ApplicationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Applied"
    }
});

let Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;