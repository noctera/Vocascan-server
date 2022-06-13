const express = require('express');

const config = require('../app/config/config');

// MIDDLEWARE
const ProtectMiddleware = require('../app/Middleware/ProtectMiddleware');
const AdminMiddleware = require('../app/Middleware/AdminMiddleware');

// CONTROLLER
const AuthController = require('../app/Controllers/AuthController.js');
const LanguagePackageController = require('../app/Controllers/LanguagePackageController.js');
const GroupController = require('../app/Controllers/GroupController.js');
const VocabularyController = require('../app/Controllers/VocabularyController.js');
const QueryController = require('../app/Controllers/QueryController.js');
const LanguageController = require('../app/Controllers/LanguageController.js');
const DocsController = require('../app/Controllers/DocsController.js');
const StatsController = require('../app/Controllers/StatsController.js');
const InfoController = require('../app/Controllers/InfoController.js');
const ImportController = require('../app/Controllers/ImportController.js');
const ExportController = require('../app/Controllers/ExportController.js');
const InviteCodeController = require('../app/Controllers/InviteCodeController.js');
const VerificationController = require('../app/Controllers/VerificationController.js');

const router = express.Router();

// Auth
router.post('/user/register', AuthController.register);
router.post('/user/login', AuthController.login);
router.patch('/user/reset-password', ProtectMiddleware(false), AuthController.resetPassword);
router.patch(
  '/user/request-email-verification',
  ProtectMiddleware(false),
  VerificationController.requestEmailVerification
);

// User
router.get('/user', ProtectMiddleware(false), AuthController.profile);
router.delete('/user', ProtectMiddleware(false), AuthController.deleteUser);

// Stats
router.get('/user/stats', ProtectMiddleware(), StatsController.sendAccountStats);

// Language package
router.post('/languagePackage', ProtectMiddleware(), LanguagePackageController.addLanguagePackage);
router.get('/languagePackage', ProtectMiddleware(), LanguagePackageController.sendLanguagePackages);
router.delete(
  '/languagePackage/:languagePackageId',
  ProtectMiddleware(),
  LanguagePackageController.deleteLanguagePackage
);
router.put('/languagePackage/:languagePackageId', ProtectMiddleware(), LanguagePackageController.modifyLanguagePackage);

// Group
router.post('/languagePackage/:languagePackageId/group', ProtectMiddleware(), GroupController.addGroup);
router.get('/languagePackage/:languagePackageId/group', ProtectMiddleware(), GroupController.sendGroups);
router.delete('/group/:groupId', ProtectMiddleware(), GroupController.deleteGroup);
router.put('/group/:groupId', ProtectMiddleware(), GroupController.modifyGroup);

// Vocabulary
router.post(
  '/languagePackage/:languagePackageId/group/:groupId/vocabulary',
  ProtectMiddleware(),
  VocabularyController.addVocabularyCard
);
router.delete('/vocabulary/:vocabularyId', ProtectMiddleware(), VocabularyController.deleteVocabularyCard);
router.get('/group/:groupId/vocabulary', ProtectMiddleware(), VocabularyController.sendGroupVocabulary);
router.put('/vocabulary/:vocabularyId', ProtectMiddleware(), VocabularyController.modifyVocabulary);

// Query
router.get('/languagePackage/:languagePackageId/query', ProtectMiddleware(), QueryController.sendQueryVocabulary);

router.patch('/vocabulary/:vocabularyId', ProtectMiddleware(), QueryController.checkVocabulary);

// Language
router.get('/language', ProtectMiddleware(), LanguageController.sendLanguages);

// Import / Export
router.get('/group/:groupId/export', ProtectMiddleware(), ExportController.exportGroup);
router.get('/languagePackage/:languagePackageId/export', ProtectMiddleware(), ExportController.exportLanguagePackage);
router.post('/import', ProtectMiddleware(), ImportController.importVocabs);

// Docs
if (config.api.enable_swagger) {
  router.get('/swagger.json', DocsController.document);
  router.use('/swagger', DocsController.swagger);
}

// Info
router.get('/info', InfoController.sendInfo);

// Admin
router.post('/inviteCode', ProtectMiddleware(), AdminMiddleware, InviteCodeController.addInviteCode);
router.delete('/inviteCode/:inviteCode', ProtectMiddleware(), AdminMiddleware, InviteCodeController.deleteInviteCode);
router.get('/inviteCode', ProtectMiddleware(), AdminMiddleware, InviteCodeController.sendInviteCodes);
router.get('/inviteCode/:inviteCode', InviteCodeController.checkInviteCode);

module.exports = router;
