const token = process.env.BOT_TOKEN
const token_user_ids = require("../../util/jsons/token_user_ids.json")
const functions = require("./basic_functions")

const headers = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: token,
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

async function changeStatus(status_text, status, headers) {
    try {
        await axios.patch(
            "https://discord.com/api/v8/users/@me/settings", { status: status, custom_status: { text: status_text } }, { headers: headers }
          );
          
        await functions.sleep(1000);
    } catch (error) {
        console.log(error)
        }
}

module.exports = {
    headers,
    getUserToken,
    changeStatus
}