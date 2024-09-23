# Discord-Chat-Copier

# Disclaimer
**This repository is for educational purposes only, the use of this code is your responsibility.

I take NO responsibility and/or liability for how you choose to use any of the source code available here. By using any of the files available in this repository, you understand that you are AGREEING TO USE AT YOUR OWN RISK. Once again, ALL files available here are for EDUCATION and/or RESEARCH purposes ONLY.**

### A script that copies any users Message in a server into a new server. 

### Config and .env

Update src/util/jsons/config.json. The keys of the channel_ids are channel IDs you want to copy the user messages from and the values are the channels you want to copy them to.
In the important_channel_ids only the **VALUES** should be changed as the keys are the channel IDs of the official [KuudraGang](https://discord.gg/kuudra) discord server and the bot with the KUUDRA_BOT_TOKEN in the .env file copies the bot messages. Therefore don't change the keys of the important_channel_ids. 
Every key that has the "_copy" at the end is used for your server, ex. server_id_copy = your server id and server_id = the server id you copy the messages from.

The BOT_TOKEN in the .env file should be the same token as the ACTUAL_USER_TOKEN_WITH_PERMS
The ACUTAL_USER_TOKEN_WITH_PERMS has to be a token that is in BOTH the servers, you copy from and you copy to, and has to have Administrator permissions in your server. 
The KUUDRA_BOT_TOKEN should be your own bot token that has Administrator permissions in your server to copy messages from the KuudraGang bot.
HYPIXEL_API_KEY is self explanatory.
The HOST is the domain/ip:port where you host your Skyhelper API to display playerstats as a selfbot.
The SKYHELPER_KEY is your own API key you create when hosting the Skyhelper API.

The OWNER_ID can be any ID of the someone who owns the server or should have permissions to do changes. There are commands that can be used by only this ID 

### Setup

Put your Tokens in the src/util/tokens.txt file
You can paste in the same tokens in the src/util/vc_tokens.txt to use them as vc bots.
Paste in a list of statuses you want the **built in token onliner** to assigned the users in src/util/statuses.txt 

Each user of the server you wanna copy the messages from gets assigned to one token. If you don't have enough tokens you can paste in the same tokens over and over again in the tokens.txt file. 
After a token is assigned to a user the one line in the tokens.txt gets deleted, make sure the tokens.txt file is NEVER empty. Paste in all the tokens you use **once** in the src/util/tokens_one_time.txt so you can always copy them and paste in the tokens.txt file if you ever need some. 

Delete everything of the JSON files listed below located in src/util/jsons:
- token_user_ids.json
- suggestions.json
- role_ids.json
- message_ids.json
- emoji_ids.json
- channel_ids.json
- bot_commands.json

All these files should only contain {} 

After you have completed these steps start up the bot.

### How it works

Make sure you are using the account that has the same ID as the OWNER_ID in the .env file otherwise it wont work!

Use the command "!copy <server_you_copy_**from**> <server_you_copy_**to**>

Wait for the script to finish its magic. 


If setup correctly you should now be copying the messages that get sent after the bot has started to the new server. 

### Any further questions?
DM @knaxv9 on discord

