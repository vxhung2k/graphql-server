import pool from './pool.js';
import typeDefs from './schema/Schema.js';
import resolvers from './resolver/Resolver.js';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSubgraphSchema } from '@apollo/federation';
import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';
import cookieParser from 'cookie-parser';
import sql from './table.js';
// import authMiddleware from './auth.js';

const app = express();
app.use(cookieParser());
async function createTable() {
  try {
    const con = pool.getConnection();
    (await con).query(sql);
    console
      .log('create table successfull')(await con)
      .release();
  } catch (error) {
    console.log(`Error create table:${error}`);
  }
}
//  createTable();

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [ApolloServerPluginInlineTraceDisabled()],
  // plugins:[authMiddleware],
  context: (res, req) => {
    const token = req.cookies.token;
    return {
      pool,
      token,
      res,
      req,
    };
  },
});
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startServer().then(() => {
  app.listen({ port: 4000 }, () => {
    console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
  });
});
