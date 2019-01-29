Node.js express.js MySQL JWT ACL FULLTEXT Search REST API
====================

[![Author](https://img.shields.io/badge/author-%40daniel--lucas--silva-blue.svg)](https://facebook.com/dluuk)

## How to install

### Using Git (recommended)

1. Clone the project from github. Change "myproject" to you project name.

```bash
git clone git@github.com:daniel-lucas-silva/node-express-mysql-acl-jwt-rest.git ./myproject
```

### Install npm dependencies after installing (Git or manual download)

```bash
cd myproject
npm install
npm install nodemon -g
```
## How to run

### Database seed 

- `npm run sequelize db:seed:all`
email: admin@admin.com
password: 12345678 

### Database migration 

- `npm run sequelize db:migrate`
- `npm run sequelize db:migrate:undo`
- `npm run sequelize db:migrate:undo:all`

### Running in development mode (lifting API server)

```bash
npm run start
```

## Usage

### Creating new models

If you need to add more models to the project just create a new file in `/db/models/`

### Creating new routes

If you need to add more routes to the project just create a new file in `/routes/controllers/` and add it into `/routes/controllers/index.js`


This is the basic idea, inspired by [node-express-mongodb-jwt-rest-api-skeleton](https://github.com/davellanedam/node-express-mongodb-jwt-rest-api-skeleton) and [RealWorld](https://github.com/gothinkster/node-express-realworld-example-app/)