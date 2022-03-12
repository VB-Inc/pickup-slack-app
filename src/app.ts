import {
    App
} from '@slack/bolt';
import { getRandomItemFromList } from './utils';
import { app, receiver } from './boltApp'
import { createList, getListMembers } from './list/list';
import { isCommandUsingList } from './list/utilities'


app.command('/pickup', createList, async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    let usersIds: string[] = [];
    if (isCommandUsingList(command.text)) {
        // add list usage logic
        const listCommandStart = command.text.search(/--list=[0-9]{0,}/g);
        const listCommandEnd = command.text.indexOf(' ', listCommandStart) >= 0 ? command.text.indexOf(' ', listCommandStart) : command.text.length;
        const listCommand = command.text.substring(listCommandStart, listCommandEnd);
        const listId = listCommand.split("=")[1];
        const members = await getListMembers(Number(listId));
        usersIds = members;
        command.text = command.text.replace(/--list=[0-9]{0,}/g, '')
    } else {
        const membersResponse: any = await app.client.conversations.members({ channel: command.channel_id });
        usersIds = membersResponse.members
    }
    const realUsers = await filterRealUsers(app, usersIds)
    const onlineUsers = command.text.includes('--online') ? await filterOnlineUsers(app, realUsers) : realUsers
    const userChosenId = getRandomItemFromList(onlineUsers).id;

    const text = command.text.replace('--online', '').trim();

    const message = text.length > 0 ? `you are picked up for: ${text}` : `you are picked up randomly by ${command.user_name}. But we don't know why 😔`;
    await say(`Hey <@${userChosenId}> , ${message}`);
});


async function filterOnlineUsers(bot: App, users: any) {
    const usersPresencePromises = await Promise.allSettled(users.map(async (user: any) => {
        const userPresence = await bot.client.users.getPresence({ user: user.id });
        return { presence: userPresence, user }
    }))

    const usersPresence = Array.from(usersPresencePromises).map((settledPromise: any) => settledPromise.value)
    const isOnline = (user: any) => user.presence.presence === 'active';
    const onlineUsers = usersPresence.filter(isOnline);
    console.log(onlineUsers)

    return onlineUsers.map(onlineUser => onlineUser.user)
}

async function filterRealUsers<T>(bot: App, usersID: Array<string>) {
    const usersResponse = await Promise.allSettled(usersID.map(id =>
        bot.client.users.info({ user: id })
    ))

    const isRealUser = (user: any) => !user.is_bot;
    const users = usersResponse.map((response: any) => response.value.user)
    const realUsers = users.filter(isRealUser);

    return realUsers
}

export { app }

module.exports.handler = async (event: any, context: any, callback: any) => {
    const handler = await receiver.start();
    return handler(event, context, callback);
}