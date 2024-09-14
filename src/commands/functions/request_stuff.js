const token = process.env.BOT_TOKEN
const functions = require("./basic_functions")
const axios = require("axios")
const { Client } = require("discord.js-selfbot-v13")
const fs = require("fs").promises

const headers = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      }
}

async function readFromJSONFile(filePath) {
    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(jsonData);
        return data;
    } catch (error) {
        console.error('Error reading JSON file in request_stuff/readFromJSONFile', error);
        return null;
    }
}

async function getUserToken(message) {
    // console.log(message.author.id)
    // console.log(Object.keys(token_user_ids))
    const token_user_ids_1 = await readFromJSONFile("./src/util/jsons/token_user_ids.json")
    // console.log(Object.keys(token_user_ids_1), "token user ids KEYS")
    if(Object.keys(token_user_ids_1).includes(message.interaction.user.id)) {
        return functions.builer_headers(token_user_ids_1[`${message.interaction.user.id}`].split(" | ")[0])
    } else {
        const headers =  functions.builer_headers(await functions.read_bottom_line_txt("./src/util/tokens.txt"))
        const id_response = await axios.get(`https://discord.com/api/v9/users/@me`, {headers: headers})
        await functions.change_json("./src/util/jsons/token_user_ids.json", message.interaction.user.id, `${headers.Authorization} | ${id_response.data.id}`)
        return headers
    }
}

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}


async function token_onliner() {
    const tokens = await functions.read_txt_file("./src/util/tokens.txt")
    let statuses_with_activities = [{status: "online"}, {status: "dnd"}, {status: "idle"}]
    let statueses = [{status: "online"}, {status: "dnd"}, {status: "idle"}, {status: "invisible"}]
    let all_activities = [
        {activities: [{application_id: "432980957394370572", assets: {large_image: '1169923443119116288', small_image: "443231156620754945", small_text: "Tier 1"}, details: "Battle Royale - In Lobby", name: "Fortnite", party: {id: 'd41d8cd98f00b204e9800998ecf8427e'}, type: 0, evt: null}]}, 
        {activities: [{application_id: "356875570916753438", assets: {large_image: '166fbad351ecdd02d11a3b464748f66b'}, name: "Minecraft", type: 0}]}, 
        {activities: [{application_id: "4zofWloLlqaqSoIqyyEoex", assets: {large_image: '371bb877e1a3fe7e68dd'}, name: "Spotify", type: 0, type: "LISTENING"}]},
        false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, 
        false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    for (const token of tokens) {
        const activititty = all_activities.random()
        if (activititty == false) {
            const custom_status_request = functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt"))
            await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statueses.random(), custom_status: { text:  custom_status_request}}, { headers: {'Content-Type': 'application/json', Authorization: token}});
        } else {
            const bot = new Client()
            bot.login(token)
            bot.on("ready", async => {
                bot.user.setPresence(activititty)
            })
            bot.destroy()
            await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statuses_with_activities.random()}, { headers: {'Content-Type': 'application/json', Authorization: token}});
        }
        // await requestFunctions.changeStatus(functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt")), functions.get_random_item_array(bot_status), headers.headers)
    }
    return
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
    changeStatus,
    token_onliner
}


/*async function token_onliner() {
    const tokens = await functions.read_txt_file("./src/util/tokens.txt")
    let statuses_with_activities = [{status: "online"}, {status: "dnd"}, {status: "idle"}]
    let statueses = [{status: "online"}, {status: "dnd"}, {status: "idle"}, {status: "invisible"}]
    let all_activities = [
        {activities: [{application_id: "432980957394370572", assets: {large_image: '1169923443119116288', small_image: "443231156620754945", small_text: "Tier 1"}, details: "Battle Royale - In Lobby", name: "Fortnite", party: {id: 'd41d8cd98f00b204e9800998ecf8427e'}, type: 0, evt: null}]}, 
        {activities: [{application_id: "356875570916753438", assets: {large_image: '166fbad351ecdd02d11a3b464748f66b'}, name: "Minecraft", type: 0}]}, 
        {activities: [{application_id: "4zofWloLlqaqSoIqyyEoex", assets: {large_image: '371bb877e1a3fe7e68dd'}, name: "Spotify", type: 0, type: "LISTENING"}]},
        false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, 
        false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    for (const token of tokens) {
        const activititty = all_activities.random()
        if (activititty == false) {
            const custom_status_request = functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt"))
            await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statueses.random(), custom_status: { text:  custom_status_request}}, { headers: {'Content-Type': 'application/json', Authorization: token}});
        } else {
            console.log(activititty)
            const bot = new Client()
            bot.login(token)
            bot.on("ready", async => {
                client.user.setPresence(activititty)
            })
            await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statuses_with_activities.random()}, { headers: {'Content-Type': 'application/json', Authorization: token}});
        }
        // await requestFunctions.changeStatus(functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt")), functions.get_random_item_array(bot_status), headers.headers)
    }
}*/


/*async function start_the_tokens() {
    const bot_tokens_array = await functions.read_txt_file("./src/util/tokens.txt"); // tokens filepath
    const voice_channel_tokens_array = await functions.read_txt_file("./src/util/vc_tokens.txt")
    

    // PUT THE VC TOKENS IN THE VC_TOKENS.TXT AND IN THE TOKENS.TXT


    for (const token of bot_tokens_array) {
        if (voice_channel_tokens_array.includes(token)) {
            const child = fork('./src/util/boot_multiple_tokens_vc.js', [token]);
            child.on('message', (message) => {
            console.log(`Child process ${child.pid} sent a message:`, message);
        })
        } else {
            const bot_status = ["idle", "online", "dnd", "invisible"];
            const bot = new Client();
            bot.login(token);
            bot.on('ready', async () => {
                console.log(`Bot is online as ${bot.user.tag}`)
                const headers = {headers: {'Content-Type': 'application/json', Authorization: token}}
                await requestFunctions.changeStatus(functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt")), functions.get_random_item_array(bot_status), headers.headers) // statuses file path
            })
        }
    }
}
start_the_tokens()*/