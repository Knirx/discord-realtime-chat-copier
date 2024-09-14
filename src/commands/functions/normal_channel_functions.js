const message_ids = require("../../util/jsons/message_ids.json")
const { Client } = require("discord.js-selfbot-v13")
const functions = require("../functions/basic_functions")
const config = require("../../util/jsons/config.json")
const headers = require("../functions/request_stuff")
const axios = require("axios")
const role_ids = require("../../util/jsons/role_ids.json")
const channel_ids = require("../../util/jsons/channel_ids.json")
const emoji_ids = require("../../util/jsons/emoji_ids.json")
const index_file = require("../../index.js")
const buffer = require("buffer")
const fs = require("fs").promises

async function main(message, client, bot_cmds_channel, suggestion_channel) {
    await post_request(await final_message_dict([await getReferences(message), await getAttachments(message), await getUserMentions(message), await functions.replace_mentions(message), await getUserToken(message), await getChannelMentions(message), await getEmotes(message)]), functions.getNewChannelID(message.channelId, true), message, bot_cmds_channel, suggestion_channel)
}

async function post_request(data, channelID, message, bot_cmds_channel, suggestion_channel) {
    await functions.sleep(1000)
    try {
        if (bot_cmds_channel) {
            try {
                const post_request_data = await axios.post(`https://discord.com/api/v10/channels/${bot_cmds_channel}/messages`, {content: data[0].content, 
                message_reference: data[0].message_reference}, {headers: data[1]})
                await functions.change_json("./src/util/jsons/message_ids.json", message.id, post_request_data.data.id)
            } catch(error) {console.log("error posting message in normal_channel_functions/post_request function bot_cmd_channels")}
        } else if (suggestion_channel) {
            try {
                const post_request_data = await axios.post(`https://discord.com/api/v10/channels/${suggestion_channel}/messages`, {content: data[0].content, 
                message_reference: data[0].message_reference}, {headers: data[1]})
                await functions.change_json("./src/util/jsons/message_ids.json", message.id, post_request_data.data.id)
            } catch(error) {console.log("error posting message in normal_channel_functions/post_request function suggestion_channel")}
        } else {
            try {
                const post_request_data = await axios.post(`https://discord.com/api/v10/channels/${channelID}/messages`, {content: data[0].content, 
                message_reference: data[0].message_reference}, {headers: data[1]})
                await functions.change_json("./src/util/jsons/message_ids.json", message.id, post_request_data.data.id)
            } catch(error) {console.log("error posting message in normal_channel_functions/post_request fucntion normal_channels")}
        }
    } catch (error) {console.log("error in normal_channel_functions/post_request function general")}
}


async function changeAvatar(message, token) {
    try {
        if (!message.author.id || !message.author.avatar) return
        const bot = new Client();
        try {
            bot.login(token);
        } catch(error) {console.log("error login in with bot");return}
        bot.on('ready', async () => {
            const data = bot.user.setAvatar(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
                .then(() => console.log("Changed avatar"))
                .catch(error => console.log('Error changing avatar'));
            });
            if (data.httpStatus == "400") return
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
    } catch(error) {console.log("error in changeAvatarFunction"); return}
}

async function final_message_dict(array) {
    let message_data = {}
    if (array[2]) {
        message_data.content = array[2] + " "
    }
    if (array[1]) {
        message_data.content = (message_data.content || '') + " " + array[1] 
    }
    if (array[5]) {
        message_data.content = (message_data.content || '') + array[5] + " ";
    }
    if (array[3]) {
        message_data.content = (message_data.content || '') + array[3] + " ";
    }
    if (array[6]) {
        message_data.content = (message_data.content || '') + array[6] + " "
    }
    if (array[0]) {
        message_data.message_reference  = array[0]
    }
    return [message_data, array[4]]
}

async function getAttachments(message) {
    const array = []
    if (message.attachments) {
        for (let attachment of message.attachments.values()) {
            array.push(attachment.attachment);
        }
        return array.join(" ")
    } else {
        return
    }
}

async function readFromJSONFile(filePath) {
    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        return data;
    } catch (error) {
        console.error('Error reading JSON file in normal_channel_functions/readFromJSONFile');
        return null;
    }
}


