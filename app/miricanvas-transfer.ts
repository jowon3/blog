export const MIRICANVAS_URL="https://www.miricanvas.com/";
export function miricanvasThumbnailBrief({customerName,title,caption,photoName}:{customerName:string;title:string;caption?:string;photoName?:string}){
 return [`블로그 썸네일을 만들어 주세요.`, `고객명: ${customerName}`, `원고 제목: ${title.trim()}`,caption?.trim()?`기존 썸네일 문구(참고): ${caption.trim()}`:"",`먼저 제목의 의미를 유지한 짧은 썸네일 문구 3개를 추천하고, 썸네일에 어울리는 템플릿을 제안해 주세요.`,`확인되지 않은 사실·수치·성과는 추가하지 말아 주세요.`,`선택한 템플릿에서 사진, 문구, 로고를 직접 수정할 수 있게 제작해 주세요.`,photoName?`대표 사진: ${photoName} (BLOG STUDIO에서 선택한 사진 중 첫 번째 사진)\n이 파일은 자동 전송되지 않았습니다. 미리캔버스에서 해당 사진을 직접 업로드한 뒤 사용해 주세요.`:`대표 사진은 미리캔버스에서 직접 선택·업로드하겠습니다.`].filter(Boolean).join("\n\n");
}
export async function openMiricanvasThumbnail(brief:string,actions:{copy:(text:string)=>Promise<void>;open:(url:string)=>void;manualCopy:(text:string)=>void}){
 // Start the clipboard operation and open the official site within the same user gesture.
 let copying:Promise<void>;try{copying=actions.copy(brief);}catch{copying=Promise.reject(Error("복사 실패"));}
 actions.open(MIRICANVAS_URL);
 try{await copying;return true;}catch{actions.manualCopy(brief);return false;}
}
