import database from '../db-instance'
import { getOptionFromText } from '../utils'
import { getUserProfilesFromConversation } from '../user'

const addRotationLogRegex = /^--rotation-log/g;
const addRotationLog = async ({ command, ack, next, client }: any) => {
    if (!addRotationLogRegex.test(command.text)) {
        return await next();
    }
    await database.$connect();

    const text = command.text.replace(addRotationLogRegex, '').trim();
    let { value: rotationId, text: updatedText } = getOptionFromText(text, 'rotation');
    const rotation = await database.rotation.findFirst({ where: { id: rotationId } });

    if (!rotation) {
        return ack('Please enter valid rotation id for this rotation command');
    }

    const personsToAdd = updatedText.split(' ').map(name => {
        updatedText = updatedText.replace(name, '');
        return name.replace('@', '');
    });
    // GET channel members
    const usersInCurrentConversation = await getUserProfilesFromConversation(command.channel_id, ack);

    // Search members id in the list
    const userToAdd = usersInCurrentConversation.find(user => user.name === personsToAdd[0]);

    const userId = (userToAdd?.id as string) ?? ''

    await database.rotationLog.create({
        data: {
            date: new Date(),
            rotationId: rotationId,
            userId
        }
    })

    await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        text: 'Successfully added user to rotation log'
    })

    return true;
}

export { addRotationLog }