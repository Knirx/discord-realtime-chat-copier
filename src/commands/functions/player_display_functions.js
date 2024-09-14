const axios = require("axios")
const dicts = require("../../util/player_display_dicts")
const API_KEY = process.env.HYPIXEL_API_KEY
const host = process.env.HOST
const skyhelper_key = process.env.SKYHELPER_KEY

async function get_uuid(username) {
    try {
        const uuid = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)).data
        return [uuid.id, uuid.name]
    } catch (error) {return}
}

async function profilesHypixelRequest(uuid) { 
    try { 
        const data = (await axios.get(`https://api.hypixel.net/v2/skyblock/profiles?key=${API_KEY}&uuid=${uuid}`)).data;
        return data
    } catch (error) {
        console.error(error)
    }
}

async function currentProfile(profilesResponse) {
    try {
        let i = -1
        for(const selected of profilesResponse.profiles) {
            i++
            if (selected.selected == true) {
                return [selected.members, selected.profile_id, selected.cute_name, i]
            }
        }
    } catch (error) {return} 
}

async function dungeon_to_level(value) {
    return get_dungeon_level_by_exp(value.dungeon_types.catacombs.experience).toFixed(1)
}

async function get_skyblock_level(leveling) {
    try {
        return Math.floor(parseInt(leveling.experience / 100))
    } catch(error) {
        return
    }
}

function get_dungeon_level_by_exp(exp) {
    const dungeons = dicts.dungeons
    if (exp >= 569809640) {
        return 50;
    } else {
        let previous = 0;

        for (let i of Object.keys(dungeons)) {
            let level = dungeons[i];

            if (exp >= i) {
                previous = i;
            } else {
                return parseInt(level) - 1 + (exp - previous) / (i - previous);
            }
        }
    }
}

async function slayer_level_9(exp, type) {
    const slayers = dicts.slayers
    if  (type == "vampire") {
        for (const i of Object.keys(slayers)){
            if (exp >= i) {
                if (exp >= 5000) {
                    return 5
                }
            } else {
                return slayers[i] - 1
            }
        }
    } else { 
        for (const i of Object.keys(slayers)) {
            if (exp >= i) {
                if (exp >= 1000000) {
                    return 9
                } 
            } else return parseInt(slayers[i]) - 1
        }
    }
}

async function get_slayer_levels(slayer_endpoint) { 
    const slayer_array = []
    for(let slayers of Object.keys(slayer_endpoint)) {
        slayer_array.push(await slayer_level_9(slayer_endpoint[`${slayers}`]["xp"], slayers))
    }
    return slayer_array
}

async function get_skills_by_exp(exp, type) {
    const lvl_50_skills = ["SKILL_ALCHEMY", "SKILL_FISHING", "SKILL_FORAGING", "SKILL_CARPENTRY"]
    const not_counting_in_skill_avg = ["SKILL_SOCIAL", "SKILL_RUNECRAFTING"]
    const skills = dicts.skills
    previous = 0
    if (not_counting_in_skill_avg.includes(type)) {
        return null
    } else if (lvl_50_skills.includes(type)) {
        for (let i of Object.keys(skills)) {
            let level = skills[i]
            if (exp >= i) {
                if (level == 50) {
                    return level
                } else {
                    previous = i
                }
            } else {
                level = Math.round(level - 1 + (exp - previous) / (i - previous) );
                return level;
    
            }
        }
    } else {
        for (let i of Object.keys(skills)) {
            let level = skills[i]
            if (exp >= i) {
                if (level == 60) {
                    return level
                } else {
                    previous = i
                }
            } else {
                level = Math.round(level - 1 + (exp - previous) / (i - previous));
                return level;
    
            }
        }
    }
}

async function get_average_of_array(array) {
    let number = 0;
    for(let i of array) {
        number += i
    }
    return parseFloat((number) / (array.length)).toFixed(1)
}

async function get_skill_average(skills_endpoint) {
    const skills_array = []
    for (let skills of Object.keys(skills_endpoint)) {
        skills_array.push(await get_skills_by_exp(skills_endpoint[`${skills}`], skills))
    }
    return await get_average_of_array(skills_array.filter(value => value !== null))
}

