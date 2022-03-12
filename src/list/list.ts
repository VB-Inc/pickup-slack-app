import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getUserProfilesFromConversation } from '../user'
import database from '../db-instance'

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

    await database.$connect();

    let userIds: { id: string; }[] = [];
    usersToAdd.forEach(user => {
        if (user?.id) {
            userIds.push({ id: (user.id as string) });
        }
    });

    const list =
        await database.list.create({
            data: {
                channelId: command.channel_id,
                users: {
                    create: [
                        ...userIds
                    ]
                }
            }
        })
    // Store channelId, list of members ID and listName

    await database.$disconnect();
    await say(`${list.id} created. Use this list anytime for picking up a random member`);
}

const getListMembers = async (listId: number) => {
    await database.$connect();

    const members = await database.list.findFirst({
        where: {
            id: listId
        }
    }).users();

    return members.map(member => member.id);
}

export { createList, getListMembers }