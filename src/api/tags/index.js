import Router from 'koa-router';
import * as tagsCtrl from './tags.ctrl.js';

const tags = new Router();

// 태그 관련 라우트 설정
tags.get('/', tagsCtrl.getTags);  // 모든 태그 조회
tags.get('/:tag', tagsCtrl.getTagCount);  // 특정 태그의 게시물 수 조회
tags.get('/:tag/posts', tagsCtrl.getPostsByTag);  // 특정 태그의 게시물 목록 조회

export default tags; 