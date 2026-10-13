const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const express = require('express');

// سيرفر إبقاء البوت شغال 24/7 على Render
const app = express();
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(process.env.PORT || 3000, () => console.log('Server is running!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
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
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const voiceChannel = message.member.voice.channel;

    if (command === 'play') {
        const query = args.join(' ');
        if (!query) return message.channel.send('❌ اكتب اسم الأغنية أو الرابط!');
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في روم صوتي أولاً!');

        try {
            await client.distube.play(voiceChannel, query, {
                textChannel: message.channel,
                member: message.member,
            });
        } catch (error) {
            console.error(error);
            message.channel.send(`❌ حدث خطأ: ${error.message}`);
        }
    }

    if (command === 'stop') {
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في نفس الروم!');
        try {
            await client.distube.stop(message.guild);
            message.channel.send('⏹️ تم إيقاف التشغيل!');
        } catch (error) {
            message.channel.send('❌ لا توجد أغنية شغالة حالياً!');
        }
    }

    if (command === 'skip') {
        if (!voiceChannel) return message.channel.send('❌ لازم تكون في نفس الروم!');
        try {
            await client.distube.skip(message.guild);
            message.channel.send('⏭️ تم تخطي الأغنية!');
        } catch (error) {
            message.channel.send('❌ ما فيه أغنية بعدها!');
        }
    }
});

// قراءة التوكن من متغير البيئة
client.login(process.env.DISCORD_TOKEN);
