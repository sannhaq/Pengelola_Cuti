!-- Dokumentation -->

## Dokumentation
This is a server for In Room Service System. It is made with [Node.js](https://nodejs.org/en/download/) and [Express](https://expressjs.com/). The database is made with [PostgreSQL](https://www.postgresql.org/).

## Table of Contents

- [How to Contributing](#how-to-contributing)
  - [Step by Step to Create new API](#step-by-step-to-create-new-api)
  - [For Better Developer Experience](#for-better-developer-experience)
    - [Principles](#principles)
    - [Extensions](#extensions)
- [References](#references)

## Getting Started

### Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [GIT](https://git-scm.com/downloads)

### Installation

1. Clone the repo

```sh
git clone https://github.com/sannhaq/pembagian_cuti.git
```

2. Install NPM packages

```sh
npm install
```

3. Start the server

```sh
npm run dev
```

## Usage

1. Open [Postman](https://www.postman.com/downloads/)
2. Use the API

# How to Contributing

Make sure you have followed the steps in [Getting Started](#getting-started)

## Step by Step to Create new API

1. Create new file in `controllers` folder
2. Create new file in `routes` folder
3. Put it in `index.js`

4. Commit your changes

```sh
git commit -m "feat: Add some <feature-name>"
```

5. Push to the branch

```sh
git push origin feature/<feature-name>
```

## For Better Developer Experience

### Principles

- [ ] [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [ ] [KISS](https://en.wikipedia.org/wiki/KISS_principle)
- [ ] [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it)
- [ ] [SOLID](https://en.wikipedia.org/wiki/SOLID)

# References

- [Node.js](https://nodejs.org/en/download/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Postman](https://www.postman.com/downloads/)

# Database
This folder contains the database structure, database migrations and model to create the database and its tables for Pembagian Cuti using Prisma (Javascript).

- [Database](#database)
  - [Table of contents](#table-of-contents)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [How to contribute](#how-to-contribute)
  - [Requirements](#requirements-1)
  - [Step by step guide to create a new migration](#step-by-step-guide-to-create-a-new-migration)
  - [Step by step guide to revert a migration](#step-by-step-guide-to-revert-a-migration)

# Requirements
- PostgreSQL

# Getting Started
1. open the `.env_example` file and copy its content.
2. Create a new file named `.env` and paste the content.

3. Run the following command to install the dependencies:

```bash
npm install
```

4. Run the following command to push existing database migrations and its tables:

```bash
npx prisma db push
```

5. Run the following command to seed the database:

```bash
npx prisma db seed
```

# How to contribute

## Requirements

- NodeJS
- NPM
- GIT
- PostgreSQL
- Code Editor (Visual Studio Code, Atom, Sublime Text, etc.)

## Step by step guide to create a new migration

1. Create a new model in the `schema.prisma` file.
2. Run the following command to create a new migration:

```bash
npx prisma migrate dev --name <migration_name>
```

3. Create Seed data in the `seeder` directory
4. Run the following command to seed the database:

```bash
npx prisma migrate reset
```

5. See the changes in the database.
6. Or See the changes in the `prisma studio` .
7. Run the following command to see the changes in the `prisma studio`:

```bash
npx prisma studio
```

8. Open the browser and go to `localhost:5555` to see the changes in the `prisma studio`.
9. Commit the changes.
10. Push the changes to the repository.

## Step by step guide to revert a migration

1. Make changes to the `schema.prisma` file.
2. Run the following command to revert the migration:

```bash
npx prisma migrate reset
```

3. See the changes in the database.
4. Or See the changes in the `prisma studio` .
5. Run the following command to see the changes in the `prisma studio`:

```bash
npx prisma studio
```

6. Open the browser and go to `localhost:5555` to see the changes in the `prisma studio`.
7. Create a [new migration](#step-by-step-guide-to-create-a-new-migration) to fix the issue.
8. Commit the changes.
9. Push the changes to the repository.