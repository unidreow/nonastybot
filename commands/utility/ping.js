const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong! and the bot latency'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		const ping = sent.createdTimestamp - interaction.createdTimestamp;
		const heartbeat = Math.round(interaction.client.ws.ping);
		await interaction.editReply(`Pong! 🏓\nLatency is ${ping}ms.\nAPI Latency is ${heartbeat}ms.`);
	},
};
