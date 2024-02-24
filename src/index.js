// requires: discord.js-selfbot-v13, axios
require("dotenv").config()
const fs = require("fs")
const { Client } = require("discord.js-selfbot-v13")
const path = require("path")
const config = require("./util/jsons/config.json")
const bot_cmds_functions = require("./commands/functions/bot_commands_functions")
const suggestion_channel_functions = require("./commands/functions/suggestion_channel_functions")
const normal_msg_functions = require("./commands/functions/normal_channel_functions")
const functions = require("./commands/functions/basic_functions")

const client = new Client()
client.commands = new Map()

const commandFiles = fs
  .readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(path.join(__dirname, 'commands', file))
  client.commands.set(command.name, command)
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on("messageCreate", async (message, client) => {
    if (Object.keys(config.channel_ids).includes(message.channelId) || [config.suggestion_channel, config.bot_cmds_channel].includes(message.channelId)) {
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