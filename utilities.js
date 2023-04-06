import _ from 'lodash';
import XLSX from 'xlsx';
import bcrypt from 'bcrypt';
import pool from './pool.js';

function getProvince() {
  const data = XLSX.readFile('./data/Provinces.xls');
  const sheetName = data.SheetNames[0];
  const worksheet = data.Sheets[sheetName];
  const data_json = XLSX.utils.sheet_to_json(worksheet, { header: ['id', 'name'], range: 1 });
  return data_json;
}

function getListDistrict(id) {
  const data = XLSX.readFile('./data/DistrictsAndWards.xls');
  const sheetName = data.SheetNames[0];
  const worksheet = data.Sheets[sheetName];
  const data_json = XLSX.utils.sheet_to_json(worksheet, {
    header: ['a', 'b', 'name', 'id'],
    range: 1,
  });
  const district = _.filter(data_json, (data) => data.b == id);
  const x = [];
  for (const i in district) {
    const a = _.omit(district[i], ['a', 'b']);
    x.push(a);
  }
  const uniqueArray = x.filter((object, index, self) => {
    return index === self.findIndex((o) => o.name === object.name && o.id === object.id);
  });
  return uniqueArray;
}

function getListWard(id) {
  const data = XLSX.readFile('./data/DistrictsAndWards.xls');
  const sheetName = data.SheetNames[0];
  const worksheet = data.Sheets[sheetName];
  const data_json = XLSX.utils.sheet_to_json(worksheet, {
    header: ['a', 'b', 'c', 'id_district', 'name', 'id'],
    range: 1,
  });
  const x = [];

  const ward = _.filter(data_json, (data) => data.id_district == id);
  for (const i in ward) {
    const a = _.omit(ward[i], ['a', 'b', 'c', 'id_district']);
    x.push(a);
  }
  return x;
}

function hashPassword(password) {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  // Hash the password with the salt
  const hashedPassword = bcrypt.hashSync(password, salt);
 return hashedPassword
}

async function checkOtp(otp){
  const conn = await pool.getConnection();
  const [Otp] = await conn.query('SELECT * FROM Otp WHERE otp = ? ',[otp])
  if(Otp.length > 0){
    return {success:true,data:Otp[0]}
  }else{
    return {success:false,data:Otp[0]}
  }
}

export { getProvince, getListDistrict, getListWard, hashPassword ,checkOtp};
