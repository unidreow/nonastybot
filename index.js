const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { token, clientId } = require('./config.json'); // Remove guildId

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

const badWordsFilePath = path.join(__dirname, 'badWords.json');
let badWords = [];

try {
    const rawData = fs.readFileSync(badWordsFilePath);
    badWords = JSON.parse(rawData);
    client.badWords = badWords;
} catch (error) {
    console.error('Failed to load bad words:', error);
    client.badWords = [];
}

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

async function updateCommands() {
    const commands = client.commands.map(command => command.data.toJSON());
    
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        // Fetch and delete global commands
        const existingGlobalCommands = await rest.get(Routes.applicationCommands(clientId));
        console.log('Existing global commands:', existingGlobalCommands);

        const existingGlobalCommandNames = new Set(existingGlobalCommands.map(cmd => cmd.name));
        const newGlobalCommandNames = new Set(commands.map(cmd => cmd.name));

        const globalCommandsToDelete = existingGlobalCommands.filter(cmd => !newGlobalCommandNames.has(cmd.name));

        if (globalCommandsToDelete.length > 0) {
            console.log('Deleting old global commands.');
            for (const command of globalCommandsToDelete) {
                console.log(`Deleting global command: ${command.name} (ID: ${command.id})`);
                await rest.delete(Routes.applicationCommand(clientId, command.id));
            }
        } else {
            console.log('No old global commands to delete.');
        }

        // Register new commands globally
        console.log('Registering new commands globally.');
        await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log('Successfully refreshed application (/) commands globally.');
    } catch (error) {
        console.error('Error updating commands:', error);
    }
}

// Log in and update commands
client.login(token).then(() => {
    updateCommands();
});
