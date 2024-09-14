const fetch = require("node-fetch");
const fs = require("fs")


module.exports = {
    name: "copy",
    description: "Copy two servers!",
    async execute(message, args, client) {
        const sourceServer = client.guilds.cache.get(args[0]);
        const targetServer = client.guilds.cache.get(args[1]);
        const everyone_role_id = targetServer.roles.cache.find(role => role.name === '@everyone').id
        if (!sourceServer || !targetServer) {
            await message.reply("Some invalid IDs have been passed!")
            return;
        }

        try {
            await targetServer.channels.fetch();
            targetServer.channels.cache.forEach(async channel => {
                try {
                    if (channel.type !== 'GUILD_CATEGORY' && channel.id !== targetServer.id) {
                        console.log(`Deleting channel '${channel.name}' from ${targetServer.name}.`);
                        await channel.delete();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else if (channel.type === 'GUILD_CATEGORY') {
                        console.log(`Deleting category '${channel.name}' from ${targetServer.name}.`);
                        await channel.delete();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    console.error(`Error deleting ${channel.type === 'GUILD_CATEGORY' ? 'category' : 'channel'} '${channel.name}': ${error.message}`);
                }
            });
            console.log("All channels (including categories) deleted from the target server.");

            let emoji_dict = {};
            const sourceEmotes = sourceServer.emojis.cache;
            const targetEmotes = targetServer.emojis.cache;
            console.log(Boolean(targetEmotes))
            // console.log(sourceEmotes)

            for (const [_, emote] of targetEmotes) {
                console.log(targetEmotes)
                console.log(typeof(targetEmotes))
                console.log(targetEmotes.length)
                await emote.delete();
                console.log(`Emote '${emote.name}' deleted from ${targetServer.name}.`);
                await new Promise(resolve => setTimeout(resolve, 2500));
            }
            for (const [_, emote] of sourceEmotes) {
                const existingEmote = targetEmotes.find(e => e.name === emote.name);

                if (!existingEmote) {
                    const response = await fetch(emote.url);
                    const buffer = await response.buffer();
                    const new_emote = await targetServer.emojis.create(buffer, emote.name);
                    console.log(`Emote '${emote.name}' created in ${targetServer.name}.`);
                    emoji_dict[emote.id] = new_emote.id
                } else {
                    console.log(`Emote '${emote.name}' already exists in ${targetServer.name}. Skipping.`);
                }
                await new Promise(resolve => setTimeout(resolve, 5500));
            }
            fs.writeFileSync('src/util/jsons/emoji_ids.json', JSON.stringify(emoji_dict, null, 2));

            await targetServer.roles.fetch();

            for (const [_, role] of targetServer.roles.cache) {
                if (role.name !== "@everyone") {
                    console.log(`Deleting role '${role.name}' from ${targetServer.name}.`);
                    await role.delete();
                }
            }

            console.log("All roles (except @everyone) deleted from the source server.");

            const sortedRoles = sourceServer.roles.cache.sort((a, b) => a.position - b.position);

            const roleInfo = sortedRoles.map(role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                permissions: role.permissions.bitfield
            }));

            const roleMapping = {};
            for (const role of roleInfo) {
                if (role.name == "@everyone") {
                    roleMapping[role.id] = everyone_role_id
                } else {
                    const createdRole = await targetServer.roles.create({
                        name: role.name,
                        color: role.color,
                        permissions: role.permissions
                    });
                    console.log(`Role '${createdRole.name}' created on ${targetServer.name} with permissions: ${role.permissions}`);
                    roleMapping[role.id] = createdRole.id;
                }
            }
            fs.writeFileSync('src/util/jsons/role_ids.json', JSON.stringify(roleMapping, null, 2));
            console.log("Role mapping written to role_mapping.json successfully.");


            await sourceServer.channels.fetch();

            const sourceCategories = sourceServer.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY');

            const categories = {};
            for (const sourceCategory of sourceCategories.values()) {
                console.log(`Creating category '${sourceCategory.name}' on ${targetServer.name}.`);

                const createdCategory = await targetServer.channels.create(sourceCategory.name, {
                    type: 'GUILD_CATEGORY',
                    reason: "Copying categories from source server"
                });

                categories[sourceCategory.id] = createdCategory.id;
            }

            const sourceChannels = sourceServer.channels.cache.filter(channel => channel.type !== 'GUILD_CATEGORY' && channel.type !== 'GUILD_VOICE');
            let channelDict = {}
            for (const sourceChannel of sourceChannels.values()) {
                try {
                    console.log(`Creating channel '${sourceChannel.name}' on ${targetServer.name} under category '${sourceChannel.parent ? sourceChannel.parent.name : "None"}'.`);

                    const permissionOverwrites = sourceChannel.permissionOverwrites.cache.map(overwrite => {
                        const targetId = overwrite.type === "role" ? roleMapping[overwrite.id] || overwrite.id : overwrite.id;
                        if (targetId) {
                            return {
                                id: targetId,
                                allow: overwrite.allow.toArray(), 
                                deny: overwrite.deny.toArray() 
                            };
                        }
                    }).filter(overwrite => overwrite); 

                    const new_created_channel = await targetServer.channels.create(sourceChannel.name, {
                        type: sourceChannel.type,
                        parent: sourceChannel.parent ? categories[sourceChannel.parent.id] : null,
                        permissionOverwrites,
                        reason: "Copying channels from source server"
                    });
                    channelDict[sourceChannel.id] = new_created_channel.id

                } catch(error) {
                    console.log(error)
                }
            }
            fs.writeFileSync('src/util/jsons/channel_ids.json', JSON.stringify(channelDict, null, 2));
        } catch (error) {
            console.error("Error:", error);
        }

    }
}