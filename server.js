import express from 'express'
import solc from 'solc'
import fetch from 'node-fetch'
import 'dotenv/config'
import { randomUUID } from 'crypto'
import {Worker} from 'worker_threads'

const app = express()
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use('/', express.static('public'))

app.post('/compile', (req, res) => {
    let contractCode = req.body.code

    var input = {
        language: 'Solidity',
        sources: {
            'coin.sol': {
                content: contractCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    let output = JSON.parse(solc.compile(JSON.stringify(input)));
    res.json({
        bytecode: output.contracts['coin.sol']['ERC20Token'].evm.bytecode.object,
        interface: output.contracts['coin.sol']['ERC20Token'].abi
    })
})

// app.post('/trustody', (req, res) => {
//     let apiUrl = process.env.DEMO_ASSET_API_URL
//     if (req.body.environment == 'production') {
//         apiUrl = process.env.PROD_ASSET_API_URL
//     }
//     asset = {
//         assetId: randomUUID(),
//         symbol: req.body.symbol,
//         fullName: req.body.name,
//         decimals: 18,
//         rootAsset: process.env.ROOT_ASSET,
//         contractAddress: req.body.address,
//         publicKeyType: "EC256K1",
//         visible: true,
//         codecType: "ERC20",
//         visibleDigits: 5,
//         eligibleForFree: false,
//         bid: 0,
//         ask: 0,
//         explorerUrl: 'https://ammer.network/tx/{linkedRawTransaction}'
//     }
//     fetch(apiUrl, {
//         method: "POST",
//         body: JSON.stringify(asset),
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": "Bearer " + trustodyAccessToken
//         },
//     })
// })

// let trustodyAccessToken
// const worker = new Worker('./worker.js')
// worker.on('message', (token) => {
//     trustodyAccessToken = token
// })

app.listen(8080, () => {
    console.log('Server Started at http://localhost:8080')
})