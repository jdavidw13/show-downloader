"use strict"

const initNedbAsync = require("nedb-promise");
const log = require("./Logger");

let _watchDb = null;
let _showDb = null;

async function getWatchDb() {
    if (_watchDb == null) {
        let watchDbPath = __dirname + "/../dbs/watchDb.json";
        log.log("initializing watchDB at ", watchDbPath);
        _watchDb = initNedbAsync({
            filename: watchDbPath,
            autoload: true
        });

        await _watchDb.ensureIndex({
            fieldName: "guid",
            unique: true
        });
    }
    return _watchDb;
}

async function getShowDb() {
    if (_showDb == null) {
        let showDbPath = __dirname + "/../dbs/showDb.json";
        log.log("initializing showDB at ", showDbPath);
        _showDb = initNedbAsync({
            filename: showDbPath,
            autoload: true
        });

        // uses _id as index
        /*
        await _showDb.ensureIndex({
            fieldName: "guid",
            unique: true
        });
        */
    }
    return _showDb;
}

/**
 * @param {Object} episode - eztv rss item object
 */
async function addEpisodeWatch(episode) {
    const db = await getWatchDb();
    try {
        await db.insert(episode);
        log.log("added episode watch for \"%s\"", episode.title);
    } catch(err) {
        log.error("attempting to insert non-unique guid ", episode.guid);
    }
}

/**
 * @param {String} guid - guid of document to remove
 * @returns {Integer} number of documents removed
 */
async function removeEpisodeWatch(guid) {
    const db = await getWatchDb();
    const removeCount = await db.remove({guid: guid});
    return removeCount;
}

/**
 * @returns {Array} array of all watched episode objects
 */
async function getWatchedEpisodes() {
    const db = await getWatchDb();
    const results = await db.cfind({}).exec();
    return results;
}

/**
 * @param {String} show - name of the show for watching episodes (used in fuzzy search of eztv rss feed)
 * @returns {boolean} true if show was added, false if show already contained in collection
 */
async function addShow(show) {
    show = show.toLowerCase();
    const db = await getShowDb();

    let docCount = await db.ccount({show: show}).exec();
    if (docCount < 1) {
        await db.insert({show: show});
        log.log("added \"%s\" to showDb", show);
    } else {
        log.log("showDb already contains \"%s\"", show);
    }

    return docCount < 1;
}

/**
 * @returns {Array} array of show objects
 */
async function getShows() {
    const db = await getShowDb();

    const shows = await db.cfind({}).exec();
    return shows;
}


module.exports.addEpisodeWatch = addEpisodeWatch;
module.exports.removeEpisodeWatch = removeEpisodeWatch;
module.exports.getWatchedEpisodes = getWatchedEpisodes;

module.exports.addShow = addShow;
module.exports.getShows = getShows;

