exports.run = (client, message, args) => {
    let result = 'Tags:\n';
    for (const tag in client.tags) {
        result += `\n${tag} : ${client.tags[tag]}`
    }
    message.channel.send(result)
}

exports.name = "tags";
exports.description = "Shows all tags"
exports.enabled = true;