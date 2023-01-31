const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/authMiddleware');
const { 
    createPlaylist,
    getPlaylists,
    getPlaylistByID,
    patchPlaylistByID,
    patchPlaylists,
    putPlaylistByID,
    putTrackInPlaylist,
    putPlaylists,
    deletePlaylistByID,
    deleteTrackFromPlaylist,
    deletePlaylists
} = require('../controllers/playlistsController');


router.route('/').post(checkAuth, createPlaylist);
router.route('/').get(checkAuth, getPlaylists);
router.route('/:playlist_id').get(checkAuth, getPlaylistByID);
router.route('/:playlist_id').patch(checkAuth, patchPlaylistByID);
router.route('/:playlist_id').put(checkAuth, putPlaylistByID);
router.route('/:playlist_id/tracks/:track_id').put(checkAuth, putTrackInPlaylist);
router.route('/:playlist_id').delete(checkAuth, deletePlaylistByID);
router.route('/:playlist_id/tracks/:track_id').delete(checkAuth, deleteTrackFromPlaylist); 

// checkAuth is not needed for the following routes:
router.route('/').patch(patchPlaylists);
router.route('/').put(putPlaylists); 
router.route('/').delete(deletePlaylists);

module.exports = router;
