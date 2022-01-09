function getRandomItemFromList<T>(list: Array<T>) {
    return list[Math.floor((Math.random() * list.length))];
}

export { getRandomItemFromList }