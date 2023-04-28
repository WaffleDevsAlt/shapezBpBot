const { getMessageFile } = require('../utilities');
const { deserialize } = require('../blueprintUtilites');

exports.run = async (client, message, args) => {
    try {
        const fileText = await getMessageFile(message, true);
        if(!fileText) return;

        let decoded = await deserialize(fileText);

        // If there is a file and argument 0 is "format" OR there is no file and arg 1 is "format"
        if(args[0] == "format") decoded = JSON.stringify(decoded, null, 4);
        else decoded = JSON.stringify(decoded); //Else no format nicely

        message.channel.send({ files: [{attachment: Buffer.from(decoded, "utf8"), name: 'deserialized.txt'}] })
    } catch(e) {console.log(e)}
    
}

exports.name = "deserialize";
exports.description = "Decodes the provided file."
exports.enabled = false;