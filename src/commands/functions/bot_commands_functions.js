const bot_commands = require("../../util/jsons/cmd_payloads.json")
const functions = require("../functions/basic_functions")
const config = require("../../util/jsons/config.json")
const request_stuff = require("../functions/request_stuff")
const axios = require("axios")
const normal_message_function = require("./normal_channel_functions")
const all_channels = require("../../util/jsons/channel_ids.json")
const { Client } = require("discord.js-selfbot-v13")
const role_ids = require("../../util/jsons/role_ids.json")


async function main(message, client) {
    const final_payload_array = []
    if (!cmdNameKeys(message)) return
    if (message.author.id == "710143953533403226") {
        try {
            if (message.interaction.commandName == "networth") {
                await functions.sleep(8000)
                final_payload_array.push(await networthPayload(message))
            } else if (message.interaction.commandName == "profile") {
                await functions.sleep(8000)
                final_payload_array.push(await profilePayload(message))
            }
        } catch(error) {
            await normal_message_function.main(message, client, all_channels[`${message.channel.id}`], null)
        }
        await sendCmdRequest(message, final_payload_array, client)
    } else {
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
                final_payload_array.push(await godrollsPayload(message, message["embeds"][0]["title"].toUpperCase().replace(" ", "_")))
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
            await sendCmdRequest(message, final_payload_array, client)
        } catch (error) {
            await normal_message_function.main(message, client, all_channels[`${message.channel.id}`], null)
        }
    }
}


async function profilePayload(message) {
    let profile_payload = bot_commands["profile"]
    profile_payload["channel_id"] = all_channels[`${message.channel.id}`]
    profile_payload["guild_id"] = config.server_id_copy
    profile_payload["data"]["options"][0]["value"] = message["embeds"][0]["title"].split("'")[0]
    return profile_payload
}


async function networthPayload(message) {
    let networth_payload = bot_commands["networth"]
    networth_payload["channel_id"] = all_channels[`${message.channel.id}`]
    networth_payload["guild_id"] = config.server_id_copy
    networth_payload["data"]["options"][0]["value"] = message["embeds"][0]["title"].split("'")[0]
    return networth_payload
}

async function addRoles(user_id, old_roles) {
    let new_roles = []
    for (const i of old_roles) {
        new_roles.push(role_ids[i])
    }
    if (!new_roles.includes("1227535489746210838")) new_roles.push("1227535489746210838")
    if (!new_roles.includes("1228100053013626963")) new_roles.push("1228100053013626963")
    if (!new_roles.includes("1227535488693305346")) new_roles.push("1227535488693305346")
    
    try {
        await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/${user_id}`, {roles: new_roles}, {headers: functions.builer_headers(process.env.ACTUAL_USER_TOKEN_WITH_PERMS)})
    } catch (error) {console.log("error in normal_channel_functions/addRoles function")}
    return 
}


async function changeAvatar(message, token, avatar_thing) {
    try {
        if (!message.author.id || !message.author.avatar) return
        const bot = new Client();
        try {
            bot.login(token);
        } catch(error) {console.log("error login in with bot");return}
        if (avatar_thing != null) {
            bot.on('ready', async () => {
                const data = bot.user.setAvatar(`https://cdn.discordapp.com/avatars/${message.interaction.user.id}/${avatar_thing}.png`)
                    .then(() => console.log("Changed avatar in bot cmds"))
                    .catch(error => console.log('Error changing avatar in bot cmds'));
                });
                if (data.httpStatus == "400") return
        }
            let statuses_with_activities = [{status: "online"}, {status: "dnd"}, {status: "idle"}]
            let statueses = [{status: "online"}, {status: "dnd"}, {status: "idle"}, {status: "invisible"}]
            let all_activities = [
                {activities: [{application_id: "432980957394370572", assets: {large_image: '1169923443119116288', small_image: "443231156620754945", small_text: "Tier 1"}, details: "Battle Royale - In Lobby", name: "Fortnite", party: {id: 'd41d8cd98f00b204e9800998ecf8427e'}, type: 0, evt: null}]}, 
                {activities: [{application_id: "356875570916753438", assets: {large_image: '166fbad351ecdd02d11a3b464748f66b'}, name: "Minecraft", type: 0}]}, 
                {activities: [{application_id: "4zofWloLlqaqSoIqyyEoex", assets: {large_image: '371bb877e1a3fe7e68dd'}, name: "Spotify", type: 0, type: "LISTENING"}]},
                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, 
                false, false, false, false, false, false, false, false, false, false, false, false, false, false]
            const activititty = all_activities.random()
            if (activititty == false) {
                const custom_status_request = functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt"))
                await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statueses.random(), custom_status: { text:  custom_status_request}}, { headers: {'Content-Type': 'application/json', Authorization: token}});
                bot.destroy()
            } else {
                bot.user.setPresence(activititty)
                bot.destroy()
                await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statuses_with_activities.random()}, { headers: {'Content-Type': 'application/json', Authorization: token}});
            }
                // await requestFunctions.changeStatus(functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt")), functions.get_random_item_array(bot_status), headers.headers)
            return
    } catch(error) {console.log("error in bot_cmds_functions/changeAvatar function"); return}
}

