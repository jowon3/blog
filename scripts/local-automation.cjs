// Local diagnostics companion. No Naver DOM input, login or publish implementation.
const http = require('node:http');
const { createRequire } = require('node:module');
const path = require('node:path');
function diagnostics(){const requireFromProject=createRequire(path.join(__dirname,'..','package.json'));let playwright=false;for(const name of ['playwright','@playwright/test','playwright-core']){try{requireFromProject.resolve(name);playwright=true;break;}catch{}}return {service:'blog-studio-local',version:1,mode:'manual-only',browser:'not-launched',automationAllowed:false,playwrightAvailable:playwright,activeJob:null,reason:'NAVER_POLICY_NOT_AUTHORIZED',message:'사전 허락 없는 자동 입력은 차단됩니다. 수동 입력을 이용하세요.'};}
function makeServer(){return http.createServer((req,res)=>{
 const allowed=new Set(['http://localhost:3000','http://127.0.0.1:3000']);
 const origin=req.headers.origin;if(origin&&!allowed.has(origin)){res.writeHead(403);return res.end();}
 if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)){res.writeHead(403);return res.end();}
 if(!/^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host||'')){res.writeHead(403);return res.end();}
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');if(origin)res.setHeader('Access-Control-Allow-Origin',origin);
 if(req.method==='GET'&&req.url==='/status')return res.end(JSON.stringify(diagnostics()));
 if(req.method==='POST'&&req.url==='/start'){res.writeHead(403);return res.end(JSON.stringify({error:'NAVER_POLICY_NOT_AUTHORIZED',...diagnostics()}));}
 if(req.method==='POST'&&req.url==='/stop')return res.end(JSON.stringify({stopped:true,...diagnostics(),message:"실행 중인 자동 입력 작업이 없습니다."}));
 res.writeHead(404);res.end(JSON.stringify({error:'NOT_FOUND'}));
 });}
if(require.main===module){const server=makeServer();server.listen(4318,'127.0.0.1',()=>console.log('BLOG STUDIO local diagnostics: http://127.0.0.1:4318 (manual-only)'));server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'포트 4318 사용 중입니다. 기존 진단 서버를 확인하세요.':error.message);process.exitCode=1;});}
module.exports={makeServer,diagnostics};

