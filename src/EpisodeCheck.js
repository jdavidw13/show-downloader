"use strict"

const config = require("config");
const db = require("./Db");
const EztvRss = require("./EztvRss");
const log = require("./Logger");

async function watchEpisode(episode) {
    db.addEpisodeWatch(episode);
}

/**
 * gets the eztv rss feed and parses it for episodes to add to the watch db
 */
async function checkFeed() {
    const shows = await db.getShows();
    if (shows.length < 1) {
        console.warn("no shows, skipping feed check");
        return;
    }

    const eztvFeedUrl = config.get("eztv.rssUrl");
    if (!eztvFeedUrl) {
        console.error("no config for eztv.rssUrl, skipping feed check");
        return;
    }

    const rss = new EztvRss(eztvFeedUrl);
    log.log("checking eztv rss", eztvFeedUrl);

    shows.forEach(async (show) => {
        const episodes = await rss.filterFeedByTitle(show.show);
        if (episodes.length < 1) return;

        episodes.forEach(watchEpisode);
    });
}

module.exports.checkFeed = checkFeed;

