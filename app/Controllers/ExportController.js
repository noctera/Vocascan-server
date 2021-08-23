const { getAllGroupVocabulary, getAllLanguagePackageVocabulary } = require('../Services/ExportServiceProvider.js');
const catchAsync = require('../utils/catchAsync');

const exportGroup = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;

  // get language package id from params
  const { groupId } = req.params;

  const group = await getAllGroupVocabulary(userId, groupId);

  res.send(group);
});

const exportLanguagePackage = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;

  // get language package id from params
  const { languagePackageId } = req.params;

  const languagePackage = await getAllLanguagePackageVocabulary(userId, languagePackageId);

  res.send(languagePackage);
});

module.exports = {
  exportGroup,
  exportLanguagePackage,
};
