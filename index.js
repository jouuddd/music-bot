const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const express = require('express');

// إنشاء سيرفر وهمي يبقي البوت شغال 24/7 على Render
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(process.env.PORT || 3000, () => console.log('Web server ready!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false,
});

const PREFIX = '!';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const voiceChannel = message.member.voice.channel;

    if (command === 'play' || command === 'p') {
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في روم صوتي!');
        const music = args.join(' ');
        if (!music) return message.channel.send('❌ اكتب اسم الأغنية أو الرابط!');

        client.distube.play(voiceChannel, music, {
            textChannel: message.channel,
            member: message.member,
        });
    }

    if (command === 'stop') {
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في بنفس الروم!');
        await client.distube.stop(message.guild);
        message.channel.send('⏹️ تم إيقاف التشغيل!');
    }

    if (command === 'skip') {
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في بنفس الروم!');
        try {
            await client.distube.skip(message.guild);
            message.channel.send('⏭️ تم تخطي الأغنية!');
        } catch (e) {
            message.channel.send('❌ ما فيه أغاني ثانية بالقائمة!');
        }
    }
});

client.login(process.env.TOKEN);

