const express = require('express');

// MIDDLEWARE
const ProtectMiddleware = require('../app/Middleware/ProtectMiddleware');

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

const router = express.Router();

// Auth
router.post('/user/register', AuthController.register);
router.post('/user/login', AuthController.login);
router.patch('/user/reset-password', ProtectMiddleware, AuthController.resetPassword);

// User
router.get('/user', ProtectMiddleware, AuthController.profile);
router.delete('/user', ProtectMiddleware, AuthController.deleteUser);

// Stats
router.get('/user/stats', ProtectMiddleware, StatsController.sendAccountStats);

// Language package
router.post('/languagePackage', ProtectMiddleware, LanguagePackageController.addLanguagePackage);
router.get('/languagePackage', ProtectMiddleware, LanguagePackageController.sendLanguagePackages);
router.delete(
  '/languagePackage/:languagePackageId',
  ProtectMiddleware,
  LanguagePackageController.deleteLanguagePackage
);
router.put('/languagePackage/:languagePackageId', ProtectMiddleware, LanguagePackageController.modifyLanguagePackage);

// Group
router.post('/languagePackage/:languagePackageId/group', ProtectMiddleware, GroupController.addGroup);
router.get('/languagePackage/:languagePackageId/group', ProtectMiddleware, GroupController.sendGroups);
router.delete('/group/:groupId', ProtectMiddleware, GroupController.deleteGroup);
router.put('/group/:groupId', ProtectMiddleware, GroupController.modifyGroup);

// Vocabulary
router.post(
  '/languagePackage/:languagePackageId/group/:groupId/vocabulary',
  ProtectMiddleware,
  VocabularyController.addVocabularyCard
);
router.delete('/vocabulary/:vocabularyId', ProtectMiddleware, VocabularyController.deleteVocabularyCard);
router.get('/group/:groupId/vocabulary', ProtectMiddleware, VocabularyController.sendGroupVocabulary);
router.put('/vocabulary/:vocabularyId', ProtectMiddleware, VocabularyController.modifyVocabulary);

// Query
router.get('/languagePackage/:languagePackageId/query', ProtectMiddleware, QueryController.sendQueryVocabulary);

router.patch('/vocabulary/:vocabularyId', ProtectMiddleware, QueryController.checkVocabulary);

// Language
router.get('/language', ProtectMiddleware, LanguageController.sendLanguages);

// Import / Export
router.get('/export/group/:groupId', ProtectMiddleware, ExportController.exportGroup);
router.get('/export/languagePackage/:languagePackageId', ProtectMiddleware, ExportController.exportLanguagePackage);
router.post('/import/group/', ProtectMiddleware, ImportController.importGroup);
router.post('/import/languagePackage/', ProtectMiddleware, ImportController.importLanguagePackage);

// Docs
router.get('/swagger.json', DocsController.document);
router.use('/swagger', DocsController.swagger);

// Info
router.get('/info', InfoController.sendInfo);

module.exports = router;
