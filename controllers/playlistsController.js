const constants = require('../constants');
const playlistModel = require('../models/playlistModel');
const trackModel = require('../models/trackModel');


/**
 * CREATE PLAYLIST
 * POST /playlists
 * 
 * Notes:
 * 
 * Returns:
 * 201 - Created; Successfully created a playlist.
 * 400 - Bad Request; The request object is missing one or more of the required
 * attributes. 
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const createPlaylist = (req, res) => {
    let user = req.user;
    let tracks = [];
    const baseURL = constants.getBaseURL();

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    }
    // Check if the request Accept header is application/json
    else if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    }
    // Check if the request body is missing any required attributes
    else if (req.body.name == undefined || req.body.public == undefined ) {
        res.status(400).json({ Error: constants.BAD_REQUEST });
    } else {
        playlistModel.postPlaylist(req.body.name, req.body.public, user.sub, tracks)
        .then(playlistKey => {
            res.status(201).json({
                id: playlistKey.id,
                name: req.body.name,
                public: req.body.public,
                owner_id: user.sub,
                tracks: tracks,
                self_url: `${baseURL}/playlists/${playlistKey.id}`
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * GET PLAYLISTS COLLECTION
 * GET /playlists
 * 
 * Notes:
 * The response will be paginated, with a maximum of 5 playlists per page. The
 * response only includes playlists of the user that is authenticated.
 * 
 * Returns:
 * 200 - OK; Successfully retrieved all playlists.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header. 
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const getPlaylists = (req, res) => {
    let user = req.user;

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    }
    // Check if the request Accept header is application/json
    else if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } else {
        playlistModel.getUsersPlaylists(user.sub)
        .then(playlists => {
            if (playlists.length === 0) {
                res.status(200).json([]);
            } else {
                res.status(200).json(playlists);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * GET PLAYLIST BY ID
 * GET /playlists/:playlist_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 200 - OK; Successfully retrieved the playlist.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 403 - Forbidden; The user is not authorized to access the playlist.
 * 404 - Not Found; The playlist with the specified ID was not found.
 */
