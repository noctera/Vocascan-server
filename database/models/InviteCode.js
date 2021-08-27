const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const InviteCode = sequelize.define(
    'InviteCode',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      code: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
      },
      used: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maxUses: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'inviteCodes',
    }
  );

  return InviteCode;
};
