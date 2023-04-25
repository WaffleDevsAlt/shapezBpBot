require('dotenv').config()
import DiscordJS, { Intents, MessageEmbed } from 'discord.js'
import { unlink, existsSync } from 'node:fs';
import fetch from 'node-fetch';

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});
const { prefix, rustBpUnpackerPath, imagePath, whitelistedRolesIds, whitelistedUserIds, whitelistRolesEnabled, whitelistUsersEnabled } = require("./config.json")

client.once("ready", () => {
    console.log(`Logged in as ${client.user!.tag}!`)
});

client.on("messageCreate", async message => {
    try {
        if (message.author.bot) return;

        const isWhitelistedRole = message.member!.roles.cache.some(role => whitelistedRolesIds.includes(role.id));
        const isWhitelistedUser = whitelistedUserIds.includes(message.member!.id)
        if ((whitelistRolesEnabled && !isWhitelistedRole) || (whitelistUsersEnabled && !isWhitelistedUser)) {
            return;
        }


        if (message.content.includes("SHAPEZ2-1-") && message.content.includes("$") && !message.content.startsWith(prefix)) {
            let BPString = message.content.split("SHAPEZ2-1-")
            console.log(BPString)
            BPString = BPString[1].split("$")
            parseAndSendBpImage(message, `SHAPEZ2-1-${BPString[0]}$`)
        }
        else {
            if (message.content.trim() === "!bpread") {
                const file = message.attachments.first()?.url;
                if (!file) return console.log('No attached file found');
                try {
                    const response = await fetch(file);
                    if (!response.ok) return;

                    const text = await response.text();

                    if (text.startsWith("SHAPEZ2-1-") && text.endsWith("$")) {
                        parseAndSendBpImage(message, text);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
    catch (e) { console.log(e) }
});

function parseAndSendBpImage(message: DiscordJS.Message, BPString: string) {
    let start = Date.now();
    let cp = require('child_process');
    let child = cp.spawn(`${rustBpUnpackerPath}/shapez2_blueprint_renderer.exe`, []);
    let error = false;

    child.stdin.write(BPString);

    child.stdout.on('data', function (data: string) {
        console.log('stdout: ' + data);
    });
    child.stdin.end();
    child.stderr.on('data', (data: any) => {
        error = true;
    });
    child.stdout.on('close', () => {
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

client.login(process.env.token);