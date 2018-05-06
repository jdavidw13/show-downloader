"use strict"

const util = require("util");
const moment = require("moment");

function _log(logFn) {
    let ts = moment().format("YYYY-MM-DD hha:mm:ss SSS");
    ts = "["+ts+"] -";

    let ignore, args;
    [ignore, ...args] = arguments;

    let logValue = util.format.apply(this, args);
    logFn.apply(this, [ts, logValue]);
}

module.exports.log = function() {
    _log.apply(this, [console.log].concat([...arguments]));
}
module.exports.info = function() {
    _log.apply(this, [console.log].concat([...arguments]));
}
module.exports.warn = function() {
    _log.apply(this, [console.warn].concat([...arguments]));
}
module.exports.error = function() {
    _log.apply(this, [console.error].concat([...arguments]));
}
