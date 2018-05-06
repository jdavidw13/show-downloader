"use strict"

const RssParser = require("rss-parser");
const fuzzy = require("fuzzyjs");

async function _getFeed(url) {
    const parser = new RssParser();
    const feed = await parser.parseURL(url);

    if (feed) return feed.items;
    else return [];
}

class EztvRss {
    constructor(url) {
        this._feed = null;
        this.url = url;

        this.getFeed = this.getFeed.bind(this);
        this.filterFeedByTitle = this.filterFeedByTitle.bind(this);
    }

    async getFeed() {
        if (this._feed == null) {
            this._feed = await _getFeed(this.url);
        }
        return this._feed;
    }

    async filterFeedByTitle(search) {
        const feed = await this.getFeed();
        const filtered = feed.filter(item => fuzzy.test(search, item.title));
        return filtered;
    }
}

module.exports = EztvRss;
