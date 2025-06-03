import Post from '../../models/post.js';
import sanitizeHtml from 'sanitize-html';

// 모든 태그 조회
export const getTags = async (ctx) => {
    try {
        // 모든 게시물의 태그를 가져와서 중복 제거
        const posts = await Post.find().select('tags').lean();
        const tags = [...new Set(posts.flatMap(post => post.tags))];
        ctx.body = tags;
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 특정 태그의 게시물 수 조회
export const getTagCount = async (ctx) => {
    try {
        const { tag } = ctx.params;
        const count = await Post.countDocuments({ tags: tag });
        ctx.body = { tag, count };
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 태그별 게시물 목록 조회
export const getPostsByTag = async (ctx) => {
    const { tag } = ctx.params;
    const page = parseInt(ctx.query.page || '1', 10);

    if (page < 1) {
        ctx.status = 400;
        return;
    }

    try {
        const posts = await Post.find({ tags: tag })
            .sort({ _id: -1 })
            .limit(10)
            .skip((page - 1) * 10)
            .lean()
            .exec();
        const postCount = await Post.countDocuments({ tags: tag }).exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts.map((post) => ({
            ...post,
            body: removeHtmlAndShorten(post.body),
        }));
    } catch (e) {
        ctx.throw(500, e);
    }
};

// html 을 없애고 내용이 너무 길으면 200자로 제한시키는 함수
const removeHtmlAndShorten = (body) => {
    const filtered = sanitizeHtml(body, {
      allowedTags: [],
    });
    return filtered.length < 200 ? filtered : `${filtered.slice(0, 200)}...`;
  };