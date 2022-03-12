function getRandomItemFromList<T>(list: Array<T>) {
    return list[Math.floor((Math.random() * list.length))];
}

function getOptionFromText(text: string, option: string) {
    const optionRegex = new RegExp(`--${option}=[0-9|a-z|A-Z]{0,}`, 'g')
    const optionPlacementStart = text.search(optionRegex);
    const optionPlacementEnd = text.indexOf(' ', optionPlacementStart) >= 0 ? text.indexOf(' ', optionPlacementStart) : text.length;
    const optionCommand = text.substring(optionPlacementStart, optionPlacementEnd);
    const optionValue = optionCommand.split('=')[1];

    const newText = text.replace(optionRegex, '').trim();

    return { value: optionValue, text: newText };
}

export { getRandomItemFromList, getOptionFromText }