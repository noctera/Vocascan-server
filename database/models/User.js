// MODEL
const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        validate: { len: [2, 32] },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
    }
  );

  User.associate = (db) => {
    User.hasMany(db.LanguagePackage);
    User.hasMany(db.Group);
    User.hasMany(db.Drawer);
    User.hasMany(db.ForeignWord);
    User.hasMany(db.TranslatedWord);
  };

  return User;
};