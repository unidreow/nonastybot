const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Define the path to the JSON file
const jsonFilePath = path.join(__dirname, 'badword_counts.json');

async function readJSON() {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // If the file does not exist, resolve with an empty object
                    resolve({});
                } else {
                    reject(err);
                }
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topbadwords')
        .setDescription('Shows the user who has said the most bad words'),
    async execute(interaction) {
        try {
            // Read the JSON file
            const data = await readJSON();
            
            if (Object.keys(data).length === 0) {
                return await interaction.reply('No bad word data available.');
            }

            // Find the user with the most bad word counts
            let topUser = null;
            let maxCount = 0;

            for (const [userId, counts] of Object.entries(data)) {
                const totalBadWords = Object.values(counts).reduce((sum, count) => sum + count, 0);

                if (totalBadWords > maxCount) {
                    maxCount = totalBadWords;
                    topUser = userId;
                }
            }

            if (!topUser) {
                return await interaction.reply('No bad word data available.');
            }

            // Fetch user details
            const topUserDetails = await interaction.client.users.fetch(topUser);
            const userCountData = data[topUser];
            const formattedCounts = Object.entries(userCountData)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');

            await interaction.reply(
                `The user with the most bad words is ${topUserDetails.tag}.\n` +
                `Total counts:\n${formattedCounts}`
            );
        } catch (error) {
            console.error('Failed to execute /topbadwords command:', error);
            await interaction.reply('An error occurred while fetching the top bad words user.');
        }
    },
};
