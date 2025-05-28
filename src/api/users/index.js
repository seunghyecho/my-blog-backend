import Router from 'koa-router';
import * as usersCtrl from './users.ctrl.js';
import checkLoggedIn from '../../lib/checkLoggedIn.js';

const users = new Router();

// 로그인한 사용자 정보 조회 (checkLoggedIn 미들웨어 추가)
users.get('/me', checkLoggedIn, usersCtrl.getMyInfo);

export default users;