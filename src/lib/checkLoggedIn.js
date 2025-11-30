/**
 * 로그인 상태 확인 미들웨어
 * jwtMiddleware에서 설정한 ctx.state.user를 검증합니다.
 * 
 * @param {object} ctx - Koa context
 * @param {function} next - Next middleware
 * @returns {Promise|void}
 */
const checkLoggedIn = (ctx, next) => {
  // ctx.state.user가 설정되어 있는지 확인
  if (!ctx.state.user) {
    ctx.status = 401; // Unauthorized
    ctx.body = {
      error: "Authentication required",
      message: "Please log in to access this resource",
    };
    return;
  }

  // 필수 필드 검증 (_id와 username이 있어야 함)
  if (!ctx.state.user._id || !ctx.state.user.username) {
    ctx.status = 401; // Unauthorized
    ctx.body = {
      error: "Invalid authentication",
      message: "User information is incomplete",
    };
    return;
  }

  // 검증 통과 - ctx.state.user에 로그인한 사용자 정보가 설정됨
  console.log("checkLoggedIn - Authenticated user:", ctx.state.user);
  return next();
};

export default checkLoggedIn;
