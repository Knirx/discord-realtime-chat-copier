const bot_commands = require("../../util/jsons/cmd_payloads.json")
const functions = require("../functions/basic_functions")
const token_user_ids = require("../../util/jsons/token_user_ids.json")
const config = require("../../util/jsons/config.json")
const request_stuff = require("../functions/request_stuff")
const axios = require("axios")
const normal_message_function = require("./normal_channel_functions")


async function main(message, client) {
    const final_payload_array = []
    try {
        if (message.interaction.commandName == "leaderboard") {
            await functions.sleep(8000)
            final_payload_array.push(await leadboardPayload(message))
        } else if (message.interaction.commandName == "evaluate") {
            await functions.sleep(8000)
            final_payload_array.push(await evaluatePayload(message))
        } else if (message.interaction.commandName == "help") {
            await functions.sleep(1000)
            final_payload_array.push(await helpPayload(message))
        } else if (message.interaction.commandName == "godrolls") {
            final_payload_array.push(await godrollsPayload(message["embeds"][0]["title"].toUpperCase().replace(" ", "_")))
        } else if (message.interaction.commandName == "kuudra") {
            await functions.sleep(3000)
            final_payload_array.push(await statsPayload(message))
        } else {
            await functions.sleep(2000)
            const regex_matches = fromJsSingleString(message["embeds"][0]["title"])
            if (regex_matches) {
                if (message.interaction.commandName == "ap") {
                    final_payload_array.push(await apPayload(message, regex_matches))
                } else if (message.interaction.commandName == "attributeprice") {
                    final_payload_array.push(await attributepricePayload(message, regex_matches))
                }
            }
        }
        await sendCmdRequest(message, final_payload_array)
    } catch (error) {
        await normal_message_function.main(message, client, config.bot_cmds_channel_copy, null)
    }
}

async function sendCmdRequest(message, final_payload_array) {
    try {
        const headers = await request_stuff.getUserToken(message)
        await axios.post(`https://discord.com/api/v9/interactions`, final_payload_array[0], {headers: headers})
    } catch (error) {
        console.log(JSON.stringify(error, 0, 4))
    }
}

async function attributepricePayload(message, regex_matches) {
    let attributeprice_payload = bot_commands["attributeprice"]
    attributeprice_payload["channel_id"] = config.bot_cmds_channel_copy
    attributeprice_payload["guild_id"] = config.server_id_copy
    for (let i = 0; i < attributeprice_payload["data"]["options"].length; i++) {
        const option = attributeprice_payload["data"]["options"][i];
        if (i < regex_matches.length) {
          option.value = regex_matches[i];
        }
    }
    return attributeprice_payload
}

async function apPayload(message, regex_matches) {
    let ap_payload = bot_commands["ap"]
    ap_payload["channel_id"] = config.bot_cmds_channel_copy
    ap_payload["guild_id"] = config.server_id_copy
    for (let i = 0; i < ap_payload["data"]["options"].length; i++) {
        const option = ap_payload["data"]["options"][i];
        if (i < regex_matches.length) {
          option.value = regex_matches[i];
        }
    }
    return ap_payload
}

async function statsPayload(message) {
    let stats_payload = bot_commands["kuudra"]
    stats_payload["data"]["options"][0]["value"] = message["embeds"][0]["title"].slice(17)
    stats_payload["channel_id"] = config.bot_cmds_channel_copy
    stats_payload["guild_id"] = config.server_id_copy
    return stats_payload
}

async function godrollsPayload(new_title) {
    let godrolls_payload = bot_commands["godrolls"]
    godrolls_payload["data"]["options"][0]["value"] = new_title
    godrolls_payload["channel_id"] = config.bot_cmds_channel_copy
    godrolls_payload["guild_id"] = config.server_id_copy
    return godrolls_payload
}

async function cmdNameKeys(message) {
    if (Object.keys(bot_commands).includes(message.interaction.commandName)) {
        return true
    } else {
        return false
    }
}

async function helpPayload(message) {
    let help_payload = bot_commands["help"]
    help_payload["channel_id"] = config.bot_cmds_channel_copy
    help_payload["guild_id"] = config.server_id_copy
    return help_payload
}

async function evaluatePayload(message) {
    let evaluate_payload = bot_commands[`evaluate`]
    evaluate_payload["data"]["options"][0]["value"] = fromJsSingleString(message["embeds"][0]["title"].split(" | ")[0])[0]
    evaluate_payload["channel_id"] = config.bot_cmds_channel_copy
    evaluate_payload["guild_id"] = config.server_id_copy
    return evaluate_payload
}

function fromJsSingleString(text) {
    const matches = text.match(/`([^`]+)`/g);
    if (matches) {
        const extractedValues = matches.map(match => match.replace(/`/g, ''));
        return extractedValues;
    } else {
        return
    }
}

async function leadboardPayload(message) {
    const extracted_content_array = []
    for (const fields of message.embeds[0].fields) {
        const extracted_content = await extractDiffContentFromFields(fields.value)
        if (extracted_content) {
            extracted_content_array.push(extracted_content)
        }
    }
    let leaderboard_payload = bot_commands[`leaderboard`]
    leaderboard_payload["channel_id"] = config.bot_cmds_channel_copy
    leaderboard_payload["guild_id"] = config.server_id_copy
    if (extracted_content_array.join(" ")) {
        leaderboard_payload["data"]["options"] = [{"type": 3, "name": "ign", "value": extracted_content_array.join(" ")}]
    } else {
        if (message.embeds[0].title == "Kuudra Score Leaderboard Page 1" || message.embeds[0].title == "Kuudra Score Leaderboard Page 2") {
            leaderboard_payload["data"]["options"] = []
        } else {
            leaderboard_payload["data"]["options"] = [{"type": 4, "name": "page", "value": parseInt(message["embeds"][0]["title"].slice(30))}]
        }
    }
    return leaderboard_payload
}

async function extractDiffContentFromFields(embedField) {
    const matches = embedField.match(/```diff\n- (.*?)```/s);
    
    if (matches) {
        const [, nameSection] = matches;
        const newName = nameSection.split(" | ")[1].split(" = ")[0];
        return newName.toLowerCase();
    }
}

module.exports = {
    main
}