async function getReferences(message) {
    const message_ids_1 = await readFromJSONFile("./src/util/jsons/message_ids.json")
    const messageIdSet = new Set(Object.keys(message_ids_1).map(String))
    if (message.type === "REPLY") {
        if (messageIdSet.has(message.reference.messageId)) {
            return {
                "channel_id": channel_ids[message.reference.channelId],
                "guild_id": config.server_id_copy,
                "message_id": message_ids_1[message.reference.messageId],
            }
        } else {
            return ""
        }
    } else {
        return ""
    }
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


async function getUserToken(message) {
    // console.log(message.author.id)
    // console.log(Object.keys(token_user_ids))
    const token_user_ids_1 = await readFromJSONFile("./src/util/jsons/token_user_ids.json")
    if (Object.keys(token_user_ids_1).includes(`${message.author.id}`)) {
        const headers_value = token_user_ids_1[`${message.author.id}`].split(" | ")
        try {
            await axios.post(`https://discord.com/api/v9/channels/${channel_ids[`${message.channelId}`]}/typing`, {}, {headers: {Authorization: headers_value}})
        } catch(error) {console.log("error in normal_channel_functions/getUserToken function cant send typing package")}
            await addRoles(headers_value[1], message.member._roles)
        const headers = functions.builer_headers(headers_value[0])
        if (message.member.nickname == null) {
            try {
                await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/@me`, {"nick": `${message.author.globalName}`}, {headers: headers})
            } catch(error) {console.log(error)}
        } else {
            try {
                await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/@me`, {"nick": `${message.member.nickname}`}, {headers: headers})
            } catch(error) {console.log(error), "Cant patch nick"}
        }
        await changeAvatar(message, headers_value[0])
        return headers
    } else {
        const headers = functions.builer_headers(await functions.read_bottom_line_txt("./src/util/tokens.txt"))
        try {
            try {
                await axios.post(`https://discord.com/api/v9/channels/${channel_ids[`${message.channelId}`]}/typing`, {}, {headers: {Authorization: headers.Authorization}})
            } catch(error) {console.log("error sending typing package in normal_channel_functions/getUserToken function")}
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
            await addRoles(extractedId, message.member._roles)
            if (message.member.nickname == null) {
                await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/@me`, {"nick": `${message.author.globalName}`}, {headers: headers})
            } else {
                await axios.patch(`https://discord.com/api/v9/guilds/${config.server_id_copy}/members/@me`, {"nick": `${message.member.nickname}`}, {headers: headers})
            }
            try {
                const id_response = await axios.get(`https://discord.com/api/v9/users/@me`, {headers: headers})
                await functions.change_json("./src/util/jsons/token_user_ids.json", message.author.id, `${headers.Authorization} | ${id_response.data.id}`)
            } catch(error) {console.log("error getting id and saving to json, normal_channel_functions/getUserToken function")}
            await changeAvatar(message, headers.Authorization)
            return headers
        } 
        catch (error) {
            console.log("error in normal_channel_functions/getUserToken function")
            return headers
        } 
    }
}

async function getOpponentId(array) {
    const token_user_ids = await readFromJSONFile("./src/util/jsons/token_user_ids.json")
    const replaced_ids_array = []
    if (array == []) {
        return
    } else {
        for (const ids of array) {
            if (Object.keys(token_user_ids).includes(ids)) {
                replaced_ids_array.push(`<@${token_user_ids[ids].split(" | ")[1]}>`)
            }
        }
        return replaced_ids_array.join(" ")
    }
}

async function getUserMentions(message) {
    const regex = /<@(\d+)>/g;
    const user_ids = [];
    
    let match;
    while ((match = regex.exec(message.content)) !== null) {
        user_ids.push(match[1]);
    }

    return await getOpponentId(user_ids)
}


async function getOpponentEmote(array) {
    const replaced_emotes_array = []
    if (array == []) {
        return
    } else {
        for (const emote of array) {
            const emote_id = emote.split(":")[2].replace(">", "")
            if (Object.keys(emoji_ids).includes(emote_id)) {
                replaced_emotes_array.push(`${emote.replace(emote_id, emoji_ids[emote_id])}`)
            }
        }
        return replaced_emotes_array.join(" ")
    }
}


async function getEmotes(message) {
    const regex = /<:[^>]+>/g;
    const regex_2 = /<a:[^>]+>/g;
    const emoji_ids = [];
    
    let match;
    while ((match = regex.exec(message.content)) !== null) {
        emoji_ids.push(match[0]);
    }
    let match_2;
    while ((match_2 = regex_2.exec(message.content)) !== null) {
        emoji_ids.push(match_2[0]);
    }
    return await getOpponentEmote(emoji_ids)
}


async function getOpponentChannel(array) {
    const replaced_ids_array = []
    if (array == []) {
        return
    } else {
        for (const channel of array) {
            if (Object.keys(channel_ids).includes(channel)) {
                replaced_ids_array.push(`<#${channel_ids[channel]}>`)
            }
        }
        return replaced_ids_array.join(" ")
    }
}


async function getChannelMentions(message) {
    const regex = /<#(\d+)>/g;
    const user_ids = [];
    
    let match;
    while ((match = regex.exec(message.content)) !== null) {
        user_ids.push(match[1]);
    }

    return await getOpponentChannel(user_ids)
}

module.exports = {
    main
}