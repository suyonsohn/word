const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Create Schema
const PromiseSchema = new Schema({
    blockchainId: {
        type: Number
    },
    firstName: {
        type: String
    },
    LastName: {
        type: String
    },
    partyName: {
        type: String
    },
    electionType: {
        type: String
    },
    promise: {
        type: String
    }
})

const Promise = mongoose.model("promises", PromiseSchema)

module.exports = Promise 