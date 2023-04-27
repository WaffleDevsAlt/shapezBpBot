require('dotenv').config()
import DiscordJS, { BufferResolvable, Intents, MessageEmbed } from 'discord.js'
import { unlink, existsSync, writeFile } from 'node:fs';
import fetch from 'node-fetch';

import * as util from "util";
import * as zlib from "zlib";

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});
const { prefix, rustBpUnpackerPath, imagePath, txtPath, whitelistedRolesIds, whitelistedUserIds, whitelistRolesEnabled, whitelistUsersEnabled } = require("./config.json");

client.once("ready", () => {
    console.log(`Logged in as ${client.user!.tag}!`)
});

client.on("messageCreate", async message => {
    try {
        if (message.author.bot) return;

        //Whitelist
        const isWhitelistedRole = message.member!.roles.cache.some(role => whitelistedRolesIds.includes(role.id));
        const isWhitelistedUser = whitelistedUserIds.includes(message.member!.id)
        if ((whitelistRolesEnabled && !isWhitelistedRole) || (whitelistUsersEnabled && !isWhitelistedUser)) {
            return;
        }

        //Decode when message has string

        if (message.content.includes("SHAPEZ2-1-") && message.content.includes("$") && !message.content.startsWith(prefix)) {
            let BPString = message.content.split("SHAPEZ2-1-")
            console.log(BPString)
            BPString = BPString[1].split("$")
            parseAndSendBpImage(message, `SHAPEZ2-1-${BPString[0]}$`)
            return;
        }

        //define the command and any args
        // !command arg1 arg2 arg3

        const command = message.content.split(' ')[0].slice(1)
        const args = message.content.slice(command.length+2).split(' ')

        const file = message.attachments.first()?.url;
        let fileText;
        try {
            if(file) {
                const response = await fetch(file);
                if (!response.ok) return;
        
                fileText = await response.text();
            }
        } catch (error) {
            console.log(error)
        }

        //commands
        if (command === "bpread") {
            if(!fileText && !args[0]) return;
            parseAndSendBpImage(message, fileText || args[0]);
        }
        else if (command === "deserialize") {
            if(!fileText && !args[0]) return;
            await deserialize(message, fileText || args[0]);
        }

    }
    catch (e) { console.log(e) }
});

//Old version
function OLDVERSIONparseAndSendBpImage(message: DiscordJS.Message, BPString: string) {
    let start = Date.now();
    let cp = require('child_process');
    console.log(`--out-file ${imagePath}`);
    let child = cp.spawn(`${rustBpUnpackerPath}/shapez2_blueprint_renderer.exe`, [`--out-file ${imagePath}`]);
    let error = false;

    child.stdin.write(BPString);

    child.stdout.on('data', function (data: string) {
        if(data.length > 200) console.log('stdout: ' + data);
    });

    child.stdin.end();

    child.stderr.on('data', (data: any) => {
        error = true;
        let buf = Buffer.from(data);

        console.error(buf.toString());
    });
    child.stdout.on('close', (code: any) => {
        console.log(`Bp extractor closed with code ${code}`)
        if (!error && existsSync(imagePath)) {
            message.channel.send({ files: [imagePath] }).then(() => {
                unlink(imagePath, (err) => {
                    if (err) throw err;
                    console.log('BP image removed.');
                });
            })
            let end = Date.now();
            console.log(`${end - start}ms to convert.`)
        }
    });

}
const RENDER_EXECUTABLE = `${rustBpUnpackerPath}/shapez2_blueprint_renderer.exe`;
const RENDER_TIMEOUT = 30000;

function runRenderBlueprint(dataString: string) {
    return new Promise((resolve, reject) => {
        let cp = require('child_process');
        const child_process = cp.spawn(RENDER_EXECUTABLE, [], {
            "stdio": ["pipe", "ignore", "inherit"],
            "timeout": RENDER_TIMEOUT,
        });

        let outputBuffer: Buffer;

        child_process.on("data", (data: any, chunk: any) => {
            console.log(data);
            console.log(chunk);
            //outputBuffer = Buffer.concat([outputBuffer, data])
            if(data.length > 200) outputBuffer = new Buffer(data, "binary");
        });

        child_process.on("close", (code: Number) => {
            if (code !== 0) {
                return reject(new Error(`Renderer exited with non-zero exit ${code}`));
            }
            console.log(outputBuffer)
            
            resolve(outputBuffer);
        });

        child_process.on("error", (error: any) => {
            reject(new Error("Failed to start child process for renderer: " + error));
        });

        child_process.stdin.write(dataString);
        child_process.stdin.end();
    });
}


function parseAndSendBpImage(message: DiscordJS.Message, BPString: string) {
    let start = Date.now();

    runRenderBlueprint(BPString)
        .then((png_data) => {

            console.log(`${Date.now() - start}ms to convert.`);
            //console.log(Buffer.from(png_data, "binary").toString())
            // message.channel.send({ files: [png_data] }).then(() => {
            //     unlink(imagePath, (err) => {
            //         if (err) throw err;
            //         console.log('BP image removed.');
            //     });
            // })
        })
        .catch(error => {
            // idk, do something with it?
            throw error;
        });
}

const gunzip = util.promisify(zlib.gunzip);

const VERSION = "1";

const PREFIX = "SHAPEZ2";
const DIVIDER = "-";
const SUFFIX = "$";

async function deserialize(message: DiscordJS.Message, serialized: string) {
    console.log(serialized)
    if (!serialized.endsWith(SUFFIX)) {
        throw new TypeError(`Blueprint has bad suffix, expected ${SUFFIX}`);
    }
    const [prefix, version, content, ...rest] = serialized.slice(0, -SUFFIX.length).split(DIVIDER);
    if (content === undefined) {
        throw new TypeError(`Blueprint has too few data entries`);
    }
    if (rest.length !== 0) {
        throw new TypeError(`Blueprint has excess data entries`);
    }
    if (prefix !== PREFIX) {
        throw new TypeError(`Blueprint has bad prefix, expected ${PREFIX}`);
    }
    if (version !== VERSION) {
        throw new TypeError(`Blueprint has bad version, expected ${VERSION}`);
    }
    const parsed = JSON.parse(new util.TextDecoder().decode(await gunzip(Buffer.from(content, "base64"))));
    const stringVersion = JSON.stringify(parsed, null, 4);

            
    writeFile(txtPath, stringVersion, (err) => { 
        if (err) throw err; 
        console.log("The file was succesfully saved!"); 
    });  
    message.channel.send({ files: [txtPath] }).then(() => {
        unlink(txtPath, (err) => {
            if (err) throw err;
            console.log('BP txt removed.');
            message.delete();
        });
    })
}

client.login(process.env.token);