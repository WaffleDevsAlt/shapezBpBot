const fetch = require("fetch");
const util = require("util")
const zlib = require("zlib")
const { groups, buildings } = require("./buildingTranslations.json");

const VERSION = "1";
const PREFIX = "SHAPEZ2";
const DIVIDER = "-";
const SUFFIX = "$";
const gunzip = util.promisify(zlib.gunzip);

async function deserialize(serialized) {
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
    return parsed;
}
function formatBuilding(buildingName) {
    try{
        const group = buildings[buildingName].group;
        let nested = false;
        if(groups[group].group) nested = groups[group].group;
        const name = buildings[buildingName].name;

        return {group, name, nested};
    } catch(e) {console.log(e)}
}

function formatGroup(groupName) {
    try{
        let nested = false;
        if(groups[groupName].group) nested = groups[groupName].group;
        const name = groups[groupName].name;
        
        return {nested, name};
    } catch(e) {console.log(e)}
}

module.exports = { deserialize, formatBuilding, formatGroup };