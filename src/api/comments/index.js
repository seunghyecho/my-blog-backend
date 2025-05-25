import Router from 'koa-router';
import * as commentsCtrl from './comments.ctrl.js';
import checkLoggedIn from '../../lib/checkLoggedIn.js';

const comments = new Router();
comments.get('/:id', commentsCtrl.list);
comments.post('/', checkLoggedIn, commentsCtrl.write);
// comments.delete('/:id', checkLoggedIn, commentsCtrl.checkOwnComment, commentsCtrl.remove);
// comments.patch('/:id', checkLoggedIn, commentsCtrl.checkOwnComment, commentsCtrl.update);

// comments.use('/:id', commentsCtrl.getCommentById, comments.routes());

export default comments;