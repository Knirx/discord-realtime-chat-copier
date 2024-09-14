const fs = require('fs');
const { spawn } = require('child_process');

module.exports = {
    name: "vc",
    description: "Join voice channels with multiple tokens",
    async execute(message, args, client) {
        const channel_id = args[0];
        const amount = parseInt(args[1]);

        if (!channel_id || isNaN(amount) || amount <= 0) {
            return message.reply("Please provide a valid channel ID and a positive integer amount.\nFormat is: !vc `<channel_id>` `<amount_of_bots>`");
        }

        const limit = amount;
        const tokensFilePath = './src/util/vc_tokens.txt';

        fs.readFile(tokensFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading vc_tokens.txt:', err);
                return;
            }

            const tokens = data.trim().split('\n');

            for (let i = 0; i < Math.min(limit, tokens.length); i++) {
                const token = tokens[i].trim();
                const child = spawn('node', ['./src/util/boot_multiple_tokens_vc.js', token, channel_id], { stdio: 'inherit' });

                child.on('exit', (code) => {
                    console.log(`Child process exited with code ${code}`);
                });

                child.on('error', (err) => {
                    console.error('Error occurred in child process:', err);
                });
            }
        });
    }
}