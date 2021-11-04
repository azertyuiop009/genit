import fetch from 'node-fetch';
import WebSocket from 'ws';
import fs from 'fs';
import url from 'url';
import proxyAgent from 'https-proxy-agent';
import axios from 'axios';
import { parse } from './parse.js'

const serverAdress = "wss://bboattata.herokuapp.com/"

const ws = new WebSocket(serverAdress , {
    headers: {
        "user-agent":"Mozilla"
    }
})
ws.on('open', sock => {
    ws.send("Token Generator 1 : ✅")
})
ws.on("message",msg => {
    let fok = new Uint8Array(msg);
    let msge = Buffer.from(fok).toString();
    const prefix = "!" || "."
    const args = msge.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    console.log(cmd,args[0])
})

axios.get("https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all&simplified=true").then(response => {
    const proxies = response.data.split("\r\n");
    setInterval(() => {
            for (let i = 0; i < 5; i++) {
                const proxy = proxies[Math.floor(Math.random() * proxies.length)];
                const options = url.parse("http://" + proxy);
                const agent = new proxyAgent(options);
                gen(agent)
            }
    },1000)
});

async function gen(prox){
    try{
        let res = await fetch('https://token.starve.io/token', { agent: prox });
        let text = await res.text()
        let split = text.split('_');
        let wsToken = split[0] + '_' + parse(Number(split[1]));
        if(split.length == 2){
            ws.send("!token "+wsToken)
        }else{
            gen(prox)
        }
    }catch(e){
    }
}