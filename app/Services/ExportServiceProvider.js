const { VocabularyCard, Translation, Group, LanguagePackage } = require('../../database');

// get every vocabulary of a group
async function getAllGroupVocabulary(userId, groupId) {
  const group = await Group.findOne({
    attributes: ['name', 'description'],
    include: [
      {
        model: VocabularyCard,
        attributes: ['name', 'description'],
        include: [
          {
            model: Translation,
            attributes: ['name'],
          },
        ],
      },
    ],
    where: {
      id: groupId,
      userId,
    },
  });
  return group;
}

async function getAllLanguagePackageVocabulary(userId, languagePackageId) {
  // Get user with email from database
  const languagePackage = await LanguagePackage.findOne({
    // if groups is true, return groups to every language package
    include: [
      {
        model: Group,
        attributes: ['name', 'description'],
        include: [
          {
            model: VocabularyCard,
            attributes: ['name', 'description'],
            include: [
              {
                model: Translation,
                attributes: ['name'],
              },
            ],
          },
        ],
      },
    ],
    attributes: ['name', 'foreignWordLanguage', 'translatedWordLanguage', 'vocabsPerDay', 'rightWords'],
    where: {
      userId,
      id: languagePackageId,
    },
  });

  return languagePackage;
}

module.exports = {
  getAllGroupVocabulary,
  getAllLanguagePackageVocabulary,
};
