const { InviteCode } = require('../../database');
const ApiError = require('../utils/ApiError.js');
const httpStatus = require('http-status');
const { deleteKeysFromObject } = require('../utils');
const { Sequelize } = require('sequelize');

const createInviteCode = async ({ maxUses, expirationDate }) => {
  const inviteCode = await InviteCode.create({
    used: 0,
    maxUses,
    expirationDate,
  });
  return deleteKeysFromObject(['createdAt', 'updatedAt'], inviteCode.toJSON());
};
const validateInviteCode = async (code) => {
  const inviteCode = await InviteCode.findOne({
    where: {
      code,
    },
  });

  if (!inviteCode) {
    throw new ApiError(httpStatus.CONFLICT, 'Invite code does not exist', 'notExisting');
  }

  if (inviteCode.maxUses !== null && inviteCode.maxUses - inviteCode.used === 0) {
    throw new ApiError(httpStatus.CONFLICT, 'No invites left', 'used');
  }

  if (inviteCode.expirationDate !== null && inviteCode.expirationDate >= new Date()) {
    throw new ApiError(httpStatus.CONFLICT, 'Invite code expired', 'expired');
  }

  return true;
};

const useInviteCode = async (code) => {
  const counter = await InviteCode.update(
    { used: Sequelize.literal('used + 1') },
    {
      where: {
        code,
      },
    }
  );

  if (counter[0] === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invite code not found');
  }
  return false;
};

const destroyInviteCode = async (code) => {
  const counter = await InviteCode.destroy({
    where: {
      code,
    },
  });

  if (counter === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invite code not found');
  }

  return false;
};

async function getInviteCodes() {
  const inviteCodes = await InviteCode.findAll({
    attributes: ['id', 'code', 'used', 'maxUses', 'expirationDate'],
  });

  return inviteCodes;
}

module.exports = {
  createInviteCode,
  validateInviteCode,
  useInviteCode,
  destroyInviteCode,
  getInviteCodes,
};
