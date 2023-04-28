const utils = require('../utilities')
const { adminUserIds, adminRolesIds} = require("../config.json");

exports.run = (client, message, args) => {
    const isWhitelistedRole = message.member.roles.cache.some(role => adminRolesIds.includes(role.id));
    const isWhitelistedUser = adminUserIds.includes(message.member.id)
    if (!isWhitelistedRole && !isWhitelistedUser) {
        return;
    }
    switch(args.shift()) {
        case 'addtag': 
            let tagName = args.shift();
            let tagContent = args.join(" ");
            
            client.tags[tagName] = tagContent;
            log(`${message.member.username}:${message.member.id}; Created new tag: `);
            utils.writeData(`./database/tags.wddb`, JSON.stringify(client.tags))
        case 'removetag': 
            delete client.tags[args.shift()]
            console.log(client.tags)
            console.log(JSON.stringify(client.tags))
            utils.writeData(`./database/tags.wddb`, JSON.stringify(client.tags))
    }
}

exports.name = "admin";
exports.description = "Adds several bot admin only functions."
exports.enabled = false;