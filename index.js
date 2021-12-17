require('dotenv').config();
const { App } = require('@slack/bolt');

const bot = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
    // Start the app
    await bot.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');

    bot.command('/pickup', async ({ command, ack, say }) => {
        const membersResponse = await bot.client.conversations.members({ channel: command.channel_id });

        // Acknowledge command request
        await ack();
        const realUsers = await filterRealUsers(bot, membersResponse.members)
        const onlineUsers = command.text.includes('--online') ? await filterOnlineUsers(bot, realUsers) : realUsers
        const userChosenId = getRandom(onlineUsers).id;

        const text = command.text.replace('--online', '').trim();

        const message = text.length > 0 ? `you are picked up for: ${text}` : `you are picked up randomly by ${command.user_name}. But we don't know why 😔`;
        await say(`Hey <@${userChosenId}> , ${message}`);
    });
})();

async function filterOnlineUsers(bot, users) {
    const usersPresencePromises = await Promise.allSettled(users.map(async (user) => {
        const userPresence = await bot.client.users.getPresence({ user: user.id });
        return { presence: userPresence, user }
    }))

    const usersPresence = Array.from(usersPresencePromises).map(settledPromise => settledPromise.value)
    const isOnline = user => user.presence.presence === 'active';
    const onlineUsers = usersPresence.filter(isOnline);
    console.log(onlineUsers)

    return onlineUsers.map(onlineUser => onlineUser.user)
}

async function filterRealUsers(bot, usersID) {
    const usersResponse = await Promise.allSettled(usersID.map(id =>
        bot.client.users.info({ user: id })
    ))

    const isRealUser = (user) => !user.is_bot;
    const users = usersResponse.map(response => response.value.user)
    const realUsers = users.filter(isRealUser);

    return realUsers
}

function getRandom(list) {
    return list[Math.floor((Math.random() * list.length))];
}