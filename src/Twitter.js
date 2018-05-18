"use strict"

const config = require("config");
const Twitter = require("twitter");
const log = require("./Logger");

function getConsumerKey() {
    if (process.env.CONSUMER_KEY) return process.env.CONSUMER_KEY;

    let val = config.get("twitter.consumerKey");
    if (!val || 0 === val.length) throw "no process.env.CONSUMER_KEY or config \"twitter.consumerKey\"";

    return val;
}

function getConsumerSecret() {
    if (process.env.CONSUMER_SECRET) return process.env.CONSUMER_SECRET;

    let val = config.get("twitter.consumerSecret");
    if (!val || 0 === val.length) throw "no process.env.CONSUMER_SECRET or config \"twitter.consumerSecret\"";

    return val;
}

function getAccessToken() {
    if (process.env.ACCESS_TOKEN) return process.env.ACCESS_TOKEN;

    let val = config.get("twitter.accessToken");
    if (!val || 0 === val.length) throw "no process.env.ACCESS_TOKEN or config \"twitter.accessToken\"";

    return val;
}

function getAccessTokenSecret() {
    if (process.env.ACCESS_TOKEN_SECRET) return process.env.ACCESS_TOKEN_SECRET;

    let val = config.get("twitter.accessTokenSecret");
    if (!val || 0 === val.length) throw "no process.env.ACCESS_TOKEN_SECRET or config \"twitter.accessTokenSecret\"";

    return val;
}

function getValidUserIds() {
    if (process.env.VALID_USER_IDS) return process.env.VALID_USER_IDS;

    let val = config.get("twitter.validUserIds");
    if (!val || 0 === val.length) throw "no process.env.VALID_USER_IDS or config \"twitter.validUserIds\"";

    return val;
}

let client = null;
function getClient() {
    if (client == null) {
        client = new Twitter({
            consumer_key: getConsumerKey(),
            consumer_secret: getConsumerSecret(),
            access_token_key: getAccessToken(),
            access_token_secret: getAccessTokenSecret()
        });
    }
    return client;
}

/**
 * @returns {Tweet} returns the posted status
 * @example
 * {
 *     id: number,
 *     id_str: str,
 *     text: ...,
 *     in_reply_to_status_id: ... or null,
 *     in_reply_to_status_id_str: ... or null,
 *     in_reply_to_user_id: ... or null,
 *     in_reply_to_user_id_str: ... or null,
 *     in_reply_to_screen_name: ... or null,
 * }
 */
async function tweet(msg) {
    log.info("tweeting [%s]", msg);
    return getClient().post("statuses/update", {status: msg});
}

/**
 * @param {String} sinceId - the starting tweet id from which to retrieve tweets
 * @param {Array<String>} pendingResponses - array of tweet ids which are pending a response from a valid user
 * @retunrs {Map} pendingResponse ids to tweets
 */
async function getReplies(sinceId, pendingResponses) {
    //return getClient().get("direct_messages/events/show.json?id="+id, {});
    const client = getClient();
    const validUserIds = getValidUserIds();

    let tweets = await client.get("statuses/user_timeline", {user_id: "24541686", since_id: sinceId, trim_user:true});

    tweets = tweets.filter((tweet) => {
        return validUserIds.includes(tweet.user.id_str) 
               && pendingResponses.includes(tweet.in_reply_to_status_id_str);
    });

    const resultMap = new Map();
    tweets.forEach((tweet) => resultMap.set(tweet.in_reply_to_status_id_str, tweet));

    return resultMap;
}

module.exports.tweet = tweet;
module.exports.getReplies = getReplies;
