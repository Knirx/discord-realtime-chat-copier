require("dotenv").config();
const fs = require("fs");
const { Client } = require("discord.js-selfbot-v13");
const readline = require("readline");
const axios = require("axios");
const { joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const token_2 = process.argv[2];
const channel_id = process.argv[3];

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function get_random_item_array(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

async function read_bottom_line_txt(filePath) {
    const lines_array = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        lines_array.push(line);
    }
    return lines_array;
}

async function changeStatus(status_text, status, headers) {
    try {
        await axios.patch(
            "https://discord.com/api/v8/users/@me/settings", { status: status, custom_status: { text: status_text } }, { headers: headers }
        );

        await sleep(1000);
    } catch (error) {
        console.log(error);
    }
}

async function boot_all_tokens() {
    const bot_status = ["idle", "online", "dnd", "invisible"];
    const bot_tokens_array = await read_bottom_line_txt("./src/util/tokens.txt"); // tokens filepath

    const bot = new Client();
    bot.login(token_2);
    bot.on('ready', async () => {
        console.log(`Bot is online as ${bot.user.tag}`);
        const headers = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token_2,
            }
        };
        await changeStatus(get_random_item_array(await read_bottom_line_txt("./src/util/statuses.txt")), get_random_item_array(bot_status), headers.headers); // statuses file path
        await voiceChannelBots(bot.channels.cache.get(channel_id));
    });
}

async function voiceChannelBots(channel) {
    if (channel?.type === "GUILD_VOICE") {
        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false
            });

            console.log("Successfully joined voice channel.");
        } catch (error) {
            console.error("Error joining voice channel:", error);
        }
    } else {
        console.log("Channel is not a GUILD_VOICE type.");
    }
}

boot_all_tokens();