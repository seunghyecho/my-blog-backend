import Router from 'koa-router';
import posts from './posts/index.js';
import auth from './auth/index.js';
import comments from './comments/index.js';
import users from './users/index.js';

const api = new Router();

api.use('/posts', posts.routes());
api.use('/auth', auth.routes());
api.use('/comments', comments.routes());
api.use('/users', users.routes());
// 라우터를 내보냅니다.
export default api;
