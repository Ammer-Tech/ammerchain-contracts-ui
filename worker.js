// SSO Token Daemon

import { parentPort } from 'worker_threads'
import 'dotenv/config'
import fetch from 'node-fetch' 

let credentials = `grant_type="password" 
client_id=${process.env.DEMO_CLIENT_ID} 
client_secret=${process.env.DEMO_CLIENT_SECRET} 
username=${process.env.DEMO_USERNAME} password=${process.env.DEMO_PASSWORD}`

async function fetchAccessToken() {
    while (true) {
        let res = await fetch(process.env.AUTH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: credentials
        })
        let json = await res.json() 
        parentPort.postMessage(json['access_token'])
        console.log(json)
        console.log(process.env.AUTH_API_URL)
        console.log(credentials)
        await new Promise(res => setTimeout(res, 60000)) // 1 minute sleep
    }
}

fetchAccessToken()