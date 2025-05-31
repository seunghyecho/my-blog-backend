import Joi from "@hapi/joi"
import Comment from "../../models/comment.js";

export const write = async (ctx) => {
    // 1. 입력값 검증을 위한 스키마 정의
    const schema = Joi.object().keys({
        content: Joi.string().required(),
        postId: Joi.string().required(),
    });

    // 2. 요청 데이터 검증
    const result = schema.validate({
        ...ctx.request.body,
    });
    
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    // 3. 데이터 추출
    const {content, postId} = result.value;
    const user = ctx.state.user;

    // 4. 댓글 생성
    try{
        const comment = await Comment.create({
            postId,
            content,
            user: {
                _id: user._id,
                username: user.username
            }
        });
        ctx.body = comment;
    }catch(e){
        ctx.throw(500, e);
    }
}

export const list = async (ctx) => {
    const { id } = ctx.params;
    
    try {
        // 특정 포스트의 모든 댓글을 생성일 기준 내림차순으로 조회
        const comments = await Comment.find({ postId:id }).sort({ createdAt: -1 }).exec();
            
        ctx.body = comments;
    } catch (e) {
        ctx.throw(500, e);
    }
}