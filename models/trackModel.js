const { getBaseURL } = require('../constants');
const baseURL = getBaseURL();
const { datastore, fromDatastore } = require('../datastore');
const TRACK = "Track";


/**
 * Create a track
 * @param album {string} - The album of the track; required
 * @param artists {array of objects} - The artists of the track; required
 * @param duration_s {integer} - The duration of the track in seconds;
 * required
 * @param name {string} - The name of the track; required
 * @param playlists {array of objects} - The playlists that the track is in;
 * optional
 * @returns key of the new track
 */
function postTrack(album, artists, duration_s, name, playlists) {
    const trackKey = datastore.key(TRACK);
    const track = { 
        "album": album,
        "artists": artists, 
        "duration_s": duration_s, 
        "name": name,
        "playlists": playlists
    };
    const trackEntity = { 
        "key": trackKey, 
        "data": track 
    };
    return datastore.insert(trackEntity)
    .then(() => {
        // Add the self url link to the track object
        var selfURL = `${baseURL}/tracks/${trackKey.id}`;
        const newTrack = {
            "album": album,
            "artists": artists,
            "duration_s": duration_s,
            "name": name,
            "playlists": playlists,
            "self_url": selfURL
        }
        datastore.save({ 
            "key": trackKey, 
            "data": newTrack
        })
        return trackKey;
    });
}

/**
 * Get the tracks collection
 * @returns all tracks
 */
function getTracks(req) {
    const query = datastore.createQuery(TRACK);
    return datastore.runQuery(query)
    .then((entities) => {
        return entities[0].map(fromDatastore);
    });
}

// /**
//  * Get the tracks collection
//  * @returns all tracks
//  */
// function getTracks(req) {
//     const query = datastore.createQuery(TRACK)
//     const paginatedResults = {};
//     let prev;

//     return datastore.runQuery(query)
//     .then((entities) => {
//         const tracks = entities[0].map(fromDatastore);
//         const totalTracks = tracks.length
//         results.total_items = totalTracks;
//     })
//     .then(() => {
//         if (Object.keys(req.query).includes("cursor")) {
//             prev = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + req.query.cursor;
//             query = query.start(req.query.cursor);
//         }
//         return datastore.runQuery(query)
//         .then((entities) => {
//             results.items = entities[0].map(fromDatastore);
//             if (typeof prev != "undefined") {
//                 results.prev = prev;
//             }
//             if (entities[1].moreResults != Datastore.NO_MORE_RESULTS) {
//                 results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
//             }
//             return paginatedResults;
//         })
//     })     
// }

/**
 * Get a track by id
 * @param track_id {string} - The id of the track; required
 * @returns a track
 */
function getTrackByID(track_id) {
    const trackKey = datastore.key([TRACK, parseInt(track_id, 10)]);
    return datastore.get(trackKey)
    .then((entity) => {
        if (entity[0] == undefined || entity[0] == null) {
            return entity;
        } else {
            return entity.map(fromDatastore);
        }
    });
}

/**
 * Get a track's playlists
 * @param track_id {string} - The id of the track; required
 * @returns a track's playlists
 */
function getTrackPlaylists(track_id) {
    const key = datastore.key([TRACK, parseInt(track_id, 10)]);
    return datastore.get(key)
    .then((entity) => {
        if (entity[0] == undefined || entity[0] == null) {
            return entity;
        } else {
            return entity[0].playlists.map(fromDatastore);
        }
    });
}

/**
 * Patch a track
 * @param track_id {integer} - The id of the track; required
 * @param album {string} - The album of the track; optional
 * @param artists {array of objects} - The artists of the track; optional
 * @param duration_s {integer} - The duration of the track in seconds; optional
 * @param name {string} - The name of the track; optional
 * @param playlists {array of objects} - The playlists that the track is in;
 * optional
 * @returns status code
 */
