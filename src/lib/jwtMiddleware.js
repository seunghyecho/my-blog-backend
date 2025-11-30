import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { getToken } from "next-auth/jwt";

/**
 * Koa context를 Next.js Request 형식으로 변환
 * getToken은 Request 객체의 headers.cookie 또는 cookies를 확인합니다
 */
const createNextAuthRequest = (ctx) => {
  // Koa의 쿠키를 객체로 변환
  const cookies = {};
  const cookieHeader = ctx.request.header.cookie || "";
  
  // 쿠키 문자열을 파싱하여 객체로 변환
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        cookies[key] = decodeURIComponent(value);
      }
    });
  }

  // Next.js Request 형식의 객체 생성
  // getToken은 headers.cookie 또는 cookies 객체를 확인합니다
  return {
    headers: {
      cookie: cookieHeader,
    },
    cookies: cookies,
  };
};

const jwtMiddleware = async (ctx, next) => {
  // 1. 먼저 백엔드 자체 JWT 토큰 확인
  const accessToken = ctx.cookies.get("access_token");
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      ctx.state.user = {
        _id: decoded._id,
        username: decoded.username,
      };

      // 토큰 3.5일 미만 남으면 재발급
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
        const user = await User.findById(decoded._id);
        const token = user.generateToken();
        ctx.cookies.set("access_token", token, {
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
          httpOnly: true,
        });
      }

      return next();
    } catch (e) {
      // 토큰 검증 실패
      console.error("JWT Verification Error:", e.message);
    }
  }

  // 2. 백엔드 JWT가 없으면 Next-Auth 세션 토큰 확인
  // getToken은 자동으로 쿠키에서 세션 토큰을 찾
  // (로컬: next-auth.session-token, 배포: __Host-next-auth.session-token 등)
  if (process.env.NEXTAUTH_SECRET) {
    try {
      // Koa context를 Next.js Request 형식으로 변환
      const req = createNextAuthRequest(ctx);

      // Next-Auth의 getToken을 사용하여 세션 토큰 디코딩
      // getToken은 자동으로 환경에 맞는 쿠키 키를 찾아 처리
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      console.log("jwtMiddleware - Next-Auth token decoded:", token);

      if (token) {
        // Next-Auth 토큰에서 사용자 정보 추출
        // Next-Auth 세션 구조: { sub, email, name, ... } 또는 { user: { ... } }
        const username = token.name || token.username || token.email?.split("@")[0];
        
        if (username) {
          // DB에서 사용자 조회
          const user = await User.findByUsername(username);
          console.log("jwtMiddleware - User found in DB:", !!user);

          if (user) {
            ctx.state.user = {
              _id: user._id.toString(),
              username: user.username,
            };

            console.log("jwtMiddleware - ctx.state.user set:", ctx.state.user);

            // Next-Auth 토큰이 유효하면 백엔드 JWT도 발급
            // 이렇게 하면 다음 요청부터는 백엔드 JWT를 사용할 수 있습니다
            const backendToken = user.generateToken();
            ctx.cookies.set("access_token", backendToken, {
              maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });

            return next();
          } else {
            console.error("jwtMiddleware - User not found in DB for username:", username);
          }
        } else {
          console.error("jwtMiddleware - No username found in Next-Auth token");
        }
      }
    } catch (e) {
      console.error("Next-Auth Token Verification Error:", e.message);
      console.error("Error stack:", e.stack);
    }
  }

  // 3. 둘 다 없거나 검증 실패한 경우
  return next();
};

export default jwtMiddleware;
