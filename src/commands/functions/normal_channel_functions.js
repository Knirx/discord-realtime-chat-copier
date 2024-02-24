const message_ids = require("../../util/jsons/message_ids.json")
const functions = require("../functions/basic_functions")
const token_user_ids = require("../../util/jsons/token_user_ids.json")
const config = require("../../util/jsons/config.json")
const headers = require("../functions/request_stuff")
const axios = require("axios")

async function main(message, client, bot_cmds_channel, suggestion_channel) {
    await post_request(await final_message_dict([await getReferences(message), await getAttachments(message), await getUserMentions(message), await functions.replace_mentions(message), await getUserToken(message)]), functions.getNewChannelID(message.channelId, true), message, bot_cmds_channel, suggestion_channel)
}

async function post_request(data, channelID, message, bot_cmds_channel, suggestion_channel) {
    try {
        if (bot_cmds_channel) {
            const post_request_data = await axios.post(`https://discord.com/api/v10/channels/${bot_cmds_channel}/messages`, {content: data[0].content, 
            message_reference: data[0].message_reference}, {headers: data[1]})
            await functions.change_json("./src/util/jsons/message_ids.json", message.id, post_request_data.data.id)
        } else if (suggestion_channel) {
            const post_request_data = await axios.post(`https://discord.com/api/v10/channels/${suggestion_channel}/messages`, {content: data[0].content, 
            message_reference: data[0].message_reference}, {headers: data[1]})
            await functions.change_json("./src/util/jsons/message_ids.json", message.id, post_request_data.data.id)
        } else {
            const post_request_data = await axios.post(`https://discord.com/api/v10/channels/${channelID}/messages`, {content: data[0].content, 
            message_reference: data[0].message_reference}, {headers: data[1]})
            await functions.change_json("./src/util/jsons/message_ids.json", message.id, post_request_data.data.id)
        }
    } catch (error) {console.log(error)}
}

async function final_message_dict(array) {
    let message_data = {}
    if (array[2]) {
        message_data.content = array[2] + " "
    } 
    if (array[1]) {
        message_data.content = (message_data.content || '') + array[1] + " ";
    } 
    if (array[3]) {
        message_data.content = (message_data.content || '') + array[3] + " ";
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

async function getReferences(message) {
    if (message.type == "REPLY") {
        if (Object.keys(message_ids).includes(message.reference.messageId)) {
            return {
                "channel_id": config.channel_ids[message.reference.channelId],
                "guild_id": config.server_id_copy,
                "message_id": message_ids[message.reference.messageId],
            }
        } else {
            return ""
        }
    } else {
        return ""
    }
}

async function getUserToken(message) {
    if(Object.keys(token_user_ids).includes(message.author.id)) {
        return functions.builer_headers(token_user_ids[`${message.author.id}`].split(" | ")[0])
    } else {
        const headers =  functions.builer_headers(await functions.read_bottom_line_txt("./src/util/tokens.txt"))
        const id_response = await axios.get(`https://discord.com/api/v10/users/@me`, {headers: headers})
        await functions.change_json("./src/util/jsons/token_user_ids.json", message.author.id, id_response.id)
        return headers
    }
}

async function getOpponentId(array) {
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


module.exports = {
    main
}