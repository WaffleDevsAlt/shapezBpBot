const fs = require("fs");
const fetch = require("node-fetch");
const config = require("./config.json");
const { MessageAttachment } = require('discord.js');

function log(client, content) {
    console.log(content)
    try {
        client.channels.cache.get(config.logsChannel).send(content +"⠀")
    } catch(err) {console.error(err)}
}

function writeData(file, content) {
    if(!file.endsWith(".wddb")) return;
    console.log(file,content)
    try {
        fs.writeFileSync(file, content);
        return true;
    } catch (err) {
        console.error(err);
        return err;
    }
}

function readData(file) {
    if(!file.endsWith(".wddb")) return;
    try {
        const data = fs.readFileSync(file, 'utf8');
        return data;
    } catch (err) {
        return;
    }
}

async function getMessageFile(message, textOnly) {
    const file = message.attachments.first()?.url;
    let fileData;
    try {
        if(!file) return;
        const response = await fetch(file);
        if (!response.ok) return;
        
        if(textOnly) fileData = await response.text();
        else fileData = response;
    } catch (error) {
        console.log(error)
    }

    return fileData;
}
//console.log(getUsersData('example'))
module.exports = { log, writeData, readData, getMessageFile };