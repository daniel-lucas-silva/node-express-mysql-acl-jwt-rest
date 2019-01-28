yarn sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string

yarn sequelize model:generate --name UserAccess --attributes email:string,id:string,browser:string,date:date

yarn sequelize model:generate --name Category --attributes title:string,description:text,thumbnail:string

yarn sequelize model:generate --name Post --attributes title:string,content:text,thumbnail:string,userId:uuidv1
