// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

const serialize = require('form-serialize')

const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({ host: 'localhost', port: '5001', protocol: 'http' })

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

        $('#show-post-promise-modal').click(function (e) {
            $('#post-promise').modal('show')
            e.preventDefault()
        })

        $('#add-promise-to-campaign').submit((e) => {
            const form = document.querySelector('#add-promise-to-campaign')
            const obj = serialize(form, { hash: true })
            console.log(obj)
            savePromise(obj)
            e.preventDefault()
        })
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

        let promiseContainer = $('<div>')
        promiseContainer.addClass('col-sm-3 text-center col-margin-bottom-left-right-3 promise border border-info')
        promiseContainer.append(`<div class='title'>${p[1]} ${p[2]} | ${p[3]}</div>`)
        promiseContainer.append(`<hr><div class='title'>${p[4]}</div>`)

        ipfs.cat(p[5]).then((file) => {
            let promiseHash = file.toString()
            promiseContainer.append(`<hr><div class='promise-text'>${promiseHash}</div>`)
        })

        $('#promise-component').append(promiseContainer)
    })
}

const savePromise = (promise) => {
    addPromiseTextToIpfs(promise["promise"]).then((textHash) => {
        Campaign.deployed().then((f) => {
            return f.addPromiseToCampaign(
                promise["candidate-first-name"],
                promise["candidate-last-name"],
                promise["party-name"],
                promise["election-type"],
                textHash,
                {
                    from: web3.eth.accounts[0], gas: 4700000
                }
            )
        }).then((p) => {
            console.log("Saved your promise!")
            console.log(p)
        })
    })
}

const addPromiseTextToIpfs = (promiseText) => {
    return new Promise((resolve, reject) => {
        const textBuffer = Buffer.from(promiseText, 'utf-8')
        ipfs.add(textBuffer)
            .then((response) => {
                console.log(response)
                resolve(response[0].hash)
            })
            .catch((err) => {
                console.log(err)
                reject.err
            })
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
