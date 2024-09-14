const fetch = require("node-fetch");
const fs = require("fs")


module.exports = {
    name: "copy_channels",
    description: "Copy channels from two servers!",
    async execute(message, args, client) {
        const roleMapping = require("../util/jsons/role_ids.json")
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

            const sourceChannels = sourceServer.channels.cache.filter(channel => channel.type !== 'GUILD_CATEGORY' && channel.type !== 'GUILD_VOICE'&& channel.type !== 'GUILD_PUBLIC_THREAD' && channel.type !== 'GUILD_PRIVATE_THREAD');
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
            console.log("Wrote all channels to the file!")
        } catch (error) {
            console.error("Error:", error);
        }

    }
}