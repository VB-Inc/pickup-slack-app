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
        const userChoosenId = getRandom(realUsers).id;

        await say(`Hey <@${userChoosenId}> , you are the picked up randomly`);
    });
})();

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