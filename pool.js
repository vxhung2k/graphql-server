import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  port:'3306',
  user: 'root',
  password: '@Vxhung2k',
  database: 'server-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
export default pool;
