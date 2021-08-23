const { VocabularyCard, Translation, Drawer, Group } = require('../../database');
const { deleteKeysFromObject } = require('../utils');
const ApiError = require('../utils/ApiError.js');
const httpStatus = require('http-status');

// create language package
async function createVocabularyCard(languagePackageId, groupId, name, description, userId, active, activate) {
  // if activate = false store vocabulary card in drawer 0 directly

  // select drawer id depending on the activate state
  const drawer = await Drawer.findOne({
    attributes: ['id'],
    where: {
      stage: activate ? 1 : 0,
      languagePackageId,
      userId,
    },
  });

  if (!drawer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'no drawer found due to wrong language package id');
  }
  // create date the day before yesterday so it will appear in the inbox for querying
  const date = new Date();
  const yesterday = date.setDate(date.getDate() - 1);

  const vocabularyCard = await VocabularyCard.create({
    userId,
    languagePackageId,
    groupId,
    drawerId: drawer.id,
    name,
    description,
    lastQuery: yesterday,
    lastQueryCorrect: yesterday,
    active,
  });

  const formatted = deleteKeysFromObject(
    ['userId', 'lastQuery', 'lastQueryCorrect', 'updatedAt', 'createdAt', 'languagePackageId', 'groupId', 'drawerId'],
    vocabularyCard.toJSON()
  );
  return formatted;
}

// create translations
async function createTranslations(translations, userId, languagePackageId, vocabularyCardId) {
  await Promise.all(
    translations.map(async (translation) => {
      await Translation.create({
        userId,
        vocabularyCardId,
        languagePackageId,
        name: translation.name,
      });
    })
  );
  return false;
}

async function getGroupVocabulary(userId, groupId) {
  const group = await Group.count({
    where: {
      id: groupId,
      userId,
    },
  });

  if (group === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'no vocabulary cards found, because the group does not exist');
  }

  const vocabulary = await VocabularyCard.findAll({
    include: [
      {
        model: Translation,
        attributes: ['name'],
      },
    ],
    attributes: ['id', 'name', 'active', 'description'],
    where: {
      userId,
      groupId,
    },
  });

  return vocabulary;
}

async function destroyVocabularyCard(userId, vocabularyCardId) {
  const counter = await VocabularyCard.destroy({
    where: {
      id: vocabularyCardId,
      userId,
    },
  });

  if (counter === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'vocabulary card not found');
  }
  return false;
}

async function updateVocabulary({ translations, ...card }, userId, vocabularyCardId) {
  // delete all translations belonging to vocabulary card

  await Translation.destroy({
    where: {
      userId,
      vocabularyCardId,
    },
  });

  const vocabulary = await VocabularyCard.findOne({
    where: {
      id: vocabularyCardId,
      userId,
    },
  });

  if (!vocabulary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'vocabulary card not found');
  }

  // change values from foreign Word
  await vocabulary.update(card, {
    fields: ['name', 'active', 'description'],
  });

  // create new translations from request
  await createTranslations(translations, userId, vocabulary.languagePackageId, vocabularyCardId);

  // fetch vocabulary Card to return it to user
  const newVocabulary = await VocabularyCard.findOne({
    include: [
      {
        model: Translation,
        attributes: ['name'],
      },
    ],
    attributes: ['name', 'active', 'description'],
    where: {
      id: vocabularyCardId,
      userId,
    },
  });

  return newVocabulary;
}

module.exports = {
  createVocabularyCard,
  createTranslations,
  destroyVocabularyCard,
  getGroupVocabulary,
  updateVocabulary,
};
