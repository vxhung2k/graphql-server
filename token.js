import jwt from 'jsonwebtoken';
import moment from 'moment';

export function isTokenExpired(token) {
  //decode token
  const decode_token_time = moment.unix(jwt.decode(token).exp);
  console.log(decode_token_time);
  const now = moment();
  if (decode_token_time.isAfter(now)) {
    return true;
  } else {
    return false;
  }
}
export function autoLogout() {}
console.log(
  isTokenExpired(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjE3OGViLTA3MzgtNDE5YS05MDYyLWI3N2ExZWM3ZTc1NSIsInVzZXJuYW1lIjoidnhodW5nIiwiaWF0IjoxNjc5NjI2MzUyLCJleHAiOjE2Nzk2MzM1NTJ9.Ov-sN2rjODD0y26L9IsryUD_wLZ0RrV-DV-Jagzpm44',
  ),
);

// const a = moment(
//   jwt.decode(
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjE3OGViLTA3MzgtNDE5YS05MDYyLWI3N2ExZWM3ZTc1NSIsInVzZXJuYW1lIjoidnhodW5nIiwiaWF0IjoxNjc5NjI2MzUyLCJleHAiOjE2Nzk2MzM1NTJ9.Ov-sN2rjODD0y26L9IsryUD_wLZ0RrV-DV-Jagzpm44',
//   ).exp,
// );
// const b = jwt.decode(
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NjE3OGViLTA3MzgtNDE5YS05MDYyLWI3N2ExZWM3ZTc1NSIsInVzZXJuYW1lIjoidnhodW5nIiwiaWF0IjoxNjc5NjI2MzUyLCJleHAiOjE2Nzk2MzM1NTJ9.Ov-sN2rjODD0y26L9IsryUD_wLZ0RrV-DV-Jagzpm44',
// ).exp;
// console.log(b);
