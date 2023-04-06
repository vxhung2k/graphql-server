import jwt from 'jsonwebtoken';

import pool from './pool.js';

const authMiddleware = async (resolve, parent, args, context, info) => {
    // Get a connection from the pool
    const conn = await pool.getConnection();
  
    try {
      // Extract the JWT from the context
      const token = context.jwt;
  
      // Verify the JWT and fetch the user ID
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        context.userId = decoded.userId;
      } catch (err) {
        throw new Error('Invalid token');
      }
  
      // Call the next resolver in the chain
      return resolve(parent, args, context, info);
    } finally {
      // Release the connection back to the pool
      conn.release();
    }
  };
  export default authMiddleware