"use strict"

const WebTorrent = require("webtorrent");
const log = require("./src/Logger");

class RestartableClient {
    constructor() {
        this.client = null;

        this.getClient = this.getClient.bind(this);
    }

    getClient() {
        if (this.client == null) {
            this.client = new WebTorrent();
            this.client.on("error", () => {
                this.client = null;
            });
        }
        return this.client;
    }
}
const clientFactory = new RestartableClient();

/**
 * @param {String} magnetUri - magnet uri of torrent
 * @param {String} downloadDir - directory to place the contents of the torrent
 * @returns {Promise} promise that is resolved when the torrent has finished downloading
 */
async function downloadTorrent(magnetUri, downloadDir) {
    return new Promise((resolve, reject) => {
        const client = clientFactory.getClient();
        client.add(magnetUri, {path: downloadDir}, (torrent) => {
            log.info("starting torrent download", magnetUri);
            torrent.on("done", () => {
                log.info("torrent finished", magnetUri);
                torrent.destroy(resolve);
            });

            torrent.on("error", (err) => {
                reject(err);
            });
        });

        client.on("error", function(err) {
            reject(err);
        });
    });
}

module.exports.downloadTorrent = downloadTorrent;
