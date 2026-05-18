function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";

    let prefix = strs[0];

    for (let i = 1; i < strs.length; i++) {
        let word = strs[i];
        let temp = "";
        let j = 0;

        while (j < prefix.length && j < word.length) {
            if (prefix[j] === word[j]) {
                temp += prefix[j];
            } else {
                break;
            }
            j++;
        }
        prefix = temp;
        if (prefix === "") {
            return "";
        }
    }
    return prefix;
}

console.log(longestCommonPrefix(["flower", "flow", "flight"]));
console.log(longestCommonPrefix(["dog", "racecar", "car"]));
