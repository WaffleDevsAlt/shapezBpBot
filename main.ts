require('dotenv').config()
import DiscordJS, { Intents, MessageEmbed } from 'discord.js'
import { unlink } from 'node:fs';

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});
const {prefix, rustBpUnpackerPath, imagePath, whitelistedRolesIds, whitelistedUserIds} = require("./config.json")

client.once("ready", () => {
  console.log(`Logged in as ${client.user!.tag}!`)
});

client.on("messageCreate", async message => {
    try{
        if (message.author.bot) return;

        const isWhitelistedRole = message.member!.roles.cache.some(role => whitelistedRolesIds.includes(role.id));
        const isWhitelistedUser = whitelistedUserIds.includes(message.member!.id)
        if(!isWhitelistedRole || !isWhitelistedUser) return;

        if (!message.content.startsWith(prefix)){ 
            if (message.content.includes("SHAPEZ2-1-") && message.content.includes("$") && !message.content.startsWith(prefix)) {
                let BPString = message.content.split("SHAPEZ2-1-")
                console.log(BPString)
                BPString = BPString[1].split("$")
                parseAndSendBpImage(message, `SHAPEZ2-1-${BPString[0]}$`) 
            }
            return;
        }

        const command = message.content.split(' ')[0].slice(1)
        const args = message.content.slice(command.length+2).split(' ')

        if(command === "bpview") {
            if(args.length != 1 || args[0] == "") {
                message.channel.send('Unexpected amount of args; Expected `1`.') 
                return;
            }
            if(!args[0].startsWith("SHAPEZ2-1-") || !args[0].endsWith("$")) {
                message.channel.send(`FormatError: ${args[0].startsWith("SHAPEZ2-") && ! args[0].startsWith("SHAPEZ2-1-") ? "Blueprint is an unsupported version." : "Blueprint has an invalid format."}`)
                return;
            }
            parseAndSendBpImage(message, args[0]) ;
        }
    }
    catch(e) {console.log(e)}
});

function parseAndSendBpImage(message: DiscordJS.Message, BPString: string) {
    let cp = require('child_process');
    let child = cp.spawn(`${rustBpUnpackerPath}/shapez2_blueprint_renderer.exe`, []);
    let error = false;

    child.stdin.write(BPString);

    child.stdout.on('data', function (data:string) {
        console.log('stdout: ' + data);
    });
    child.stdin.end();
    child.stderr.on('data', (data: any) => {
        error = true;
    });
    child.stdout.on('close', () => {
        if(!error) {
            message.channel.send({ files: [imagePath] }).then(() => {
                unlink(imagePath, (err) => {
                    if (err) throw err;
                    console.log('BP image removed.');
                }); 
            })
        }
    }); 
}

client.login(process.env.token);