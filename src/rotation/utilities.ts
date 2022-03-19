import database from '../db-instance'

const rotationUsageRegex = /--rotation=/g;
const isCommandUsingRotation = (command: string) => {
    if (rotationUsageRegex.test(command)) {
        return true;
    } else {
        return false
    }
}

const getRotationMembers = async (rotationId: number) => {
    await database.$connect();

    const members = await database.rotation.findFirst({
        where: {
            id: rotationId
        }
    }).list().users();

    await database.$disconnect();
    return members.map(member => member.id);
}

const getUserFromRotation = async (users: any[]): Promise<any> => {
    await database.$connect();

    const usersInRotationLogs = await database.rotationLog.findMany({
        where: {
            userId: {
                in: users.map(user => user.id)
            }
        },
        select: {
            user: true
        }
    })

    const usersWithCount = users.map(user => ({ user, count: usersInRotationLogs.filter(userInRotiationLog => userInRotiationLog.user.id === user.id).length }))
    usersWithCount.sort((a, b) => a.count - b.count);
    return usersWithCount[0].user;
}


export { isCommandUsingRotation, getRotationMembers, getUserFromRotation }