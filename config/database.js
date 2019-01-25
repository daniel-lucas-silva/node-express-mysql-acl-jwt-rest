import Sequelize from 'sequelize';

export default new Sequelize("itaperuna_test", "root", null, {
  host: "localhost",
  dialect: "mysql",
  operatorsAliases: false
});

