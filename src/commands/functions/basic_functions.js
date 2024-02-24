const fs = require("fs")
const readline = require("readline")
const config = require("../../util/jsons/config.json")

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function replace_mentions(message) {
    const regex = /<@[^>]+>/g;
    return message.content.replace(regex, "");
}

async function change_json(filePath, key, value) {
    const existingData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(existingData);
    jsonData[key] = value;
    const updatedData = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, updatedData);
    return true
}

function get_random_item_array(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function get_random_number(x) {
    return Math.floor(Math.random() * x.length)
}

function get_random_value_json(object) {
    const number = Math.floor(Math.random() * Object.keys(object).length)
    return Object.values(object)[number]
}

async function read_bottom_line_txt(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        return line;
    }
}

async function read_txt_file(filePath) {
    const lines_array = []
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        lines_array.push(line)
    }
    return lines_array
}

function builer_headers(token) {
    return {'Content-Type': 'application/json', 'Authorization': token}
}

function getNewChannelID(old_channel_id, in_channel_ids_key) {
    if (in_channel_ids_key == true) {
        return config.channel_ids[old_channel_id]
    } else {
        return config[old_channel_id]
    }
}

function getEmbedDescription(message) {
    if (message.embeds && message.embeds.length > 0) {
      const embed = message.embeds[0];
      if (embed.description !== undefined && embed.description !== null) {
        if (embed.description.trim() !== "") {
          return embed.description.trim();
        }
      }
    }
    return null;
}


module.exports = {
    sleep, 
    change_json,
    get_random_item_array,
    get_random_number,
    get_random_value_json,
    read_bottom_line_txt,
    builer_headers,
    replace_mentions,
    getNewChannelID,
    getEmbedDescription,
    read_txt_file
}