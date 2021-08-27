const { getVersion, getGitDescribe } = require('../Services/InfoServiceProvider.js');
const catchAsync = require('../utils/catchAsync.js');

const sendInfo = catchAsync(async (_req, res) => {
  res.send({
    identifier: 'vocascan-server',
    version: getVersion(),
    locked: process.env.LOCKED === 'true',
    commitRef: await getGitDescribe(),
  });
});

module.exports = {
  sendInfo,
};
