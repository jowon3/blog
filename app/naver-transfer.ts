export const NAVER_POLICY = {checkedAt:"2026-10-23",allowed:false,reason:"네이버의 사전 동의 없는 자동 콘텐츠 삽입은 실행하지 않습니다. 복사 후 직접 입력해 주세요.",terms:"https://policy.naver.com/policy/service.html",posts:"https://policy.naver.com/policy/service_group.html"} as const;
export function naverBlog(value:string){
 const text=value.trim();if(!text)return undefined;
 try{const url=new URL(text.includes("://")?text:`https://${text}`);if(url.protocol!=="https:"||!["blog.naver.com","m.blog.naver.com"].includes(url.hostname)||url.port||url.username||url.password||url.search||url.hash)return undefined;const match=url.pathname.match(/^\/([A-Za-z0-9_-]{2,50})\/?$/);if(!match||["postwriteform","postlist","postview","login"].includes(match[1].toLowerCase()))return undefined;const id=match[1];return {id,url:`https://blog.naver.com/${id}`,writeUrl:`https://blog.naver.com/${id}?Redirect=Write`};}catch{return undefined;}
}
export function photoHandoff<T extends {source:string;name:string}>(photos:T[],plan?:{photoKeys?:string[];items:{photo:number;placement:string;reason:string}[]}){
 const valid=Boolean(plan?.photoKeys?.join("|")===photos.map(p=>p.source).join("|")&&plan?.items.length===photos.length&&new Set(plan.items.map(p=>p.photo)).size===photos.length&&plan.items.every(p=>p.photo>=1&&p.photo<=photos.length));
 return photos.map((photo,index)=>({photo,order:index+1,placement:valid?plan!.items.find(p=>p.photo===index+1)?.placement||"직접 위치 확인":"추천 위치 미확인 · 본문을 확인해 직접 배치",reason:valid?plan!.items.find(p=>p.photo===index+1)?.reason||"":""}));
}
