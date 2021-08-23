const { Group } = require('../../database');
const { ForeignKeyConstraintError } = require('sequelize');
const ApiError = require('../utils/ApiError.js');
const httpStatus = require('http-status');
const { createDrawers } = require('./DrawerServiceProvider.js');
const { createLanguagePackage } = require('./LanguagePackageServiceProvider.js');
const { drawers } = require('../utils/constants.js');
const { createVocabularyCard, createTranslations } = require('./VocabularyServiceProvider.js');

async function storeGroupVocabulary(
  { name, description, VocabularyCards },
  userId,
  languagePackageId,
  active,
  activate
) {
  try {
    const group = await Group.create({
      userId,
      languagePackageId,
      name,
      description,
      active,
    });

    VocabularyCards.forEach(async (vocabularyCard) => {
      const createdCard = await createVocabularyCard(
        languagePackageId,
        group.id,
        vocabularyCard.name,
        vocabularyCard.description,
        userId,
        active,
        activate
      );
      // parse vocabulary card id from response and create translations
      createTranslations(vocabularyCard.Translations, userId, languagePackageId, createdCard.id);
    });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error importing vocabs');
    }

    throw error;
  }
}

async function storeLanguagePackageVocabulary(
  { name, foreignWordLanguage, translatedWordLanguage, vocabsPerDay, rightWords, Groups },
  userId,
  active,
  activate
) {
  // ------------------------------------------//
  // TO DO: ADD THESE TWO FUNCTIONS TOGETHER
  // ------------------------------------------//

  try {
    // create language Package
    const createdLanguagePackage = await createLanguagePackage(
      { name, foreignWordLanguage, translatedWordLanguage, vocabsPerDay, rightWords },
      userId
    );

    // store drawers for language package in database
    await createDrawers(drawers, createdLanguagePackage.id, userId);

    Groups.forEach(async (group, index) => {
      const createdGroup = await Group.create({
        userId,
        languagePackageId: createdLanguagePackage.id,
        name: group.name,
        description: group.description,
        active,
      });

      Groups[index].VocabularyCards.forEach(async (vocabularyCard) => {
        const createdCard = await createVocabularyCard(
          createdLanguagePackage.id,
          createdGroup.id,
          vocabularyCard.name,
          vocabularyCard.description,
          userId,
          active,
          activate
        );
        // parse vocabulary card id from response and create translations
        createTranslations(vocabularyCard.Translations, userId, createdLanguagePackage.id, createdCard.id);
      });
    });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error importing vocabs');
    }

    throw error;
  }
}

module.exports = {
  storeGroupVocabulary,
  storeLanguagePackageVocabulary,
};