async function sendCmdRequest(message, final_payload_array, client) {
    const guild = client.guilds.cache.get(config.server_id);
    const member = await guild.members.fetch(message.interaction.user.id);
    const headers = await request_stuff.getUserToken(message)
    if (member.nickname == null) {
        try {
            await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/@me`, {"nick": `${message.author.globalName}`}, {headers: headers})
        } catch(error) {console.log(error)}
    } else {
        try {
            await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/@me`, {"nick": `${member.nickname}`}, {headers: headers})
        } catch(error) {console.log(error), "Cant patch nick"}
    }
    try {
        await changeAvatar(message, headers.Authorization, member.user.avatar)
    } catch(error) {}
    try {
        await axios.post(`https://discord.com/api/v9/interactions`, final_payload_array[0], {headers: headers})
    } catch (error) {
        if (final_payload_array != []) {
            console.log("error sending bot cmd request in bot_commands_functions/sendCmdRequest, payload:", final_payload_array, "Token: ", headers.Authorization)
            const lines = [headers.Authorization]
            const extractedId = lines.map(line => {
                const tokens = line.split('.');
                if (tokens.length >= 2) {
                    const id = tokens[0];
                    return functions.base64Decode(id);
                } else {
                    return "nuh uh";
                }
            })
            await addRoles(extractedId, member._roles)
            try {
                await axios.post(`https://discord.com/api/v9/interactions`, final_payload_array[0], {headers: headers})
            } catch(error) {console.log("error sending bot cmd request in bot_commands_functions/sendCmdRequest, payload:", final_payload_array, "Token: ", headers.Authorization)}
        }
    }
}

async function attributepricePayload(message, regex_matches) {
    let attributeprice_payload = bot_commands["attributeprice"]
    attributeprice_payload["channel_id"] = all_channels[`${message.channel.id}`]
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
    ap_payload["channel_id"] = all_channels[`${message.channel.id}`]
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
    stats_payload["channel_id"] = all_channels[`${message.channel.id}`]
    stats_payload["guild_id"] = config.server_id_copy
    return stats_payload
}

async function godrollsPayload(message, new_title) {
    let godrolls_payload = bot_commands["godrolls"]
    godrolls_payload["data"]["options"][0]["value"] = new_title
    godrolls_payload["channel_id"] = all_channels[`${message.channel.id}`]
    godrolls_payload["guild_id"] = config.server_id_copy
    return godrolls_payload
}

async function cmdNameKeys(message) {
    try {
        if (Object.keys(bot_commands).includes(message.interaction.commandName)) {
            return true
        } else {
            return false
        }
    } catch(error) {return false}
}

async function helpPayload(message) {
    let help_payload = bot_commands["help"]
    help_payload["channel_id"] = all_channels[`${message.channel.id}`]
    help_payload["guild_id"] = config.server_id_copy
    return help_payload
}

async function evaluatePayload(message) {
    let evaluate_payload = bot_commands[`evaluate`]
    evaluate_payload["data"]["options"][0]["value"] = fromJsSingleString(message["embeds"][0]["title"].split(" | ")[0])[0]
    evaluate_payload["channel_id"] = all_channels[`${message.channel.id}`]
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
    leaderboard_payload["channel_id"] = all_channels[`${message.channel.id}`]
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