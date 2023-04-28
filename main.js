require('dotenv').config()
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const utils = require('./utilities')

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,]
});

const config = require("./config.json");
// We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
client.config = config;
client.ongoingGames = {}
client.tags = JSON.parse(utils.readData(`./database/tags.wddb`))

const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of events) {
  const eventName = file.split(".")[0];
  const event = require(`./events/${file}`);

  console.log(`Events: Loading ./events/${file}`)
  client.on(eventName, event.bind(null, client));
}

client.commands = new Collection();
const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commands) {
  const commandName = file.split(".")[0];
  const command = require(`./commands/${file}`);

  console.log(`Commands: Loading ./commands/${file}`)
  client.commands.set(commandName, command);
}

client.slashcommands = new Collection();
const slashcommands = fs.readdirSync("./slashcommands").filter(file => file.endsWith(".js"));
for (const file of slashcommands) {
  const slashcommandName = file.split(".")[0];
  const slashcommand = require(`./slashcommands/${file}`);

  console.log(`SlashCommands: Loading ./slashcommands/${file}`)
  client.slashcommands.set(slashcommandName, slashcommand);
}

client.buttonactions = new Collection();
const buttonactions = fs.readdirSync("./buttonactions").filter(file => file.endsWith(".js"));
for (const file of buttonactions) {
  const buttonactionName = file.split(".")[0];
  const buttonaction = require(`./buttonactions/${file}`);

  console.log(`ButtonActions: Loading ./buttonactions/${file}`)
  client.buttonactions.set(buttonactionName, buttonaction);
}

client.login(process.env.token);