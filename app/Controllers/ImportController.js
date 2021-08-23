const { storeGroupVocabulary, storeLanguagePackageVocabulary } = require('../Services/ImportServiceProvider.js');
const catchAsync = require('../utils/catchAsync');

const importGroup = catchAsync(async(req, res) => {
    // get userId from request
    const userId = req.user.id;

    const { active, activate, languagePackageId } = req.query;

    await storeGroupVocabulary(req.body, userId, languagePackageId, active, activate);

    res.send('stored');
});

const importLanguagePackage = catchAsync(async(req, res) => {
    // get userId from request
    const userId = req.user.id;

    // get group with vocabs from request body
    const { active, activate } = req.query;

    await storeLanguagePackageVocabulary(req.body, userId, active, activate);

    // await storeLanguagePackageVocabulary(group);

    res.send('stored');
});

module.exports = {
    importGroup,
    importLanguagePackage,
};