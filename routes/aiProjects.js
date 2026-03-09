const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/aiProjectsController');

// @route   GET api/ai-projects/future
// @desc    Get dynamic AI Future Projects board
router.get('/future', auth, aiController.getFutureProjects);

// @route   GET api/ai-projects/roadmap
// @desc    Get dynamic AI R&D Roadmap board
router.get('/roadmap', auth, aiController.getRoadmap);

// @route   GET api/ai-projects/commercial-sira
// @desc    Get dynamic Commercial SIRA board
router.get('/commercial-sira', auth, aiController.getCommercialSIRA);

// @route   GET api/ai-projects/dm-inquiries
// @desc    Get dynamic DM Inquiries board
router.get('/dm-inquiries', auth, aiController.getDMInquiries);

module.exports = router;
