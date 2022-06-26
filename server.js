import express from 'express'
import solc from 'solc'
import fetch from 'node-fetch'
import 'dotenv/config'
import * as fs from 'fs'
import Client from 'ssh2-sftp-client'
import fileUpload from 'express-fileupload'

const app = express()
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json())
app.use('/', express.static('public'))
app.use(fileUpload())

app.post('/compile', (req, res) => {
  const findImports = (path) => {
    const baseDir = './public/contracts/'
    return {
      contents: fs.readFileSync(baseDir + path).toString()
    }
  }

  const contractCode = req.body.code

  const input = {
    language: 'Solidity',
    sources: {
      'contract.sol': {
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
  }

  const output = JSON.parse(
    solc.compile(JSON.stringify(input), {
      import: findImports
    })
  )
  console.log(output)
  console.log(JSON.stringify(output.contracts['contract.sol'].Token.abi))
  res.json({
    bytecode: output.contracts['contract.sol'].Token.evm.bytecode.object,
    interface: output.contracts['contract.sol'].Token.abi
  })
})

// Create or update asset in trustody's system
app.post('/trustody', (req, res) => {
  fetch(`http://127.0.0.1:8000/ammerchain/contract/${req.body.address}`, { method: 'POST' })
    .then((response) => {
      return response.json()
    })
    .then((asset) => {
      fetch('http://127.0.0.1:8000/ammerchain/asset', {
        method: 'POST',
        body: JSON.stringify({
          asset: JSON.stringify(asset),
          environment: req.body.environment
        })
      })
        .then((response) => {
          if (response.status === 200) {
            res.status(200).send()
          } else {
            console.log(response.text())
            res.status(500).send()
          }
        })
    })
    .catch((error) => {
      console.log(error.message)
      res.status(500).send()
    })
})

// Upload images and token metadata to static.trustody.io
app.post('/upload', (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.')
  }
  const file = req.files.file

  const sftp = new Client()
  const config = {
    host: process.env.STORAGE_HOST,
    port: '22',
    username: process.env.STORAGE_USERNAME,
    password: process.env.STORAGE_PASSWORD
  }

  sftp
    .connect(config)
    .then(() => {
      // ex. req.body.dir = 'nft/{collectionName}'
      return sftp.exists('/media/' + req.body.dir)
    })
    .then((exists) => {
      if (exists !== 'd') {
        return sftp.mkdir('/media/' + req.body.dir)
      }
    })
    .then(() => {
      return sftp.put(
        file.data,
        '/media/' + req.body.dir + '/' + req.body.name
      )
    })
    .then(() => {
      sftp.end()
      return res.status(200).send()
    })
    .catch((err) => {
      console.log(err.message)
      return res.status(500).send(err.message)
    })
})

app.listen(8080, () => {
  console.log('Server started at http://localhost:8080')
})