const getPlaylistByID = (req, res) => {
    let user = req.user;
    let playlist_id = req.params.playlist_id;
    const baseURL = constants.getBaseURL();

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    } 
    // Check if the request Accept header is application/json
    else if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    } else {
        playlistModel.getPlaylistByID(playlist_id)
        .then(playlist => {
            if (playlist[0] === undefined) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else if (playlist[0].owner_id != user.sub) {
                res.status(403).json({ Error: constants.FORBIDDEN });
            } else {
                res.status(200).json({
                    id: playlist_id,
                    name: playlist[0].name,
                    public: playlist[0].public,
                    owner_id: playlist[0].owner_id,
                    tracks: playlist[0].tracks,
                    self_url: `${baseURL}/playlists/${playlist_id}`
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * PATCH PLAYLIST BY ID
 * PATCH /playlists/:playlist_id
 * 
 * Notes:
 * This endpoint does not allow the user to update the tracks in the playlist.
 * 
 * Returns:
 * 200 - OK; Successfully updated the playlist.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 403 - Forbidden; The user is not authorized to access the playlist.
 * 404 - Not Found; The playlist with the specified ID was not found.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const patchPlaylistByID = (req, res) => {
    let user = req.user;
    let playlist_id = req.params.playlist_id;
    const baseURL = constants.getBaseURL();

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    }
    // Check if the request Accept header is application/json
    else if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    }
    else {
        playlistModel.getPlaylistByID(playlist_id)
        .then(playlist => {
            if (playlist[0] === undefined) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else if (playlist[0].owner_id != user.sub) {
                res.status(403).json({ Error: constants.FORBIDDEN });
            } else {
                if (req.body.name === undefined) {
                    req.body.name = playlist[0].name;
                }
                if (req.body.public === undefined) {
                    req.body.public = playlist[0].public;
                }
                playlistModel.updatePlaylistByID(playlist_id, req.body.name, req.body.public, user.sub, playlist[0].tracks)
                .then(playlistKey => {
                    res.status(200).json({
                        id: playlist_id,
                        name: req.body.name,
                        public: req.body.public,
                        owner_id: user.sub,
                        tracks: playlist[0].tracks,
                        self_url: `${baseURL}/playlists/${playlistKey.id}`
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * PATCH PLAYLISTS COLLECTION
 * PATCH /playlists
 * 
 * Notes:
 * This endpoint is not, and should not be, supported.
 * 
 * Returns:
 * 405 - Method Not Allowed; The request method is not allowed for the endpoint.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const patchPlaylists = (req, res) => {
    res.status(405).json({ Error: constants.NOT_ALLOWED });
};

/**
 * PUT (UPDATE) PLAYLIST BY ID
 * PUT /playlists/:playlist_id
 * 
 * Notes:
 * This endpoint does not allow the user to update the tracks in the playlist.
 * 
 * Returns:
 * 200 - OK; Successfully updated the playlist.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 403 - Forbidden; The user is not authorized to access the playlist.
 * 404 - Not Found; The playlist with the specified ID was not found.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const putPlaylistByID = (req, res) => {
    let user = req.user;
    let playlist_id = req.params.playlist_id;
    const baseURL = constants.getBaseURL();

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    }
    // Check if the request Accept header is application/json
    else if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    }
    else {
        playlistModel.getPlaylistByID(playlist_id)
        .then(playlist => {
            if (playlist[0] === undefined) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else if (playlist[0].owner_id != user.sub) {
                res.status(403).json({ Error: constants.FORBIDDEN });
            } else if (req.body.name === undefined || req.body.public === undefined) {
                res.status(400).json({ Error: constants.BAD_REQUEST });
            } else {
                playlistModel.updatePlaylistByID(playlist_id, req.body.name, req.body.public, user.sub, playlist[0].tracks)
                .then(playlistKey => {
                    res.status(200).json({
                        id: playlist_id,
                        name: req.body.name,
                        public: req.body.public,
                        owner_id: user.sub,
                        tracks: playlist[0].tracks,
                        self_url: `${baseURL}/playlists/${playlistKey.id}`
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * PUT TRACK IN PLAYLIST
 * PUT /playlists/:playlist_id/tracks/:track_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 200 - OK; Successfully added the track to the playlist.
 * 400 - Bad Request; No duplicate tracks are allowed in a playlist.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 403 - Forbidden; The user is not authorized to access the playlist.
 * 404 - Not Found; The playlist with the specified ID was not found.
 * 406 - Not Acceptable; The server only produces responses that conform to an
 * 'application/json' value provided in the request 'Accept' header.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const putTrackInPlaylist = (req, res) => {
    let user = req.user;
    let playlist_id = req.params.playlist_id;
    let track_id = req.params.track_id;
    const baseURL = constants.getBaseURL();

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    }
    // Check if the request Accept header is application/json
    else if (req.get('Accept') !== 'application/json') {
        res.status(406).json({ Error: constants.NOT_ACCEPTABLE });
    }
    else {
        playlistModel.getPlaylistByID(playlist_id)
        .then(playlist => {
            if (playlist[0] === undefined) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else if (playlist[0].owner_id != user.sub) {
                res.status(403).json({ Error: constants.FORBIDDEN });
            } else if (playlist[0].tracks.includes(track_id)) {
                res.status(400).json({ Error: constants.BAD_REQUEST_NO_DUPLICATES });
            } else {
                playlist[0].tracks.push(track_id);
                playlistModel.updatePlaylistByID(playlist_id, playlist[0].name, playlist[0].public, user.sub, playlist[0].tracks)
                .then(playlistKey => {
                    res.status(200).json({
                        id: playlist_id,
                        name: playlist[0].name,
                        public: playlist[0].public,
                        owner_id: user.sub,
                        tracks: playlist[0].tracks,
                        self_url: `${baseURL}/playlists/${playlistKey.id}`
                    })
                    // Update the track's playlists array
                    trackModel.getTrackByID(track_id)
                    .then(track => {
                        track[0].playlists.push(playlist_id);
                        trackModel.updateTrackByID(track_id, track[0].album, track[0].artists, track[0].duration_s, track[0].name, track[0].playlists)
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
                })
            }
        })
    }
};

/**
 * PUT (UPDATE) PLAYLISTS COLLECTION
 * PUT /playlists
 * 
 * Notes:
 * This endpoint is not, and should not be, supported.
 * 
 * Returns:
 * 405 - Method Not Allowed; The request method is not allowed for the endpoint.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const putPlaylists = (req, res) => {
    res.set('Allow', 'GET, POST');
    res.status(405).send({ Error: constants.NOT_ALLOWED }).end();
};

/**
 * DELETE PLAYLIST BY ID
 * DELETE /playlists/:playlist_id
 * 
 * Notes:
 * This endpoint also deletes the play
 * 
 * 
 * Returns:
 * 204 - No Content; Successfully deleted the playlist.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 403 - Forbidden; The user is not authorized to access the playlist.
 * 404 - Not Found; The playlist with the specified ID was not found.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const deletePlaylistByID = (req, res) => {
    let user = req.user;
    let playlist_id = req.params.playlist_id;

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    } else {
        playlistModel.getPlaylistByID(playlist_id)
        .then(playlist => {
            if (playlist[0] === undefined) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else if (playlist[0].owner_id != user.sub) {
                res.status(403).json({ Error: constants.FORBIDDEN });
            } else {
                playlistModel.deletePlaylistByID(playlist_id)
                .then(() => {
                    res.status(204).end();
                    // Delete the playlist from the tracks' playlists array
                    playlist[0].tracks.forEach(track_id => {
                        trackModel.getTrackByID(track_id)
                        .then(track => {
                            let index = track[0].playlists.indexOf(playlist_id);
                            if (index > -1) {
                                track[0].playlists.splice(index, 1);
                            }
                            trackModel.updateTrackByID(track_id, track[0].album, track[0].artists, track[0].duration_s, track[0].name, track[0].playlists)
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
        })
    }
};

/**
 * DELETE TRACK FROM PLAYLIST
 * DELETE /playlists/:playlist_id/tracks/:track_id
 * 
 * Notes:
 * 
 * 
 * Returns:
 * 204 - No Content; Successfully deleted the track from the playlist.
 * 401 - Unauthorized; The request object is missing the required authorization
 * header.
 * 403 - Forbidden; The user is not authorized to access the playlist.
 * 404 - Not Found; The playlist with the specified ID was not found.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const deleteTrackFromPlaylist = (req, res) => {
    let user = req.user;
    let playlist_id = req.params.playlist_id;
    let track_id = req.params.track_id;

    // Check if the jwt token is valid
    if (Object.keys(user).length === 0) {
        res.status(401).json({ Error: constants.UNAUTHORIZED });
    } else {
        playlistModel.getPlaylistByID(playlist_id)
        .then(playlist => {
            if (playlist[0] === undefined) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else if (playlist[0].owner_id != user.sub) {
                res.status(403).json({ Error: constants.FORBIDDEN });
            } else if (!playlist[0].tracks.includes(track_id)) {
                res.status(404).json({ Error: constants.NOT_FOUND });
            } else {
                // Remove the track from the playlist
                let index = playlist[0].tracks.indexOf(track_id);
                playlist[0].tracks.splice(index, 1);
                playlistModel.updatePlaylistByID(playlist_id, playlist[0].name, playlist[0].public, user.sub, playlist[0].tracks)
                .then(() => {
                    res.status(204).end();
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ Error: constants.INTERNAL_SERVER_ERROR });
                })
                // Remove the playlist from the track
                trackModel.updateTrackByID
            }
        })
    }
};

/**
 * DELETE PLAYLISTS COLLECTION
 * DELETE /playlists
 * 
 * Notes:
 * This endpoint is not, and should not be, supported.
 * 
 * Returns:
 * 405 - Method Not Allowed; The request method is not allowed for the endpoint.
 * 500 - Internal Server Error; An unexpected server error occurred.
 */
const deletePlaylists = (req, res) => {
    res.set('Allow', 'GET, POST');
    res.status(405).send({ Error: constants.NOT_ALLOWED }).end();
};


module.exports = {
    createPlaylist: createPlaylist,
    getPlaylists: getPlaylists,
    getPlaylistByID: getPlaylistByID,
    patchPlaylistByID: patchPlaylistByID,
    patchPlaylists: patchPlaylists,
    putPlaylistByID: putPlaylistByID,
    putTrackInPlaylist: putTrackInPlaylist,
    putPlaylists: putPlaylists,
    deletePlaylistByID: deletePlaylistByID,
    deleteTrackFromPlaylist: deleteTrackFromPlaylist,
    deletePlaylists: deletePlaylists
};
