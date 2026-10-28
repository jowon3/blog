import { NAVER_POLICY } from "../../naver-transfer";

export async function GET(request:Request){
 const host=new URL(request.url).hostname;
 if(process.env.VERCEL||!["localhost","127.0.0.1","[::1]"].includes(host))return Response.json({connected:false,localOnly:true,automationAllowed:false,message:"배포 환경에서는 로컬 브라우저 제어를 사용하지 않습니다. 수동 입력을 이용하세요."});
 try{const response=await fetch("http://127.0.0.1:4318/status",{cache:"no-store",signal:AbortSignal.timeout(1800)});const status=await response.json();if(!response.ok||status.service!=="blog-studio-local")throw Error();return Response.json({...status,connected:true,automationAllowed:false,policy:NAVER_POLICY});}catch{return Response.json({connected:false,automationAllowed:false,mode:"manual-only",message:"로컬 진단 서버 미연결 · 수동 입력 기능은 사용할 수 있습니다.",policy:NAVER_POLICY});}
}
export async function POST(request:Request){
 const url=new URL(request.url);const origin=request.headers.get("origin");if(process.env.VERCEL||!["localhost","127.0.0.1","[::1]"].includes(url.hostname)||origin!==url.origin)return Response.json({error:"LOCAL_ONLY"},{status:403});
 const data=await request.json().catch(()=>null);
 if(data?.action!=="stop")return Response.json({error:"NAVER_POLICY_NOT_AUTHORIZED",message:NAVER_POLICY.reason,automationAllowed:false},{status:403});
 try{const response=await fetch("http://127.0.0.1:4318/stop",{method:"POST",signal:AbortSignal.timeout(1800)});return Response.json(await response.json());}catch{return Response.json({stopped:true,activeJob:null,message:"실행 중인 자동 입력 작업이 없습니다."});}
}

