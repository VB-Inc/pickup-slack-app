require('dotenv').config();
import { App, AwsLambdaReceiver } from '@slack/bolt';

const receiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET || ''
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    receiver: receiver
});

export { app, receiver };