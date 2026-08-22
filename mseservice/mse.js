const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../config.json");

function getConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function getMseConfig() {
    const config = getConfig();

    const MSE_HOST = config.mse.host;
    const MSE_PORT = config.mse.port;
    const MSE_PROFILE = config.mse.profile;
    const MSE_URL = `http://${MSE_HOST}:${MSE_PORT}`;
    const PLAYLIST_ID = config.playlist.playlistid;

    return {
        MSE_HOST,
        MSE_PORT,
        MSE_PROFILE,
        MSE_URL,
        PLAYLIST_ID
    };
}

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const body = await response.text();

    return {
        statusCode: response.status,
        body
    };
}

function getPlaylists() {
    const { MSE_URL } = getMseConfig();

    return request(`${MSE_URL}/directory/playlists/`, {
        method: "GET",
        headers: {
            Accept: "application/atom+xml"
        }
    });
}

async function getPlaylistActivation() {
    const { MSE_URL, PLAYLIST_ID } = getMseConfig();

    const response = await request(
        `${MSE_URL}/activation/storage/playlists/${PLAYLIST_ID}`,
        {
            method: "GET",
            headers: {
                Accept: "application/vnd.vizrt.playlistactivation+xml"
            }
        }
    );

    return {
        ...response,
        playlistId: PLAYLIST_ID
    };
}

function getElements(path) {
    const { MSE_URL } = getMseConfig();

    return request(`${MSE_URL}${path}`, {
        method: "GET",
        headers: {
            Accept: "application/atom+xml"
        }
    });
}

function getElement(url) {
    return request(url, {
        method: "GET",
        headers: {
            Accept: "application/vnd.vizrt.payload+xml"
        }
    });
}

function activatePlaylist(uuid) {
    const { MSE_URL, MSE_PROFILE } = getMseConfig();

    const body = `<playlistactivation>
  <active_on_profile>${MSE_URL}/profiles/${MSE_PROFILE}</active_on_profile>
</playlistactivation>`;

    return request(`${MSE_URL}/activation/storage/playlists/${uuid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/vnd.vizrt.playlistactivation+xml"
        },
        body
    });
}

function cleanupPlaylist(uuid) {
    const { MSE_URL, MSE_PROFILE } = getMseConfig();

    return request(`${MSE_URL}/profiles/${MSE_PROFILE}/cleanup`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: `/element_collection/storage/playlists/${uuid}`
    });
}

function takeElement(elementUrl) {
    const { MSE_URL, MSE_PROFILE } = getMseConfig();

    return request(`${MSE_URL}/profiles/${MSE_PROFILE}/take`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: elementUrl
    });
}

function takeOutElement(elementUrl) {
    const { MSE_URL, MSE_PROFILE } = getMseConfig();

    return request(`${MSE_URL}/profiles/${MSE_PROFILE}/out`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: elementUrl
    });
}

module.exports = {
    getPlaylists,
    getPlaylistActivation,
    getElements,
    getElement,
    activatePlaylist,
    cleanupPlaylist,
    takeElement,
    takeOutElement
};
