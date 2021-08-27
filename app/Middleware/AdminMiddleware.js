const { parseTokenUserId } = require('../utils');
const { User, Role } = require('../../database');
const ApiError = require('../utils/ApiError.js');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

// Check for Authorization header and add user attribute to request object
const AdminMiddleware = catchAsync(async (req, _res, next) => {
  // Break if no Authorization header is set
  if (!req.header('Authorization')) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Not Authorized');
  }

  let userId;

  try {
    // Read userId from token
    userId = await parseTokenUserId(req);
  } catch (err) {
    // Handle broken token
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid auth token');
  }

  // Get user from database
  const user = await User.findOne({
    include: [
      {
        model: Role,
        attributes: ['adminRights'],
      },
    ],
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid auth token');
  }
  if (!user.Role.adminRights) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only Admins can use this function');
  }

  // Inject user into request object
  req.user = user;

  next();
});

module.exports = AdminMiddleware;
