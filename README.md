# bnmofin-api

13520024 Hilya Fadhilah Imania


## Stack

- Node.js >=16
- yarn
- Express
- PostgreSQL
- Redis
- [Firebase Storage](https://firebase.google.com/docs/admin/setup)
- ApiLayer [Exchange Rate API](https://exchangeratesapi.io/documentation/)

### Relevant Tools

- [TypeORM](https://typeorm.io/) `0.3.x`
- TypeORM Seeding (fork by jorgebodega) `5.x`
- `jsonwebtoken`
- `bcryptjs`
- Axios

### Other Tools

- `routing-controllers`
- `class-validator`
- `class-transformer`
- `fakerjs`


## Environment Variables

#### Notes

In this section, these values are defined as
- *Truthy value*: `TRUE`, `T`, `YES`, `Y`, `1`, `ON`
- *Falsy value*: `FALSE`, `F`, `NO`, `N`, `0`, `OFF`

> Case insensitive

Also, if you are not using docker, you need to set up the environment
yourself. This app **does NOT use dotenv**.

### App

Most important environment variable for setup is `PORT`. This needs
to be the same port the client(s) will be connecting to. Set it up to
whatever value available on your host. Default value: `3030`.

### Stack-Related

Important variables that need to be configured by yourself:

- `APILAYER_KEY`: ApiLayer Key (for Exchange API)
- `GOOGLE_APPLICATION_CREDENTIALS`: Google service account key file
- `GOOGLE_STORAGE_BUCKET`: Google storage bucket url

#### Without Docker Compose

You can set up database and redis connection options for development
or other cases where you need to connect to database and redis server
other than local docker compose services.

- `DATABASE_URL`: PostgreSQL connection URL
- `DATABASE_SSL`: If set to *truthy value* will enable SSL connection
- `REDIS_URL`: Redis connection URL

### Seeding

It is recommended to enable seeding *the first time* you run the app,
then disable it afterwards.

Specify `SEED_DATA` to *truthy value* alongside `NODE_ENV=development`
(or unset). Beware that the seeder will **drop the database schema**
**alongside all data inside it**.

> If `NODE_ENV` is set to `production` the app will not run the seeder.

The `SEED_INFO` variable is useful to get information for testing
purposes. It will print out the user info needed for authentication.
This feature is tightly related to the seeder because the seeder will
make accounts have the same password as their username. (Aside for
easier input, this is due to the password being one-way encrypted.)

Sample output when `SEED_INFO` is set to *truthy value*:

```
--- Start Seeder Info ---

[Admin Accounts]
- Cydneyrnmg4
- Santa63860
- Timmyzm2yb
- Samanthabperq
- Kylee9o5q9

[Customer Accounts (positive balance)]
- Alverta8aj2o
- Peggieul7pj
- Helena1ohdo
- Gabet438q
- Demetriuselzn6

[Customer Accounts (negative balance)]
- Hobart69yoe
- Brendaubu5v
- Dustino6mw9
- Antwonc49cn
- Richardhxate

P.S. Username = Password


--- End Seeder Info ---
```

> Output of seeder info is console-only and not logged.

### Logging

Error-level log file is enabled by default and can be disabled with
*falsy value*. All-level log file can be enabled with *truthy value*.
A custom path file can also be specified. By default, the logs will
be on `logs/errors.log` and `logs/logs.log`.

### Others

For other variables and more information see `.env.example`.


## Build & Run

### Docker compose

```
$ docker compose [--env-file path-to-env-file] build
$ docker compose [--env-file path-to-env-file] up [-d]
```

### Without Docker

```
$ yarn
$ yarn build
$ yarn start
```

> Don't forget to set up the `DATABASE_URL` and `REDIS_URL` env variables.

### Development (recommended)

With db & redis env settings:

```
DATABASE_HOSTPORT=5433
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/bnmofin
REDIS_HOSTPORT=6380
REDIS_URL=redis://localhost:6380
```

Then run:

```
$ docker compose [--env-file path-to-dev-env-file] up db redis -d
$ yarn dev
```

## Scripts

- `seed:run`: Run the seeder & seeder info, regardless of `SEED_DATA`
  and `SEED_INFO` environment settings. Beware when running on production.
- `seed:info`: Only run seeder info.
- `storage:clear`: Delete all files from google storage "directory" (which can
  be defined with `GOOGLE_STORAGE_PREFIX`)

> For these scripts to run properly the related environment variables need to
> be set


## Documentation

API Docs is available on [bnmofin swagger](https://app.swaggerhub.com/apis/bnmofin/bnmofin-api/1.0).

## Database Schema

![Database Schema Entity-Relationship Diagram](/docs/schema.png)

## Design Patterns

#### 1. Singleton

Used for database & redis connection and logging mechanism (file opening, etc.).
All of which only need to be instantiated once. The implementation does not use
objects, but rather ES6 exports, using `const` to prevent reassignment.

See: `src/data-source.ts`, `src/logger.ts`, `src/cacher.ts`

#### 2. Chain of responsibility

This design pattern is implemented through middlewares and interceptors. Each
middleware deals with specific task, but all work upon the same `Request` object
that is instantiated for each request the server receives.

See: `src/middlewares/`

#### 3. Factory Method

This pattern is used for seeding. Creation of each entity object with random values
is "uniform" (have specific rules) for each entity type. So the code that handles the
seeding uses the factories and doesn't need to worry about the specific details of
generating random entity objects.

See: `src/seed/factories/`


## Deployment

The `master` branch is deployed and live on <https://bnmofin-api.herokuapp.com>
using Heroku automatic deployment.
