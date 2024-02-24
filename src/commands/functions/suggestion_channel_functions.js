const suggestions = require("../../util/jsons/suggestions.json")
const functions = require("../functions/basic_functions")
const tokens = require("../../util/jsons/token_user_ids.json")
const config = require("../../util/jsons/config.json")
const headers = require("../functions/request_stuff")
const axios = require("axios")
const normal_message_function = require("./normal_channel_functions")

async function main(content, client) {
    try {
        if (Object.keys(suggestions).includes(content) || content == "") {
            return
        } else {
            functions.change_json("./src/util/jsons/suggestions.json", content, "yes")
            const users_token = functions.get_random_value_json(tokens).split(" | ")[0]
            const channel = config.suggestion_channel_copy
            try {
                await axios.post(`https://discord.com/api/v10/channels/${channel}/messages`, {content: content}, {headers: functions.builer_headers(users_token)})
            } catch(error) {
                console.log(error)
            }
        }
    } catch (error) {
        await normal_message_function.main(message, client, null, config.suggestion_channel_copy)
    }
}

module.exports = {
    main
}