function patchTrackByID(track_id, album, artists, duration_s, name, playlists) {
    const trackKey = datastore.key([TRACK, parseInt(track_id, 10)]);
    const track = {
        "album": album,
        "artists": artists,
        "duration_s": duration_s,
        "name": name,
        "playlists": playlists
    };
    const trackEntity = {
        "key": trackKey,
        "data": track
    };
    return datastore.update(trackEntity)
    .then(() => {
        var selfURL = `${baseURL}/tracks/${trackKey.id}`;
        const newTrack = {
            "album": album,
            "artists": artists,
            "duration_s": duration_s,
            "name": name,
            "playlists": playlists,
            "self_url": selfURL
        }
        datastore.save({
            "key": trackKey,
            "data": newTrack
        })
        return trackKey;
    });
}

/**
 * Update a track by id
 * @param track_id {integer} - The id of the track; required
 * @param album {string} - The album of the track; required
 * @param artists {array of objects} - The artists of the track; required
 * @param duration_s {integer} - The duration of the track in seconds; required
 * @param name {string} - The name of the track; required
 * @param playlists {array of objects} - The playlists that the track is in;
 * optional
 * @returns status code
 */
function updateTrackByID(track_id, album, artists, duration_s, name, playlists) {
    const trackKey = datastore.key([TRACK, parseInt(track_id, 10)]);
    const track = {
        "album": album,
        "artists": artists,
        "duration_s": duration_s,
        "name": name,
        "playlists": playlists
    };
    const trackEntity = {
        "key": trackKey,
        "data": track
    };
    return datastore.update(trackEntity)
    .then(() => {
        var selfURL = `${baseURL}/tracks/${trackKey.id}`;
        const newTrack = {
            "album": album,
            "artists": artists,
            "duration_s": duration_s,
            "name": name,
            "playlists": playlists,
            "self_url": selfURL
        }
        datastore.save({
            "key": trackKey,
            "data": newTrack
        })
        return trackKey;
    });
}

/**
 * Delete a track by id
 * @param track_id {integer} - The id of the track; required
 * @returns status code
 */
function deleteTrackByID(track_id) {
    const key = datastore.key([TRACK, parseInt(track_id, 10)]);
    return datastore.delete(key);
}

/**
 * Add a playlist to a track
 * @param track_id {integer} - The id of the track; required
 * @param playlist_id {integer} - The id of the playlist; required
 * @returns status code
 */
function addPlaylistToTrack(track_id, playlist_id) {
    const trackKey = datastore.key([TRACK, parseInt(track_id, 10)]);
    return datastore.get(trackKey)
    .then((entity) => {
        if (entity[0] == undefined || entity[0] == null) {
            return entity;
        } else {
            entity[0].playlists.push(playlist_id);
            return datastore.save({
                "key": key,
                "data": entity[0]
            });
        }
    });
}

/**
 * Remove a playlist from a track
 * @param track_id {integer} - The id of the track; required
 * @param playlist_id {integer} - The id of the playlist; required
 * @returns status code
 */
function removePlaylistFromTrack(track_id, playlist_id) {
    const key = datastore.key([TRACK, parseInt(track_id, 10)]);
    return datastore.get(key)
    .then((entity) => {
        if (entity[0] == undefined || entity[0] == null) {
            return entity;
        } else {
            // Find the index of the playlist to remove
            var index = entity[0].playlists.indexOf(playlist_id);
            if (index > -1) {
                entity[0].playlists.splice(index, 1);
            }
            return datastore.save({
                "key": key,
                "data": entity[0]
            });
        }
    });
}


module.exports = {
    postTrack: postTrack,
    getTracks: getTracks,
    getTrackByID: getTrackByID,
    getTrackPlaylists: getTrackPlaylists,
    patchTrackByID: patchTrackByID,
    updateTrackByID: updateTrackByID,
    deleteTrackByID: deleteTrackByID,
    addPlaylistToTrack: addPlaylistToTrack,
    removePlaylistFromTrack: removePlaylistFromTrack
};
