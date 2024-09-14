const fetch = require("node-fetch");
const fs = require("fs")
const { Client } = require("discord.js-selfbot-v13")


async function copy_emotes_with_tokens(sourceServer, targetServer, message, args, client) {
    const token_array = ["MTE2MjkyMTY4NTQxNTEyMDk3Nw.GhxZDI.Oewh6Mf2sQoWHP0tZ9NRsrG6w8kzBVdAMaiBns", "MTE2Mjk2NTQyNjc5NjQ5NDg0OA.GcWMdr.pooJU4CysTuHTULVYbpTgzJJDUfA1CQoBfJN3I", "MTE2Mjg5ODk5Mzc3NzQ3NTYyNA.G6eVLB.favby9Q9Tcp20HT90y5rIf8lvwaV1fm_EHmVAE", "MTE4NTA1OTk2MDkwNDc1MzE4Mg.GVwb5R.dM4ITPHLfq4NWvWA9FwhCPzPmzpGUHV7BL1cyQ", "MTE2Mjg5OTA3MDMzNjEwNjYxNw.GtRgYI.QHm37NbEfe1ucWiST4l1b6da0xUGFiUVGsiZRI"]
    for (let i = 0; i < token_array.length; i++) {
        const token = token_array[i]
        const bot = new Client();
        bot.login(token);
        bot.on('ready', async () => {
            try {
                let emoji_dict = {};
                const sourceEmotes = sourceServer.emojis.cache;
                const targetEmotes = targetServer.emojis.cache;

                /*for (const [_, emote] of targetEmotes) {
                    console.log(targetEmotes)
                    console.log(typeof(targetEmotes))
                    console.log(targetEmotes.length)
                    await emote.delete();
                    console.log(`Emote '${emote.name}' deleted from ${targetServer.name}.`);
                    await new Promise(resolve => setTimeout(resolve, 2500));
                }*/
                let amount_of_emotes = 0
                for (const [_, emote] of sourceEmotes) {
                    if (amount_of_emotes == 50) break
                    const existingEmote = targetEmotes.find(e => e.name === emote.name);

                    if (!existingEmote) {
                        amount_of_emotes += 1
                        const response = await fetch(emote.url);
                        const buffer = await response.buffer();
                        const new_emote = await targetServer.emojis.create(buffer, emote.name);
                        console.log(`Emote '${emote.name}' created in ${targetServer.name}.`);
                        emoji_dict[emote.id] = new_emote.id
                        fs.writeFileSync('src/util/jsons/emoji_ids.json', JSON.stringify(emoji_dict, null, 2));
                    } else {
                        console.log(`Emote '${emote.name}' already exists in ${targetServer.name}. Skipping.`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 4500));
                }
                console.log(`Finished copying emojis with token: ${i}`)
            } catch (error) {
                console.error("Error:", error);
            }
        })
        await new Promise(resolve => setTimeout(resolve, 5500));
    }
}


module.exports = {
    name: "copy_emojis",
    description: "Copy emojis from two servers!",
    async execute(message, args, client) {
        const sourceServer = client.guilds.cache.get(args[0]);
        const targetServer = client.guilds.cache.get(args[1]);
        if (!sourceServer || !targetServer) {
            await message.reply("Some invalid IDs have been passed!")
            return;
        }
        await copy_emotes_with_tokens(sourceServer, targetServer, message, args, client)
    }
}