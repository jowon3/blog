"use client";
import {useState} from "react";
import {miricanvasThumbnailBrief,openMiricanvasThumbnail} from "./miricanvas-transfer";
export default function MiricanvasThumbnailButton({customerName,title,caption,photoName,disabled,onNotice}:{customerName:string;title:string;caption?:string;photoName?:string;disabled:boolean;onNotice:(message:string)=>void}){
 const [busy,B]=useState(false);
 async function open(){B(true);try{const brief=miricanvasThumbnailBrief({customerName,title,caption,photoName});const copied=await openMiricanvasThumbnail(brief,{copy:text=>navigator.clipboard.writeText(text),open:url=>{window.open(url,"_blank","noopener,noreferrer");},manualCopy:text=>{window.prompt("자동 복사가 차단되었습니다. 아래 제작 요청 문구를 복사해 미리캔버스에서 사용하세요.",text);}});onNotice(copied?"썸네일 제작 요청을 복사했습니다. 미리캔버스에서 붙여넣고 템플릿을 선택하세요. 대표 사진은 직접 업로드해 주세요.":"미리캔버스를 새 탭으로 열었습니다. 제작 요청 문구는 복사 창에서 직접 복사해 주세요.");}catch{onNotice("미리캔버스를 열지 못했습니다. 브라우저의 새 탭·팝업 설정을 확인하고 다시 눌러 주세요.");}finally{B(false);}}
 return <button type="button" className="button secondary miricanvas-thumbnail-button" disabled={disabled||busy||!title.trim()} title="제작 요청을 복사하고 미리캔버스 열기 · 대표 사진은 선택 목록의 첫 번째 사진" onClick={open}>{busy?"미리캔버스 여는 중…":"미리캔버스로 썸네일 만들기"}</button>;
}
