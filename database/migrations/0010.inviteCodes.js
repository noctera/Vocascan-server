const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  await queryInterface.createTable('inviteCodes', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    code: {
      type: DataTypes.UUID,
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('inviteCodes');
}

module.exports = { up, down };
