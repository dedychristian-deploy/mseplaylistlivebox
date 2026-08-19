const MSE_HOST = "127.0.0.1";
const MSE_PORT = 8580;
const MSE_PROFILE = "default";

const MSE_URL = `http://${MSE_HOST}:${MSE_PORT}`;

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const body = await response.text();

    return {
        statusCode: response.status,
        body
    };
}

function getPlaylists() {
    return request(`${MSE_URL}/directory/playlists/`, {
        method: "GET",
        headers: {
            Accept: "application/atom+xml"
        }
    });
}

function getElements(path) {
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

function takeElement(elementUrl) {
    return request(`${MSE_URL}/profiles/${MSE_PROFILE}/take`, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: elementUrl
    });
}

function takeOutElement(elementUrl) {
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
    getElements,
    getElement,
    activatePlaylist,
    takeElement,
    takeOutElement
};
