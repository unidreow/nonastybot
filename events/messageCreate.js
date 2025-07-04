const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// File path to store the user data
const dataFilePath = path.join(__dirname, 'badWordData.json');

// Function to build a regex pattern for a bad word
const buildBadWordRegex = (badWord) => {
    // Define common letter substitutions
    const replacements = {
        a: '4|@|α|а|𝒶|𝓪|𝑎|𝕒|ａ|ᵃ|𝔞|𝐚|ꍏ|ᴀ|🅰|ⓐ|ค|ą|ǟ|𝗮|𝘢|𝙖|𝚊|Λ|å|₳|卂|ﾑ|ᗩ',
        b: '8|ß|в|б|𝔟|𝖇|𝓫|𝒷|𝕓|ｂ|ᵇ|𝐛|ꌃ|ʙ|🅱|ⓑ|๒|ც|๖|ɮ|Ⴆ|𝗯|Յ',
        c: 'ç|¢|ς|𝔠|𝖈|𝓬|𝒸|𝕔|ｃ|ꉓ|ᴄ|🅲|ⓒ|ᶜ|ƈ|𝐜|ҽ|𝗰|ᄃ|₵|匚|ᑕ',
        d: '|)|ϲ|д|𝔡|𝖉|𝓭|𝒹|𝕕|ｄ|ᵈ|𝐝|ꀸ|ᴅ|🅳|ⓓ|๔|ɖ|ԃ|𝗱|Đ|り',
        e: '3|ε|э|𝔢|𝖊|𝓮|𝒺|𝕖|ｅ|ᵉ|𝐞|ꍟ|ᴇ|🅴|ⓔ|є|ɛ|ē|ԑ|𝗲|Σ|Ɇ',
        f: 'ƒ|φ|₣|𝔣|𝖋|𝓯|𝒻|𝕗|ｆ|𝐟|ꎇ|ꜰ|🅵|ⓕ|ᶠ|Ŧ|ʄ|𝐟|𝘧|𝙛|Ⱡ|千|Բ',
        g: '6|9|ϒ|г|𝔤|𝖌|𝓰|𝒢|𝕘|ｇ|ᵍ|𝐠|ꁅ|ɢ|🅶|ⓖ|ﻮ|ɠ|ງ|𝗴|G|ム',
        h: '|-|#|ħ|𝔥|𝖍|𝓱|𝒽|𝕙|ｈ|𝐡|ꃅ|ʜ|🅷|ⓗ|ʰ|ɧ|ɦ|ԋ|𝗵|Н|Ⱨ',
        i: '1||!|ί|ι|и|𝔦|𝖎|𝓲|𝒾|𝕚|ｉ|ᵢ|𝐢|ꀤ|ɪ|🅸|ⓘ|ⁱ|ı|ɨ|𝗶|ł|丨',
        j: 'j|;|𝔧|𝖏|𝓳|𝒿|𝕛|ｊ|𝐣|ꀭ|ᴊ|🅹|ⓙ|ʲ|ʝ|ว|ʝ|𝗷|ﾌ|ᒍ',
        k: '|<|κ|к|𝔨|𝖐|𝓴|𝒦|𝕜|ｋ|𝐤|ꀘ|ᴋ|🅺|ⓚ|ᵏ|ƙ|ӄ|𝗸|K|Ⱪ',
        l: '1|||ł|𝔩|𝖑|𝓵|𝒻|𝕝|ｌ|𝐥|꒒|ʟ|🅻|ⓛ|ˡ|ɭ|Ɩ|ʅ|𝗹|ᄂ|Ⱡ|ւ|Ը|Լ|Ն',
        m: '|v|^^|м|мм|𝔪|𝖒|𝓶|𝓂|𝕞|ｍ|ᵐ|𝐦|ꂵ|ᴍ|🅼|ⓜ|๓|ɱ|໓|𝗺|M|ᗰ',
        n: '|/|и|η|н|𝔫|𝖓|𝓷|𝒩|𝕟|ｎ|𝐧|ꈤ|ɴ|🅽|Ⓝ|ⁿ|ภ|ŋ|ռ|ɳ|𝗻|几|刀|Ո|Ռ|ո',
        o: '0|ο|θ|о|𝔬|𝖔|𝓸|𝒪|𝕠|ｏ|ᵒ|𝐨|ꀎ|ᴜ|🅾|ⓞ|๏|ơ|໐|𝗼|Ө|Ø|ㄖ|の|Փ',
        p: '|*|ρ|р|𝔭|𝖕|𝓹|𝒫|𝕡|ｐ|𝐩|ꉣ|ᴘ|🅿|ⓟ|ᵖ|ק|℘|ք|𝗽|Ᵽ|卩|ᑭ',
        q: '9|θ|գ|𝔮|𝖖|𝓺|𝒬|𝕢|ｑ|𝐪|ꆰ|Q|🆀|ⓠ|զ|𝗾|ϙ|Ɋ|ゐ|ᑫ',
        r: '|2|я|г|𝔯|𝖗|𝓻|𝒭|𝕣|ｒ|𝐫|ꋪ|ʀ|🆁|ⓡ|ʳ|г|ཞ|ɾ|𝗿|Я|尺|Ր',
        s: '5|$|ς|ш|𝔰|𝖘|𝓼|𝒮|𝕤|ｓ|𝐬|ꌗ|ꜱ|🆂|ⓢ|ˢ|ร|ʂ|Ş|ֆ|𝗌|Ƨ|§|丂|ᔕ|Տ|Ց',
        t: '7|τ|†|𝔱|𝖙|𝓽|𝒯|𝕥|ｔ|𝐭|꓄|ᴛ|🆃|ⓣ|ᵗ|Շ|ɬ|ƚ|𝘁|Ƭ|Ɽ|ㄒ|ｲ|Ե',
        u: '|_| |υ|𝔲|𝖚|𝓾|𝒰|𝕦|ｕ|𝐮|ꀎ|ᴜ|🆄|ⓤ|ᵘ|ย|ų|น|𝗎|Ц|Ʉ|ㄩ|ひ|Ս|Ս|Ա|Մ',
        v: '|/|ν|v|𝔳|𝖛|𝓿|𝒱|𝕧|ｖ|𝐯|ꃴ|ᴠ|🆅|ⓥ|ᵛ|ש|۷|ง|𝗏|ʋ|V|√',
        w: '|/|vv|ω|ш|𝔴|𝖜|𝓦|𝒲|𝕨|ｗ|𝐰|ꅏ|ᴡ|🆆|ⓦ|ʷ|ฬ|ῳ|ຟ|ա|Щ|₩|山|ᗯ',
        x: '×|χ|ж|𝔵|𝖝|𝓧|𝒳|𝕩|ｘ|𝐱|ꊼ|x|🆇|ⓧ|ˣ|א|ҳ|Ӽ|Ӿ|乂|᙭',
        y: '|/|γ|ү|𝔶|𝖞|𝓨|𝒴|𝕪|ｙ|𝐲|ꌩ|ʏ|🆈|ⓨ|ʸ|ץ|ყ|ฯ|𝗒|Y|Ɏ|ㄚ|ﾘ',
        z: '2|ζ|з|𝔷|𝖟|𝓏|𝒵|𝕫|ｚ|𝐳|ꁴ|ᴢ|🆉|ⓩ|ᶻ|չ|ʑ|ຊ|ʐ|ȥ|𝘇|Ⱬ|乙|ᘔ|Հ'
    };

    // Define possible separators
    const separators = '\\s|\\.|_|-|\\!|\\@|\\#|\\$|\\%|\\^|\\&|\\*|\\(|\\)|\\+|\\{|\\}|\\[|\\]|\\:|\\;|\\<|\\>|\\,|\\/|\\?|\\~|\\`';

    // Build regex pattern with substitutions and optional separators between each character
    let pattern = badWord.toLowerCase().split('').map(char => {
        return `[${char}${replacements[char] || ''}]`;
    }).join(`(?:[${separators}]*.)?`);

    pattern = `(?:${pattern}){1,6}`; // how many mistakes a word can have
    pattern = pattern.replace(/\[.\]/g, '');

    return new RegExp(pattern, 'i');
};

