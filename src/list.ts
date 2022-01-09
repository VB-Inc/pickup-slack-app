import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getUserProfilesFromConversation } from './user'

class List {
    static _data: Object[] = [];

    static add<T>(obj: T) {
        this._data.push(obj);
    }
}

const createListRegex = /^list create /g;
const createList: Middleware<SlackCommandMiddlewareArgs> = async ({ command, say, ack, next }) => {
    if (!createListRegex.test(command.text)) {
        return await next();
    }

    const text = command.text.replace('list create ', '').trim();
    const peopleToAdd = text.split(' ').map(name => name.replace('@', ''));

    if (peopleToAdd.length < 0) {
        return ack('Please add at least one person to the list');
    }

    // GET channel members
    const usersInCurrentConversation = await getUserProfilesFromConversation(command.channel_id, ack);

    // Search members id in the list
    const usersToAdd = peopleToAdd.map(userName => usersInCurrentConversation.find(user => user.name === userName))

    // Get requested members list array

    const listId = `list-${List._data.length}`;
    List.add({
        id: listId,
        channelId: command.channel_id,
        users: usersToAdd
    })
    // Store channelId, list of members ID and listName

    await say(`${listId} created. Use this list anytime for picking up a random member`);
}

export { createList }