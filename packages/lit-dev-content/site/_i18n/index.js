
const en_gb = require("./en-GB.json");
const zh_cn = require("./zh-CN.json");

function merge(langs) {
    const translations = {};

    const keys = new Set();
    langs.forEach(lang => {
        Object.keys(lang.translation).forEach(key => keys.add(key));
    });

    keys.forEach(key => {
        translations[key] = {};
        langs.forEach(lang => {
            const locale = lang.translation[key];
            locale && (translations[key][lang.name] = locale);
        })
    })
    return translations;
}

const translations = merge([{
    translation: en_gb,
    name: "en-GB"
},{
    translation: zh_cn,
    name: "zh-CN"
}]);

module.exports = translations;