// Function to preprocess the message content
const preprocessMessage = (message) => {
    return message
        .replace(/[\s|\.|_|-|!|@|#|$|%|^|&|\*|\(|\)|\+|\{|}|[\]|:|;|<|>|,|\/|\?|~|`]/g, '')
        .replace(/(.)\1{1,}/g, '$1')
        .toLowerCase();
};

// Build regex patterns for all bad words
const buildBadWordsPatterns = (badWords) => {
    return badWords.map(buildBadWordRegex);
};

// Function to load the user data from the JSON file
const loadUserData = () => {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        return JSON.parse(rawData);
    }
    return {};
};

// Function to save the user data to the JSON file
const saveUserData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4));
};

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const userData = loadUserData();

        const preprocessedContent = preprocessMessage(message.content);
        const badWordsPatterns = message.client.badWordsPatterns || buildBadWordsPatterns(message.client.badWords);

        const containsBadWord = badWordsPatterns.some(pattern => pattern.test(preprocessedContent));

        if (containsBadWord) {
            const userId = message.author.id;
            userData[userId] = userData[userId] || { count: 0, words: {} };
            userData[userId].count += 1;

            badWordsPatterns.forEach((pattern, index) => {
                if (pattern.test(preprocessedContent)) {
                    const badWord = message.client.badWords[index];
                    userData[userId].words[badWord] = (userData[userId].words[badWord] || 0) + 1;
                }
            });

            saveUserData(userData);

            try {
                await message.delete();
                console.log(`Deleted message from ${message.author.tag} due to bad word.`);
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }
    },
};
