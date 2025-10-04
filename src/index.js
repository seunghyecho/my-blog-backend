import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import mongoose from "mongoose";
import serve from "koa-static";
import path from "path";
import send from "koa-send";
import dotenv from "dotenv";
import api from "./api/index.js";
import jwtMiddleware from "./lib/jwtMiddleware.js";

dotenv.config();

// 비구조화 할당을 통하여 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

// MongoDB 연결 함수
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "blog",
      useNewUrlParser: true,
    });
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error("MongoDB connection error:", e);
  }
};

// Koa 앱 초기화 함수
const createApp = () => {
  const app = new Koa();
  const router = new Router();

  // CORS 설정
  const allowedOrigins = [
    "https://react-blog-app-amber-chi.vercel.app",
    "https://my-blog-seunghyes-projects.vercel.app",
    "https://my-blog-seunghyecho-seunghyes-projects.vercel.app",
    "https://my-blog-ntjgiol6j-seunghyes-projects.vercel.app",
    "http://localhost:3000", // 로컬 개발용
  ];

  app.use(
    cors({
      origin: (ctx) => {
        const requestOrigin = ctx.request.header.origin;
        if (allowedOrigins.includes(requestOrigin)) {
          return requestOrigin;
        }
        return false; // 허용되지 않은 origin이면 CORS 헤더 안 붙음
      },
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  );

  // 라우터 적용 전에 bodyParser 적용
  app.use(bodyParser());
  app.use(jwtMiddleware);

  // 라우터 설정
  router.use("/api", api.routes()); // api 라우트 적용

  // app 인스턴스에 라우터 적용
  app.use(router.routes()).use(router.allowedMethods());

  // const buildDirectory = path.resolve(__dirname, '../../blog-frontend/build');
  // app.use(serve(buildDirectory));
  // app.use(async (ctx) => {
  //   // Not Found 이고, 주소가 /api 로 시작하지 않는 경우
  //   if (ctx.status === 404 && ctx.path.indexOf('/api') !== 0) {
  //     // index.html 내용을 반환
  //     await send(ctx, 'index.html', { root: buildDirectory });
  //   }
  // });

  return app;
};

// Vercel 서버리스 함수 핸들러
export default async function handler(req, res) {
  // MongoDB 연결 확인
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const app = createApp();

  // Koa 앱을 HTTP 핸들러로 변환
  return new Promise((resolve, reject) => {
    const callback = app.callback();
    callback(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 로컬 개발용 서버 (Vercel 환경이 아닐 때만 실행)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const app = createApp();

  // 초기 MongoDB 연결
  connectDB();

  // PORT 가 지정되어있지 않다면 4000 을 사용
  const port = PORT || 4000;
  app.listen(port, () => {
    console.log("Listening to port %d", port);
  });
}
