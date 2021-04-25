const { Drawer, VocabularyCard, Translation, Group, PackageProgress } = require('../../database');
const { deleteKeysFromObject, shiftDate, dayDateDiff } = require('../utils/index.js');
const { Sequelize, Op } = require('sequelize');
const ApiError = require('../utils/ApiError.js');
const httpStatus = require('http-status');

// return the unresolved vocabulary
async function getQueryVocabulary(languagePackageId, userId, limit) {
  // Get drawers belonging to languagePackage
  const drawers = await Drawer.findAll({
    attributes: ['id', 'stage', 'queryInterval'],
    where: {
      userId,
      languagePackageId,
      stage: {
        [Op.ne]: 0,
      },
    },
  });

  if (drawers.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'no drawers found, because the language package does not exist');
  }

  const allVocabulary = [];

  /* eslint-disable no-await-in-loop */
  for (const drawer of drawers) {
    // subtract size of vocabs returned to update the limit
    const vocabularyLimit = limit - allVocabulary.length;

    // subtract query interval from actual date
    const queryDate = shiftDate(new Date(), -drawer.queryInterval);

    // compare query date with with last query
    // if queryDate is less than lastQuery: still time
    // if queryDate more than lastQuery: waiting time is over
    const vocabulary = await VocabularyCard.findAll({
      include: [
        {
          model: Translation,
          attributes: ['name'],
          required: true,
        },
        {
          model: Group,
          attributes: ['active'],
          required: true,
        },
        {
          model: Drawer,
          attributes: ['stage'],
          required: true,
        },
      ],
      order: Sequelize.literal('random()'),
      limit: vocabularyLimit,
      attributes: ['id', 'name', 'description'],
      where: {
        drawerId: drawer.id,
        lastQuery: { [Op.lt]: queryDate },
        '$Group.active$': true,
        active: true,
      },
    });

    allVocabulary.push(...vocabulary);
  }
  /* eslint-enable no-await-in-loop */

  const formatted = await Promise.all(
    allVocabulary.map(async (vocabulary) => ({
      stage: vocabulary.Drawer.stage,

      ...vocabulary.toJSON(),
    }))
  );

  return formatted.map((format) => deleteKeysFromObject(['Group', 'Drawer'], format));
}

// return the unactivated vocabulary
async function getUnactivatedVocabulary(languagePackageId, userId) {
  // Get drawers id
  const drawer = await Drawer.findOne({
    attributes: ['id'],
    where: {
      userId,
      languagePackageId,
      stage: 0,
    },
  });

  if (!drawer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'no drawer found due to wrong language package id');
  }

  // return every vocabulary in drawer 0
  const vocabularyWords = await VocabularyCard.findAll({
    include: [
      {
        model: Translation,
        attributes: ['name'],
      },
      {
        model: Group,
        attributes: ['active'],
        required: true,
      },
      {
        model: Drawer,
        attributes: ['stage'],
        required: true,
      },
    ],
    order: Sequelize.literal('random()'),
    attributes: ['id', 'name', 'description'],
    where: {
      drawerId: drawer.id,
      '$Group.active$': true,
      active: true,
    },
  });

  const formatted = await Promise.all(
    vocabularyWords.map(async (vocabulary) => ({
      stage: vocabulary.Drawer.stage,

      ...vocabulary.toJSON(),
    }))
  );
  /* eslint-enable no-await-in-loop */

  return formatted.map((format) => deleteKeysFromObject(['Group', 'Drawer'], format));
}

function checkCanBeLearned(vocabularyCard) {
  // add query interval to last queried date
  const queryDate = shiftDate(vocabularyCard.lastQuery, vocabularyCard.Drawer.queryInterval);
  const now = new Date();

  // check if vocab can be learned due to last query date
  if (now.getTime() < queryDate.getTime()) {
    const diff = dayDateDiff(now, queryDate);

    throw new ApiError(httpStatus.FORBIDDEN, `vocabulary card can be learned only in ${diff} days`);
  }
}

async function countLearned({ userId, languagePackageId, correct }) {
  const packageProgress = await PackageProgress.findOne({
    where: {
      userId,
      languagePackageId: languagePackageId,
      date: new Date(),
    },
  });

  if (packageProgress) {
    await packageProgress.increment(correct ? 'learnedTodayCorrect' : 'learnedTodayWrong', { by: 1 });
  } else {
    await PackageProgress.create({
      userId,
      languagePackageId: languagePackageId,
      ...(correct ? { learnedTodayCorrect: 1 } : { learnedTodayWrong: 1 }),
    });
  }
}

// function to handle correct query
async function handleCorrectQuery(userId, vocabularyCardId) {
  // fetch selected vocabulary card
  const vocabularyCard = await VocabularyCard.findOne({
    include: [
      {
        model: Drawer,
        attributes: ['stage', 'queryInterval'],
      },
    ],
    where: {
      userId,
      id: vocabularyCardId,
    },
  });

  if (!vocabularyCard) {
    throw new ApiError(httpStatus.NOT_FOUND, 'vocabulary card not found');
  }

  // check if vocab can be learned due to last query date
  checkCanBeLearned(vocabularyCard);

  // count card as correct queried today
  await countLearned({
    userId,
    languagePackageId: vocabularyCard.languagePackageId,
    correct: true,
  });

  // push vocabulary card one drawer up
  // get drawer id from stage
  const drawer = await Drawer.findOne({
    attributes: ['id'],
    where: {
      userId,
      languagePackageId: vocabularyCard.languagePackageId,
      stage: vocabularyCard.Drawer.stage + 1,
    },
  });

  if (!drawer) {
    // if no output there is no next drawer => stop
    return false;
  }

  // update drawerId for vocabulary card
  const lastQuery = new Date();
  const drawerId = drawer.id;

  await vocabularyCard.update(
    { lastQuery, drawerId },
    {
      fields: ['lastQuery', 'drawerId'],
    }
  );

  return vocabularyCard;
}

// function to handle wrong query
async function handleWrongQuery(userId, vocabularyCardId) {
  // if query was solved wrong, push vocabulary card in drawer one
  const vocabularyCard = await VocabularyCard.findOne({
    include: [
      {
        model: Drawer,
        attributes: ['queryInterval'],
      },
    ],
    where: {
      userId,
      id: vocabularyCardId,
    },
  });

  if (!vocabularyCard) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vocabulary card not found');
  }

  // check if vocab can be learned due to last query date
  checkCanBeLearned(vocabularyCard);

  // count card as wrong queried today
  await countLearned({
    userId,
    languagePackageId: vocabularyCard.languagePackageId,
    correct: false,
  });

  const drawer = await Drawer.findOne({
    attributes: ['id'],
    where: {
      userId,
      languagePackageId: vocabularyCard.languagePackageId,
      stage: 1,
    },
  });

  // update drawerId for vocabulary card
  const lastQuery = new Date();
  const drawerId = drawer.id;

  await vocabularyCard.update(
    { lastQuery, drawerId },
    {
      fields: ['lastQuery', 'drawerId'],
    }
  );

  return vocabularyCard;
}

module.exports = {
  getQueryVocabulary,
  getUnactivatedVocabulary,
  handleCorrectQuery,
  handleWrongQuery,
};
