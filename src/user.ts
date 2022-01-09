import { type UsersInfoResponse } from '@slack/web-api'
import { app } from './boltApp'

async function getUserProfilesFromConversation(conversationId: string, ack: any): Promise<UsersInfoResponse[]> {
    const membersResponse = await app.client.conversations.members({ channel: conversationId });
    if (!membersResponse.members) {
        return ack('Found no members in channel')
    }

    const getUserProfile = (id: string) => app.client.users.info({ user: id })
    const userProfilesResponse = await Promise.allSettled(membersResponse.members.map(getUserProfile))
    const users: UsersInfoResponse[] = userProfilesResponse.map((response: any) => response.value.user)
    return users;
}

export { getUserProfilesFromConversation }