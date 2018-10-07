const campaignArtifacts = require('./build/contracts/Campaign.json')
const contract = require('truffle-contract')
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const Campaign = contract(campaignArtifacts)
Campaign.setProvider(provider)

const express = require("express")
const mongoose = require("mongoose")

const Promise = require('./models/Promise')

const app = express()

// DB config
const db = require("./config/keys").mongoURI

// Connect to MongoDB
mongoose
    .connect(db)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err))

newPromiseListener()

function newPromiseListener() {
    var promiseEvent

    Campaign.deployed().then(function (i) {
        promiseEvent = i.NewPromise({ fromBlock: 0, toBlock: 'latest' })
        promiseEvent.watch(function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            console.log(result.args)
            savePromise(result.args)
        })
    })
}


const savePromise = (promise) => {
    Promise.findOne({ blockchainId: promise._id.toNumber() }).then(p => {
        if (p) {
            return
        }
        const newPromise = new Promise({
            blockchainId: promise._id.toNumber(),
            firstName: promise._candidateFirstName,
            LastName: promise._candidateLastName,
            partyName: promise._party,
            electionType: promise._electionType,
            promise: promise._promiseDescHash
        })

        newPromise
            .save()
            .then(p => console.log(p))
            .catch(err => console.log(err))

    })
}

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server running on port ${port}`))