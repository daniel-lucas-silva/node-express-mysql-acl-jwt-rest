module.exports = function(models) {
  models.model1.hasMany(models.model2, {
    onDelete: "cascade",
    foreignKey: "model1123"
  });
};
