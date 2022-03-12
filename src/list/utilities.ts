const listUsageRegex = /--list=/g;
const isCommandUsingList = (command: string) => {
    if (listUsageRegex.test(command)) {
        return true;
    } else {
        return false
    }
}

export { isCommandUsingList }