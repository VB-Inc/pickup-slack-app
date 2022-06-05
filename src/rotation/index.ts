import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import database from '../db-instance'
import { getOptionFromText } from '../utils'

const createRotationRegex = /^rotation create /g;
const createRotation: Middleware<SlackCommandMiddlewareArgs> = async ({ command, say, ack, next }) => {
    if (!createRotationRegex.test(command.text)) {
        return await next();
    }
    await database.$connect();

    const text = command.text.replace(createRotationRegex, '').trim();
    const { value, text: updatedText } = getOptionFromText(text, 'list');
    const list = await database.list.findFirst({ where: { id: value } });

    if (!list) {
        return ack('Please enter valid list id for this rotation command');
    }

    const rotationName = updatedText.trim();

    if (rotationName.length === 0) {
        return ack('Please enter a valid rotation name');
    }

    const rotation = await database.rotation.create({
        data: {
            name: rotationName,
            listId: list.id,
        }
    })

    await database.$disconnect();
    await say(`Rotation id - ${rotation.id} created. Use this rotation id anytime for scheduling`);
}

export { createRotation }