async function get_networth_and_weight(uuid, profile_id) {
    const networth_array = []
    const inclduings = ["networth", "unsoulboundNetworth", "purse", "bank"]
    const response_data = (await axios.get(`${host}/v1/profile/${uuid}/${profile_id}?key=${skyhelper_key}`)).data
    for (let i of Object.keys(response_data.data.networth)) {
        if (inclduings.includes(i)) {
            networth_array.push(response_data["data"]["networth"][`${i}`])
        }
    }
    for (let j of Object.keys(response_data.data.mining)) {
        if (j == "mithril_powder" || j == "gemstone_powder") {
            networth_array.push(response_data["data"]["mining"][`${j}`]["total"])
        } else if (j == "hotM_tree") {
            networth_array.push(response_data["data"]["mining"][`${j}`]["level"])
        }
    }
    networth_array.push(response_data.data.weight.senither.total)
    return networth_array
}

async function get_kuudra_stats(kuudra_endpoint) {
    const kuudra_array = []
    for (let kuudra in kuudra_endpoint) {
        if (kuudra.endsWith("tion")) {
            kuudra_array.push(kuudra_endpoint[`${kuudra}`])
        }
    }
    return kuudra_array
}

async function format_large_numbers(num) {
    if (num >= 1000000000 || num * -1 >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/.0$/, '') + 'B';
     }
     if (num >= 1000000 || num * -1 >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/.0$/, '') + 'M';
     }
     if (num >= 1000 || num * -1 >= 1000) {
        return (num / 1000).toFixed(1).replace(/.0$/, '') + 'K';
     }
     return num;
}

async function main(message_content) {
    const uuid = await get_uuid(message_content.split(" ")[1])
    if (!uuid || !uuid[0]) {
        return "Invalid Username please check the spelling and try again!";
    }
    const profiles_request = await profilesHypixelRequest(uuid[0])
    const current_profile = await currentProfile(profiles_request)
    if (!current_profile) {
        return "Invalid stats or smth try again!"
    }
    const user_data = current_profile[0][uuid[0]]
    const skyblock_level = await get_skyblock_level(user_data.leveling)
    const dungeon_level = parseInt(await dungeon_to_level(user_data.dungeons))
    const slayers = await get_slayer_levels(user_data.slayer.slayer_bosses)
    const skill_average = await get_skill_average(user_data.player_data.experience)
    const kuudra_stats = await get_kuudra_stats(user_data.nether_island_player_data)
    const networth = await get_networth_and_weight(uuid[0], current_profile[1])
    const color = "FFBCDA"
    let url = `http://23.101.138.21:3000/api/embed?author=Made%20by%20Knax&title=Stats%20for%20${uuid[1]}&imageurl=https://mc-heads.net/body/${uuid[0]}/left&hexcolor=${color}&redirect=https%3A//sky.shiiyu.moe/stats/${uuid[0]}&description=🌳%20Skill%20Average:%20${skill_average}%0A💀%20Dungeons:%20${dungeon_level}%0A🐀%20Skyblock%20Level:%20${skyblock_level}%0A🏋%20Weight:%20${networth[7].toFixed(2)}%0A🪓%20Slayers:%20${slayers.join("/")}%0A💰%20Networth:%20${await format_large_numbers(networth[0])}%20(Soulbound:%20${await format_large_numbers(parseInt(networth[0]) - parseInt(networth[1]))})%20Coins:%20${await format_large_numbers(parseInt(networth[2]) + parseInt(networth[3]))}%0A🌚%20HOTM:%20${networth[6]}%20(Mithril%20Powder:%20${await format_large_numbers(networth[4])}%20%2B%20Gemstone%20Powder:%20${await format_large_numbers(networth[5])})%0A%20🌋%20Kuudra%20Faction:%20${kuudra_stats[0].toUpperCase()}%0A🧙%20Mage%20Rep:%20${await format_large_numbers(kuudra_stats[1])}%20%0A🗡️%20Barbarian%20Rep:%20${await format_large_numbers(kuudra_stats[2])}`
    return url
}


module.exports = {
    get_uuid,
    profilesHypixelRequest,
    currentProfile,
    dungeon_to_level,
    get_skyblock_level,
    get_dungeon_level_by_exp,
    slayer_level_9,
    get_slayer_levels,
    get_skills_by_exp,
    get_average_of_array,
    get_skill_average,
    get_networth_and_weight,
    get_kuudra_stats,
    main,
    format_large_numbers,
  };