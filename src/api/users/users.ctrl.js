import User from '../../models/user.js';

// 로그인한 사용자 정보 조회
export const getMyInfo = async (ctx) => {
    try {
        // ctx.state.user는 checkLoggedIn 미들웨어에서 설정된 현재 로그인한 사용자 정보
        const user = await User.findById(ctx.state.user._id);
        
        if (!user) {
            ctx.status = 404;
            return;
        }

        // 비밀번호를 제외한 사용자 정보 반환
        ctx.body = {
            _id: user._id,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    } catch (e) {
        ctx.throw(500, e);
    }
};