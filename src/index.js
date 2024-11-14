require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online.`);
})

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    switch (interaction.commandName) {
        case 'hey':
            interaction.reply(`hey!`);
            break;
        case 'ping':
            interaction.reply(`Pong!`);
            break;
        case 'add':
            const num1 = interaction.options.get('first-number').value;
            const num2 = interaction.options.get('second-number').value;

            interaction.reply(`The sum is ${num1 + num2}`);
            break;
    }
})

client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return;
    }

    console.log(message.content)

    /*
    if (message.content == 'hi') {
        message.reply('fuck O F F CASTIE go play smz3 you fortress')
    }
    */

    switch(message.content) {
        case 'embed':
            const embed = new EmbedBuilder()
            .setTitle('Embed title')
            .setDescription('This is an embed description')
            .setURL('https://justinbohemier.wixsite.com/portfolio/game-design')
            .setColor('Random')
            //.setColor(0xeaeaea);
            .setFields({
                name: 'Field title',
                value: 'Some random value',
                inline: true,
            },
            {
                name: '2nd Field title',
                value: 'Some random value',
                inline: true,
            },
            {
                name: '3rd Field title',
                value: 'Some random value',
                inline: true,
            })
            .setImage('https://pbs.twimg.com/media/GcPyiUlasAEEtPJ?format=jpg&name=900x900')
            .setTimestamp()
            .setFooter({ text: 'Footer text', iconURL: 'https://pbs.twimg.com/media/GcPyiUlasAEEtPJ?format=jpg&name=900x900' })
            ;
        
            message.channel.send({ embeds: [embed] });
            break;
        case 'your':
            message.reply('you\'re*');
            break;
    }

})

client.login(process.env.TOKEN);

