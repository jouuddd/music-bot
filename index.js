const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const express = require('express');

// سيرفر إبقاء البوت شغال 24/7
const app = express();
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(process.env.PORT || 3000, () => console.log('Server is running!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// إعداد DisTube مع الملحق المحدث لليوتيوب
client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false,
    plugins: [new YouTubePlugin()],
});

const PREFIX = '!';

client.on('ready', () => {
    console.log(`✅ Logged in successfully as ${client.user.tag}!`);
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
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في نفس الروم!');
        await client.distube.stop(message.guild);
        message.channel.send('⏹️ تم إيقاف التشغيل!');
    }

    if (command === 'skip') {
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في نفس الروم!');
        try {
            await client.distube.skip(message.guild);
            message.channel.send('⏭️ تم تخطي الأغنية!');
        } catch (e) {
            message.channel.send('❌ ما فيه أغاني ثانية بالقائمة!');
        }
    }
});

// قراءة التوكن من متغير البيئة
client.login(process.env.DISCORD_TOKEN);
