import 'reflect-metadata'

import { createConnection, getConnectionOptions } from 'typeorm'

import { ApolloServer } from 'apollo-server-express'
import { AuthResolver } from './resolvers/AuthResolver'
import { BookResolver } from './resolvers/BookResolver'
import { buildSchema } from 'type-graphql'
import connectSqlite3 from 'connect-sqlite3'
import express from 'express'
import session from 'express-session'

// I like to use redis for this: https://github.com/tj/connect-redis
const SQLiteStore = connectSqlite3(session)
;(async () => {
  const app = express()

  // Session Middleware, run before resolvers/other express uses
  app.use(
    // Specify DB
    session({
      store: new SQLiteStore({
        db: 'database.sqlite',
        concurrentDB: true
      }),
      name: 'qid', // cookie name
      secret: process.env.SESSION_SECRET || 'superhashedrandomvalue', // secret for the cookie to store in .env
      resave: false, // stop unecessary refreshing of session when no data change
      saveUninitialized: false, // stop unnecessary refreshing of session when no data change
      // Create a cookie using these options
      cookie: {
        httpOnly: true, // for security
        secure: process.env.NODE_ENV === 'production', // for HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years, then invalidated session
      }
    })
  )

  // Establish the DB connection
  // get options from ormconfig.js
  const dbOptions = await getConnectionOptions(
    process.env.NODE_ENV || 'development'
  )
  // default so Entities pick up the name for the connection; else must be specified each call to DB
  await createConnection({ ...dbOptions, name: 'default' })

  // Initialize Apollo resolver
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      // graphQL schema
      resolvers: [AuthResolver, BookResolver],
      validate: false
    }),
    // req and res are put in the context, for access by resolvers, to get session
    context: ({ req, res }) => ({ req, res })
  })

  // Apply the middleware to the express object
  apolloServer.applyMiddleware({ app, cors: false })

  // Set up port for Heroku
  const port = process.env.PORT || 4000
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql`)
  })
})()
