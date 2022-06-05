import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { getUserProfilesFromConversation } from '../user'
import database from '../db-instance';

const addUsersInDatabase = async (userIds: string[]) => {
    const usersInDatabase = await database.user.findMany({
        where: {
            id: {
                in: userIds
            }
        },
        select: {
            id: true
        }
    });

    const idsInDatabase = usersInDatabase.map(user => user.id);
    const userIdsNotInDatabase = userIds.filter(id => !idsInDatabase.includes(id));
    if (userIdsNotInDatabase.length === 0) {
        return;
    }

    userIdsNotInDatabase.forEach(async (userId) => {
        await database.user.create({
            data: {
                id: userId
            }
        })
    })
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

    if (usersToAdd) {
        const userIdsToAdd = usersToAdd.map(user => user?.id);
        await addUsersInDatabase(userIdsToAdd as string[]);
    }

    let userIds: { id: string; }[] = [];
    usersToAdd.forEach(user => {
        if (user?.id) {
            // FIXME: refactor this typescript hack
            userIds.push({ id: (user.id as string) });
        }
    });

    const list =
        await database.list.create({
            data: {
                channelId: command.channel_id,
                users: {
                    connect: [
                        ...userIds
                    ]
                }
            }
        })
    // Store channelId, list of members ID and listName

    await database.$disconnect();
    await say(`List - '${list.id}' created. Use this list anytime for picking up a random member`);
}

const getListMembers = async (listId: string) => {
    await database.$connect();

    const members = await database.list.findFirst({
        where: {
            id: listId
        }
    }).users();

    return members.map(member => member.id);
}

export { createList, getListMembers }