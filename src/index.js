require("dotenv").config()
const fs = require("fs")
const { Client } = require("discord.js-selfbot-v13")
const path = require("path")
const config = require("./util/jsons/config.json")
const bot_cmds_functions = require("./commands/functions/bot_commands_functions")
const suggestion_channel_functions = require("./commands/functions/suggestion_channel_functions")
const normal_msg_functions = require("./commands/functions/normal_channel_functions")
const functions = require("./commands/functions/basic_functions")
const requestFunctions = require("./commands/functions/request_stuff")
const channel_ids = require("./util/jsons/channel_ids.json")
const { fork } = require('child_process');
const { default: axios } = require("axios")


const client = new Client()
client.commands = new Map()
const prefix = "!"

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

async function changeAvatar(message, token) {
    if (!message.author.id || !message.author.avatar) return
    const bot = new Client();
    bot.login(token);
    bot.on('ready', async () => {
    bot.user.setAvatar(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`)
      .then(() => console.log('Avatar changed successfully!'))
      .catch(error => console.log('Error changing avatar:', error));
    });
    const tokens = await functions.read_txt_file("./src/util/tokens_one_time.txt")
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
            bot.on("ready", async => {
                client.user.setPresence(activititty)
            })
            await axios.patch("https://discord.com/api/v8/users/@me/settings", { status: statuses_with_activities.random()}, { headers: {'Content-Type': 'application/json', Authorization: token}});
        }
        // await requestFunctions.changeStatus(functions.get_random_item_array(await functions.read_txt_file("./src/util/statuses.txt")), functions.get_random_item_array(bot_status), headers.headers)
    }
    return
}


client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`)

    const commandFiles = fs
        .readdirSync(path.join(__dirname, 'commands'))
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', file));
        client.commands.set(command.name, command);
    }
    // await requestFunctions.token_onliner()

    setInterval(async () => {await send_important_channel_messages()}, 3600000);
})

async function send_important_channel_messages() {
    const bot = new Client()
    bot.login(process.env.KUUDRA_BOT_TOKEN)
    for (const channel_id of Object.keys(config.important_channels)) {
        const channel = client.channels.cache.get(channel_id)
        const messages = await channel.messages.fetch({limit: 100})
        for (const [messageId, message] of messages) {
            for (const [messageId_2, message_2] of messages) {
                await message_2.delete().then(msg => console.log(`deleted message ${msg}`)).catch(console.error)
            }
            const destionation_channel = bot.channels.cache.get(config.important_channels[`${message.channel.id}`])
            if (message.content != "" || message.attachments.length > 0) {
                await normal_msg_functions.main(message, client)
            } else if (message.embeds.length > 0) {
                //const destionation_channel = bot.channels.cache.get(config.important_channels[`${message.channel.id}`])
                await axios.post(`https://discord.com/api/v9/channels/${config.important_channels.channel_id}}/messages`, {message}, {headers: {'Content-Type': 'application/json', Authorization: process.env.KUUDRA_BOT_TOKEN}})
            }
        }
    }
}


client.on("messageCreate", async (message) => {
    if (message.content.startsWith(prefix)) {
        if (message.author.id != process.env.OWNER_ID) return
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);
        if (command) {
          command.execute(message, args, client);
        }
    } else if (Object.keys(config.channel_ids).includes(message.channelId) || [config.suggestion_channel, config.bot_cmds_channel].includes(message.channelId)) {
        if (message.channelId == config.suggestion_channel) {
            const embed_description = functions.getEmbedDescription(message)
            if (embed_description !== null) {
                suggestion_channel_functions.main(embed_description, client)
            }
        } else if (message.channelId == config.bot_cmds_channel) {
            bot_cmds_functions.main(message, client)
        } else {
            normal_msg_functions.main(message, client)
        }
    }
});

client.login(process.env.BOT_TOKEN)


module.exports = {
    changeAvatar
}
