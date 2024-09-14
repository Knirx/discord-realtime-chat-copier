const fs = require("fs")
const readline = require("readline")
const config = require("../../util/jsons/config.json")
const channels = require("../../util/jsons/channel_ids.json")

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function replace_mentions(message) {
    const regex = /<@[^>]+>/g;
    const regex_2 = /<#[^>]+>/g;
    const regex_3 = /<:[^>]+>/g
    const regex_4 = /<a:[^>]+>/g
    return message.content.replace(regex_2, "").replace(regex, "").replace(regex_3, "").replace(regex_4, "").trim()
}

async function replace_channel_mentions(message) {
    const regex = /<#[^>]+>/g;
    return message.content.replace(regex, "");
}

async function replace_emotes(message) {
    const regex = /<:[^>]+>/g
    const regex_2 = /<a:[^>]+>/g
    const new_content = message.content.replace(regex, "")
    return new_content.replace(regex_2, "")
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
        await delete_line_from_txt("./src/util/tokens.txt", line)
        return line;
    }
}

function base64Decode(str) {
    return Buffer.from(str, 'base64').toString('utf8');
}

async function delete_line_from_txt(filePath, lineToDelete) {
    try {
        let data = await fs.promises.readFile(filePath, 'utf8');
        const lines = data.split('\n');
        const indexToDelete = lines.findIndex(line => line.trim() === lineToDelete.trim());
        if (indexToDelete !== -1) {
            lines.splice(indexToDelete, 1);
            data = lines.join('\n');
            await fs.promises.writeFile(filePath, data);
        } else {
            console.log(`No match found for "${lineToDelete}" in file "${filePath}".`);
        }
    } catch (error) {
        console.error(`Error deleting line from file: ${error}`);
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
        return channels[old_channel_id]
    } else {
        return channels[old_channel_id]
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
    read_txt_file,
    delete_line_from_txt,
    replace_channel_mentions,
    replace_emotes,
    base64Decode
}