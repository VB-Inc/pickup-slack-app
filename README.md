## Pickup Slack Bot

Command examples

- `/pickup` : Will pick the random person from channel and let them know who picked them up
- `/pickup ?{message}` : Will pick the random person from channel and let them know why they are picked up with a message
- `/pickup ?{message} --online` : Will do the same as above, but `--online` will filter the pickup from online users
- `/pickup list create @user1 @user2` : Will create a list of people, which can be used to pick up
- `/pickup ?{message} --list={listId}` : Will pick the random person from the list and let them know why they are picked up with a message
- `/pickup rotation create standup --list={listId}` : Will create a round-robin rotation for standup and assign that list of people with that rotation
- `/pickup ?{message} --rotation={rotationId}` : Will pick next person from rotation and let them know why they are picked up with a message
- `/pickup --rotation-log --rotation={rotationId} @user`: Will add rotation log for the day, on the name of that person, to continue object of round-robin rotation
- `/pickup ?{message} --rotation={rotationId} --usersCount={usersCount}` : Will pick next persons as per count passed to rotation and let them know why they are picked up with a message

#### How to run the project on Slack?

- Switch to `dev` branch
- Install dependencies with `yarn install`
- Run the project with `yarn start`
- Setup ngrok. Doc - https://ngrok.com/
- Run another terminal window with `ngrok http 3000`.
- To integrate this local server with existing slack app, checkout `pickly-app-local.mp4` video in this directory.
- And that's it, your server is running and slack app is responding to local development 🎉
