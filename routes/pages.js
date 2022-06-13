const path = require('path');
const express = require('express');

const config = require('../app/config/config');

const StaticPagesController = require('../app/Controllers/StaticPagesController.js');
const VerificationController = require('../app/Controllers/VerificationController.js');

const router = express.Router();

// external static pages
if (config.pages) {
  Object.values(config.pages).forEach((page) => {
    router.get(page.url, StaticPagesController.getRenderPageHandler(page));
  });
}

// verification pages
router.get('/p/verifyEmail', VerificationController.verifyEmail);

// static files
router.use('/p/logo', express.static(path.resolve(__dirname, '../images/logo')));
router.use('/p/icons', express.static(path.resolve(__dirname, '../images/icons')));

module.exports = router;
