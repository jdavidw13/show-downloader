"use strict"

const config = require("config");
const db = require("./Db");
const EztvRss = require("./EztvRss");
const log = require("./Logger");
const twitter = require("./Twitter");
const util = require("util");

async function watchEpisode(episode) {
    const episodeWatched = await db.containsEpisode(episode);
    if (episodeWatched) return;

    const msg = buildNewWatchTweetMessage(episode);
    const tweet = await twitter.tweet(msg);
    episode.tweet_id = tweet.id_str;
    const watch = await db.addEpisodeWatch(episode);
    return watch;
}

function buildNewWatchTweetMessage(episode) {
    const size = Number.parseFloat(episode.enclosure.length / 1000000).toFixed(2) + " MB";
    const message = util.format("%s\n%s", episode.title, size);
    return message;
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

