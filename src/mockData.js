import Post from './models/post.js.js';

export default function mockData() {
  const posts = [...Array(40).keys()].map((i) => ({
    title: `post #${i}`,
    body:
      '해당 에러는 말 그대로 특정 서버가 다른 프로세서에서 이미 사용중이기 때문에 해당 서버를 실행할 수 없어 발생하는 에러이다.\n' +
      '내 경우엔 과제를 하면서 사용했던 node.js 서버를 제대로 끄지 않고 종료해서 이런 에러를 만나게 된 듯하다. 또 이럴 것 같고 그때마다 검색하기 귀찮기 때문에 블로그에 올려두기로',
    tags: ['mock', 'data'],
  }));
  Post.insertMany(posts, (err, docs) => {
    console.log(docs);
  });
}
