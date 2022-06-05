import {
    App
} from '@slack/bolt';
import { getRandomItemFromList, getOptionFromText } from './utils';
import { app, receiver } from './boltApp'
import { createList, getListMembers } from './list/list';
import { isCommandUsingList } from './list/utilities'
import { createRotation } from './rotation'
import { addRotationLog } from './rotationLog'
import { getRotationMembers, getUserFromRotation, isCommandUsingRotation } from './rotation/utilities';


app.command('/pickup', addRotationLog, createList, createRotation, async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    let usersIds: string[] = [];
    const isCommandWithRotation = isCommandUsingRotation(command.text)
    if (isCommandUsingList(command.text)) {
        // add list usage logic
        const { value, text } = getOptionFromText(command.text, 'list');
        const members = await getListMembers(Number(value));
        usersIds = members;
        command.text = text;
    } else if (isCommandWithRotation) {
        // add rotation usage logic
        const { value, text } = getOptionFromText(command.text, 'rotation');
        const members = await getRotationMembers(Number(value));
        usersIds = members;
        command.text = text;
    }

    else {
        const membersResponse: any = await app.client.conversations.members({ channel: command.channel_id });
        usersIds = membersResponse.members
    }
    const realUsers = await filterRealUsers(app, usersIds)
    const onlineUsers = command.text.includes('--online') ? await filterOnlineUsers(app, realUsers) : realUsers;
    const { value: usersCount, text: newText } = getOptionFromText(command.text, 'usersCount');
    command.text = newText
    const userChosenId: string | Array<string> = isCommandWithRotation ? (await getUserFromRotation(onlineUsers, usersCount ? Number(usersCount) : undefined)).map(user => user.id) : getRandomItemFromList(onlineUsers).id;

    const text = command.text.replace('--online', '').trim();

    const message = text.length > 0 ? `you are picked up for: ${text}` : `you are picked up randomly by ${command.user_name}. But we don't know why 😔`;

    await say(`Hey ${Array.isArray(userChosenId) ? userChosenId.map(id => `<@${id}>`).join(' , ') : `<@${userChosenId}>`} , ${message}`);
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