const fetch = require("node-fetch");
const fs = require("fs")


module.exports = {
    name: "copy_roles",
    description: "Copy roles from two servers!",
    async execute(message, args, client) {
        const sourceServer = client.guilds.cache.get(args[0]);
        const targetServer = client.guilds.cache.get(args[1]);
        const everyone_role_id = targetServer.roles.cache.find(role => role.name === '@everyone').id
        if (!sourceServer || !targetServer) {
            await message.reply("Some invalid IDs have been passed!")
            return;
        }

        try {
            await targetServer.roles.fetch();

            for (const [_, role] of targetServer.roles.cache) {
                if (role.name !== "@everyone" && role.name !== "Server Booster") {
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

        } catch (error) {
            console.error("Error:", error);
        }

    }
}