const { getBaseURL } = require('../constants');
const baseURL = getBaseURL();
const { datastore, fromDatastore } = require('../datastore');
const PLAYLIST = "Playlist";


/**
 * Create a playlist
 * @param name {string} - The name of the playlist; required
 * @param public {boolean} - The public status of the playlist; required
 * @param owner_id {string} - The owner of the playlist; required
 * @param tracks {array of objects} - The tracks in the playlist; optional
 * @returns key of the new playlist
 */
function postPlaylist(name, public, owner_id, tracks) {
    const playlistKey = datastore.key(PLAYLIST);
    const playlist = { 
        "name": name, 
        "public": public, 
        "owner_id": owner_id,
        "tracks": tracks
    };
    const playlistEntity = {
        "key": playlistKey,
        "data": playlist
    }
    return datastore.insert(playlistEntity)
    .then(() => {
        // Add the self url link to the playlist object
        var selfURL = `${baseURL}/playlists/${playlistKey.id}`;
        const newPlaylist = {
            "name": name,
            "public": public,
            "owner_id": owner_id,
            "tracks": tracks,
            "self_url": selfURL
        }
        datastore.save({ 
            "key": playlistKey, 
            "data": newPlaylist
        })
        return playlistKey;
    });
}

/**
 * Get a playlist by id
 * @param playlist_id {integer} - The id of the playlist; required
 * @returns playlist
 */
function getPlaylistByID(playlist_id) {
    const playlistKey = datastore.key([PLAYLIST, parseInt(playlist_id, 10)]);
    return datastore.get(playlistKey)
    .then((entity) => {
        if (entity[0] == undefined || entity[0] == null) {
            return entity;
        } else {
            return entity.map(fromDatastore);
        }
    });
}

/**
 * Get a user's (owner_id) playlists
 * @param owner_id {string} - The owner of the playlist; required
 * @returns array of playlists
 */
function getUsersPlaylists(owner_id) {
    const query = datastore.createQuery(PLAYLIST);
    return datastore.runQuery(query)
    .then((entities) => {
        return entities[0].map(fromDatastore)
        .filter(playlist => playlist.owner_id == owner_id);
    });
}

/**
 * Update a playlist by id
 * @param playlist_id {integer} - The id of the playlist; required
 * @param name {string} - The name of the playlist; requ
 * @param public {boolean} - The public status of the playlist; required
 * @param owner_id {string} - The owner of the playlist; required
 * @param tracks {array of objects} - The tracks in the playlist; required
 * @returns key of the updated playlist
 */
function updatePlaylistByID(playlist_id, name, public, owner_id, tracks) {
    const playlistKey = datastore.key([PLAYLIST, parseInt(playlist_id, 10)]);
    const playlist = {
        "name": name,
        "public": public,
        "owner_id": owner_id,
        "tracks": tracks
    };
    const playlistEntity = {
        "key": playlistKey,
        "data": playlist
    }
    return datastore.update(playlistEntity)
    .then(() => {
        // Add the self url link to the playlist object
        var selfURL = `${baseURL}/playlists/${playlistKey.id}`;
        const newPlaylist = {
            "name": name,
            "public": public,
            "owner_id": owner_id,
            "tracks": tracks,
            "self_url": selfURL
        }
        datastore.save({ 
            "key": playlistKey, 
            "data": newPlaylist
        })
        return playlistKey;
    });
}

/**
 * Delete a playlist by id
 * @param playlist_id {integer} - The id of the playlist; required
 * @returns key of the deleted playlist
 */
function deletePlaylistByID(playlist_id) {
    const key = datastore.key([PLAYLIST, parseInt(playlist_id, 10)]);
    return datastore.delete(key);
}

/**
 * Add a track to a playlist
 * @param playlist_id {string} - The id of the playlist; required
 * @param track_id {string} - The id of the track; required
 * @returns key of the updated playlist
 */
function addTrackToPlaylist(playlist_id, track_id) {
    const playlistKey = datastore.key([PLAYLIST, parseInt(playlist_id, 10)]);
    return datastore.get(playlistKey)
    .then((entity) => {
        if (entity[0] == undefined || entity[0] == null) {
            return entity;
        } else {
            var playlist = entity.map(fromDatastore);
            var tracks = playlist[0].tracks;
            tracks.push(track_id);
            return updatePlaylistByID(playlist_id, playlist[0].name, playlist[0].public, playlist[0].owner_id, tracks);
        }
    });
}


module.exports = {
    postPlaylist: postPlaylist,
    getPlaylistByID: getPlaylistByID,
    getUsersPlaylists: getUsersPlaylists,
    updatePlaylistByID: updatePlaylistByID,
    deletePlaylistByID: deletePlaylistByID,
    addTrackToPlaylist: addTrackToPlaylist
};
