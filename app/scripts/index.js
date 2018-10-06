// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
const campaignArtifacts = require('../../build/contracts/Campaign.json')

// Campaign is usable abstraction.
const Campaign = contract(campaignArtifacts)

const App = {
    start: function () {
        const self = this

        // Bootstrap the Campaign abstraction for Use.
        Campaign.setProvider(web3.currentProvider)

        console.log('working')

        renderCampaign()
    }
}

const renderCampaign = () => {
    let instance
    let totalCount

    return Campaign.deployed().then((i) => {
        instance = i
        return instance.promiseIndex.call().then((total) => {
            totalCount = total.toNumber()
            console.log(`TOTAL PROMISE COUNT: ${totalCount}`)
            for (let c = 1; c <= totalCount; c++) {
                renderPromise(instance, c)
            }
        })
    })
}

const renderPromise = (instance, index) => {
    instance.getPromise(index).then((p) => {
        console.log(p)
        $('#candidate-first-name').append(p[1])
        $('#candidate-last-name').append(p[2])
        $('#party-name').append(p[3])
        $('#election-type').append(p[4])
        $('#promise').append(p[5])
    })
}

window.App = App

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn(
            'Using web3 detected from external source.' +
            ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
            ' ensure you\'ve configured that source properly.' +
            ' If using MetaMask, see the following link.' +
            ' Feel free to delete this warning. :)' +
            ' http://truffleframework.com/tutorials/truffle-and-metamask'
        )
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider)
    } else {
        console.warn(
            'No web3 detected. Falling back to http://127.0.0.1:8545.' +
            ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
            ' Consider switching to Metamask for development.' +
            ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
        )
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
    }

    App.start()
})
