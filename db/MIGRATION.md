yarn sequelize db:migrate
yarn sequelize db:migrate:undo
yarn sequelize db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js


module.exports = {
  up: function(query, Sequelize) {
    // ...
    return query.addColumn(
      'nameofAnExistingTable',
      'nameOfTheNewAttribute',
      Sequelize.String
    );

    // return query.renameColumn('Table', 'oldName', 'newName');
  },
  down: function(query, Sequelize) {
    // ...
    return query.removeColumn(
      'nameofAnExistingTable',
      'nameOfTheNewAttribute',
    )
  }
};