import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { getProvince, getListDistrict, getListWard, hashPassword, checkOtp } from '../utilities.js';
import pool from '../pool.js';
import sendEmailOtp from '../mail-server.js';
import { Pagination } from '../pagination.js';

const resolvers = {
  Query: {
    async getUserById(_, { id }, { pool }) {
      const [rows] = await pool.query('SELECT * FROM User WHERE id = ?', [id]);
      return rows[0];
    },
    async getAllUser(_, { page, size }, { pool }) {
      const [rows] = await pool.query('SELECT * FROM User ');
      return Pagination(rows, page, size);
    },
    async getListProvince() {
      const province = getProvince();
      return province;
    },
    async getDistrictOfProvince(_, { id }) {
      const district = getListDistrict(id);
      return district;
    },
    async getWardOfDistrict(_, { id }) {
      const ward = getListWard(id);
      return ward;
    },
    async login(_, { username, password }, { pool }) {
      const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
      if (rows.length === 0) {
        throw new Error('Invalid username or password');
      }
      const user = rows[0];
      const isMatch = bcrypt.compareSync(password, user.password);

      if (!isMatch) {
        throw new Error('Invalid username or password');
      }
      const token = jwt.sign({ id: user.id, username: user.username }, `${process.env.SECRET}`, {
        expiresIn: '24h',
      });
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'dev',
      });
      return { id: user.id, token: token };
    },
    async logout(res, req) {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      // Delete the JWT from the database
      return { message: 'logout success', success: true };
    },
    async filterUser(_, { data, page, size }, { pool }) {
      const query = Object.entries(data)
        .map(([key, value]) => `${key} LIKE '%${value}%'`)
        .join(' AND ');
      const [rows] = await pool.query(`SELECT * FROM User WHERE ${query}`);
      return Pagination(rows, page, size);
    },
  },
  Mutation: {
    async createUser(_, { data }, { pool }) {
      const {
        username,
        password,
        email,
        gender,
        fullName,
        phoneNumber,
        avatar,
        province,
        district,
        ward,
        street,
        houseNumber,
        dateOfBirth,
      } = data;
      // Check for a valid email format using a regular expression
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      //check password
      let hash_password;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error('Invalid password format');
      } else {
        // hash password before insert new user to database
        hash_password = hashPassword(password);
      }
      // Check if email already exists in the database
      const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
      if (rows.length > 0) {
        throw new Error('Email already exists');
      }
      //create id
      const id = uuidv4();
      //check phonenumber
      const phoneNumberRegex = /^0\d{9}$/;
      if (!phoneNumberRegex.test(phoneNumber)) {
        throw new Error('Invalid phoneNumber format');
      }
      // Insert the new user into the database
      const result = await pool.query(
        'INSERT INTO User ( id, username,password,email,gender,fullName,phoneNumber,avatar,province,district,ward,street,houseNumber,dateOfBirth) VALUES (?,?,?, ?, ?, ?, ?,?,?,?,?,?,?,?)',
        [
          id,
          username,
          hash_password,
          email,
          gender,
          fullName,
          phoneNumber,
          avatar,
          province,
          district,
          ward,
          street,
          houseNumber,
          dateOfBirth,
        ],
      );
      return { id: id, success: true };
    },
    async updateUser(_, { data }) {
      const { id, ...userData } = data;
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query('UPDATE User SET ? WHERE id = ?', [userData, id]);
        await conn.commit();
        conn.release();
        const [user] = await conn.query('SELECT * FROM User WHERE id = ?', [id]);
        return user[0];
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    },
    async deleteUser(_, { id }, { pool }) {
      const [rows] = await pool.query('SELECT id FROM User WHERE id = ?', [id]);
      if (rows[0]) {
        await pool.query('DELETE FROM User WHERE id = ?', [id]);
        return { message: 'deleted successfull', success: true };
      } else {
        return { message: 'user not exist', success: false };
      }
    },
    async sendOtp(_, { email }, { pool }) {
      const otp = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
      const data = {
        from: 'example@gmail.com',
        to: email,
        subject: 'Email verify reset password',
        text: `the otp code is: ${otp}`,
      };
      const [user] = await pool.query('SELECT id FROM User WHERE email= ?', [email]);
      const result = await sendEmailOtp(data, user[0].id);
      return result;
    },
    async resetPassword(_, { password, otp }) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        let hash_password;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error('Invalid password format');
        } else {
          // hash password before insert new user to database
          hash_password = hashPassword(password);
        }
        const dataRes = await checkOtp(otp);
        if (dataRes.success) {
          await conn.query('UPDATE User SET password = ? WHERE id = ?', [
            hash_password,
            dataRes.data.user_id,
          ]);
          await conn.commit();
          return { message: 'reset password success', success: true };
        } else {
          return { message: 'reset password failed', success: false };
        }
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    },
    async changePassword(_, { password, password_confirm, email, otp }) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        let hash_password;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (password != password_confirm) {
          throw new Error('password_confirm not alike password');
        }
        if (!passwordRegex.test(password)) {
          throw new Error('Invalid password format');
        } else {
          // hash password before insert new user to database
          hash_password = hashPassword(password);
        }
        const dataRes = await checkOtp(otp);
        const [user] = conn.query('SELECT * FROM User WHERE email = ?', [email]);
        if (dataRes.success && user[0]) {
          await conn.query('UPDATE User SET password = ? WHERE id = ?', [
            hash_password,
            dataRes.data.user_id,
          ]);
          await conn.commit();
          return { message: 'change password success', success: true };
        } else {
          return { message: 'change password failed', success: false };
        }
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    },
    async likeOrUnlike(_, { data }) {
      const con = await pool.getConnection();
      try {
        await con.beginTransaction();
        const [user] = await con.query('SELECT id FROM Likes WHERE user_id = ?', [data.user_id]);
        if (user[0]) {
          await con.query('DELETE FROM Likes WHERE id = ?', [user[0].id]);
          await con.commit();
          con.release();
          return { user_id: data.user_id, product_id: data.product_id, is_liked: false };
        } else {
          await con.query('INSERT INTO Likes (user_id,product_id) VALUES (?,?)', [
            data.user_id,
            data.product_id,
          ]);
          await con.commit();
          con.release();
          return { user_id: data.user_id, product_id: data.product_id, is_liked: true };
        }
      } catch (error) {
        await con.rollback();
        con.release();
        throw error;
      }
    },
    async comment(_, { data }) {
      const con = await pool.getConnection();
      try {
        await con.beginTransaction();
        if (_.isUndefined(data.parent_id)) {
          await con.query('INSERT INTO Comment (comment,user_id,product_id) VALUES (?,?,?)', [
            data.comment,
            data.user_id,
            data.product_id,
          ]);
          await con.commit();
          con.release();
          return { user_id: data.user_id, comment: data.comment, product_id: data.product_id };
        } else {
          await con.commit();
          con.release();
          return { user_id: data.user_id, comment: data.comment, product_id: data.product_id };
        }
      } catch (error) {
        await con.rollback();
        con.release();
        throw error;
      }
    },
    async createProduct(_, { data }) {
      const con = await pool.getConnection();
      try {
        await con.beginTransaction();
      } catch (error) {
        await con.rollback(error);
        con.release();
      }
    },
    async updateProduct(_, [data]) {
      const { id, ...productData } = data;
      const con = await pool.getConnection();
      try {
        await con.beginTransaction();
        await con.query('UPDATE Product SET ? WHERE id = ?', [productData, id]);
        await con.commit();
        con.release();
        const [product] = await con.query('SELECT * FROM Product WHERE id = ?', [id]);
        return product[0];
      } catch (err) {
        await con.rollback(err);
        con.release();
      }
    },
    async deleteProduct(_, { id }) {
      const con = pool.getConnection();
      try {
        (await con).beginTransaction();
        (await con).query('DELETE FROM Product WHERE id = ?', [id]);
        (await con).commit;
      } catch (error) {
        (await con).rollback(error);
      }
      (await con).release();
      return { message: 'delete successfull', success: true };
    },
  },
};
export default resolvers;
