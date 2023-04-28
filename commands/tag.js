exports.run = (client, message, args) => {
    console.log("tag",args.join(''), client.tags, client.tags[args.join('')])
    message.channel.send(client.tags[args.join('')])
}

exports.name = "tag";
exports.description = "backend"
exports.enabled = false;