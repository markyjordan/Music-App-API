const express = require('express');
const router = express.Router();
const { 
    createTrack, 
    getTracks,
    getTrackByID,
    patchTrackByID,
    patchTracks,
    updateTrackByID,
    updateTracks,
    deleteTrackByID,
    deleteTracks
} = require('../controllers/tracksController');

router.route('/').post(createTrack);
router.route('/').get(getTracks);
router.route('/:track_id').get(getTrackByID);
router.route('/:track_id').patch(patchTrackByID);
router.route('/').patch(patchTracks);
router.route('/:track_id').put(updateTrackByID);
router.route('/').put(updateTracks);
router.route('/:track_id').delete(deleteTrackByID);
router.route('/').delete(deleteTracks);


module.exports = router;
