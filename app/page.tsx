"use client";
import { useEffect, useState } from "react";
import {readCustomerSettings,writeCustomerSettings} from "./customer-storage";
import { defaultCustomer, validCustomer, type Customer } from "./customer-settings";
import {requiredTags,draftRequiredTags,tagSettings,finalTags,normalizeTags} from "./hashtags";
import {RequiredTagEditor,AdditionalTagEditor,FinalTagSummary} from "./hashtag-controls";
import {blankDraft, draftCustomer, recordDraft, restoreSnapshot, validReference, validDraft, type Draft, type ReferencePost, type Snapshot, replaceParagraph} from "./studio-data";
import {ReferenceSettings, DraftArchive, VersionPanel, SimilarityPanel} from "./studio-panels";
import {ParagraphRewrite, PhotoFlowPanel, type ParagraphSelection} from "./ai-tools";
import MiricanvasThumbnailButton from "./miricanvas-thumbnail-button";
import LengthSelector from "./length-selector";
import ToneSelector, {IndustrySetting} from "./tone-selector";
import {defaultLength,draftLength,lengthBounds,type LengthSetting} from "./length-settings";
import Dashboard from "./dashboard";
import NaverTransfer, {NaverBlogSetting, LocalAutomationStatus} from "./naver-panel";
import PhotoLibrary, { preparePhoto, type Photo } from "./photo-library";
const blank = blankDraft;
export default function Home() {
 const [customers, setCustomers] = useState<Customer[]>([defaultCustomer]);
 const [customerId, setCustomerId] = useState(defaultCustomer.id);
 const [customerName, setCustomerName] = useState("");
 const [newCustomerTags,setNewCustomerTags]=useState("");
 const [settingsReady, setSettingsReady] = useState(false);
 const customer = customers.find(c => c.id === customerId) || defaultCustomer;
 useEffect(() => {
   try {
     const stored = readCustomerSettings(localStorage);
     if(stored && (!Array.isArray(stored.customers)||!stored.customers.length||!stored.customers.every(validCustomer))){N("기존 고객 데이터 형식을 확인할 수 없어 설정 저장을 중지했습니다.");return;}
     if (stored && Array.isArray(stored.customers) && stored.customers.length && stored.customers.every(validCustomer)) {
       setCustomers(stored.customers);
       const initialCustomer=stored.customers.find((c:Customer)=>c.id===stored.selected)||stored.customers[0];setLengthSetting(initialCustomer.defaultLength||defaultLength);
       setCustomerId(stored.customers.some((c: Customer) => c.id === stored.selected) ? stored.selected : stored.customers[0].id);
     }
   } catch { N("고객 설정을 불러오지 못했습니다. 기존 고객 데이터를 보호하기 위해 설정 저장을 중지했습니다."); return; }
   setSettingsReady(true);
 }, []);
 function persistCustomers(next: Customer[], selected: string) {
   if(!settingsReady){N("고객 데이터를 안전하게 불러온 뒤 다시 시도해 주세요.");return false;}
   try { writeCustomerSettings(localStorage,next,selected); return true; }
   catch { N("고객 설정을 저장하지 못했습니다. 브라우저 저장 공간과 권한을 확인해 주세요."); return false; }
 }
 function updateCustomer(update: Partial<Pick<Customer, "kind" | "perspective" | "requiredTags" | "naverBlogUrl" | "industry">>) {
   const next = customers.map(c => c.id === customerId ? { ...c, ...update } : c);
   if (persistCustomers(next, customerId)) { setCustomers(next); N("고객 설정을 저장했습니다."); return true; }
   return false;
 }
 function selectCustomer(id: string) { setTransferOpen(false); if((draft.title||draft.body)&&!persistDraft({...draft,tags:allTags,topic,facts,length,lengthSetting,tone},"고객 전환 전 저장"))return; if (persistCustomers(customers, id)) { D(blank);Tags("");T("");F("");photos.forEach(p=>URL.revokeObjectURL(p.url)); P([]); setCustomerId(id);setLengthSetting(customers.find(c=>c.id===id)?.defaultLength||defaultLength); } }
 function addCustomer() { setTransferOpen(false);
   const name = customerName.trim();
   if (!name) return N("추가할 고객 이름을 입력해 주세요.");
   const existing = customers.find(c => c.name === name);
   if (existing) { selectCustomer(existing.id); setCustomerName(""); return; }
   const nextCustomer: Customer = { id: crypto.randomUUID(), name, kind: "politician", perspective: "first", requiredTags:normalizeTags(newCustomerTags) };
   const next = [...customers, nextCustomer];
   if((draft.title||draft.body)&&!persistDraft({...draft,tags:allTags,topic,facts,length,lengthSetting,tone},"고객 추가 전 저장"))return; if (persistCustomers(next, nextCustomer.id)) { D(blank);Tags("");T("");F(""); setCustomers(next); photos.forEach(p=>URL.revokeObjectURL(p.url)); P([]); setCustomerId(nextCustomer.id);setLengthSetting(defaultLength); setCustomerName("");setNewCustomerTags(""); N("고객을 추가했습니다. 글쓰기 시점을 설정해 주세요."); }
 }
 const [textSize, setTextSize] = useState("medium");
 useEffect(() => {
   try {
     const stored = localStorage.getItem("jin-text-size");
     if (stored && ["small", "medium", "large"].includes(stored)) setTextSize(stored);
   } catch { /* Text sizing remains available when browser storage is disabled. */ }
 }, []);
 function changeTextSize(size: string) {
   setTextSize(size);
   try { localStorage.setItem("jin-text-size", size); } catch { /* Keep this session's selection. */ }
 }
 const [references, setReferences] = useState<ReferencePost[]>([]);
 const [referencesReady, setReferencesReady] = useState(false);
 const [dataReady, setDataReady] = useState(false);
 const [topic,T]=useState(""); const [facts,F]=useState(""); const [length,L]=useState(0); const [lengthSetting, setLengthSetting]=useState<LengthSetting>(defaultLength); const [tone,Tone]=useState("따뜻하고 친근하게"); const [tags,Tags]=useState(""); const [photos,P]=useState<Photo[]>([]); const [draft,D]=useState<Draft>(blank); const [saved,S]=useState<Draft[]>([]); const [view,V]=useState("write"); const [transferOpen, setTransferOpen]=useState(false); const [tab,Tab]=useState("원고 편집"); const [busy,B]=useState(""); const [notice,N]=useState(""); const [connected,C]=useState(false);
 useEffect(()=>{
   try {const loaded=JSON.parse(localStorage.getItem("jin-drafts")||"[]");if(!Array.isArray(loaded)||!loaded.every(validDraft))throw Error();S(loaded);setDataReady(true);}catch{N("저장된 원고를 읽지 못했습니다. 기존 데이터를 보호하기 위해 저장을 중지했습니다.");}
   try {const loaded=JSON.parse(localStorage.getItem("jin-reference-posts")||"[]");if(!Array.isArray(loaded)||!loaded.every(validReference))throw Error();setReferences(loaded);setReferencesReady(true);}catch{N("참고 포스팅 데이터를 읽지 못했습니다. 브라우저 데이터를 삭제하지 마세요.");}
   fetch("/api/draft").then(r=>r.json()).then(d=>C(d.configured)).catch(()=>C(false));
 },[]);
 const ownReferences=references.filter(p=>p.customerId===customerId);
 function saveReference(post:ReferencePost){if(!referencesReady){N("기존 참고 글을 안전하게 불러오지 못해 저장을 중지했습니다.");return false;}const own=references.filter(p=>p.customerId===post.customerId);if(!validReference(post)||(!own.some(p=>p.id===post.id)&&own.length>=5)){N("참고 글은 고객별 최대 5개까지 등록할 수 있습니다.");return false;}const next=[post,...references.filter(p=>p.id!==post.id)];try{localStorage.setItem("jin-reference-posts",JSON.stringify(next));setReferences(next);N("고객의 참고 포스팅을 저장했습니다.");return true;}catch{N("참고 글 저장 공간이 부족합니다. 기존 데이터는 유지됩니다.");return false;}}
 function persistDraft(item:Draft,reason:string,before?:Draft):Draft|undefined{
   if(!dataReady){N("저장된 원고를 불러온 뒤 다시 시도해 주세요.");return;}
   const previous=saved.find(d=>d.id===item.id);let base=previous;
   if(before && (before.title||before.body))base=recordDraft(before,previous,customerId,"수정 전 편집본");
   const recorded=recordDraft({...item,tagSettings:{...tagSettings(item,customer),required:draftRequiredTags(item,customer)}},base,customerId,reason);const next=[recorded,...saved.filter(d=>d.id!==recorded.id)];
   try{localStorage.setItem("jin-drafts",JSON.stringify(next));S(next);D(recorded);return recorded;}catch{N("저장 공간이 부족합니다. 현재 원고를 다운로드해 보관하세요. 기존 저장 데이터는 유지됩니다.");}
 }
 function openDraft(item:Draft){if((draft.title||draft.body)&&!persistDraft({...draft,tags:allTags,topic,facts,length,lengthSetting,tone},"원고 전환 전 저장"))return;D(item);Tags("");T(item.topic||"");F(item.facts||"");L(item.length??0);setLengthSetting(draftLength(item));Tone(item.tone||"따뜻하고 친근하게");V("write");Tab("원고 편집");}
 function publication(item:Draft,date:string|undefined){if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))return;const changed={...item,status:date?"published" as const:"draft" as const,publishedAt:date?`${date}T12:00:00+09:00`:undefined};if(persistDraft(changed,date?"발행 기록":"미발행으로 변경"))N("발행 상태를 저장했습니다. 실제 블로그에는 게시하지 않습니다.");}
 function restore(version:Snapshot){const restored=restoreSnapshot(draft,version);if(persistDraft(restored,"이전 버전 복원",{...draft,tags:allTags})){Tags("");setLengthSetting(draftLength(restored));N("이전 버전을 복원했습니다. 복원 전 편집본도 이력에 보존했습니다.");}}
 const customerRequired=requiredTags(customer);
 const required=draftRequiredTags(draft,customer);
 const currentTagSettings=tagSettings(draft,customer);
 const allTags=finalTags(required,currentTagSettings);
 const lastSaved = saved.find(item=>item.id===draft.id);
 const storageSignature=(item:Draft)=>JSON.stringify([item.title,item.body,item.tags,item.placements,item.review,item.photoPlan,item.tagSettings,item.topic||"",item.facts||"",item.lengthSetting??draftLength(item),item.tone||"따뜻하고 친근하게",item.thumbnail]);
 const unsavedChanges=Boolean((draft.title||draft.body||draft.id||draft.tagSettings)&&(!lastSaved||storageSignature({...draft,tags:allTags,topic,facts,length,lengthSetting,tone})!==storageSignature(lastSaved)));
 const lastSavedLabel=lastSaved?.updated?new Date(lastSaved.updated).toLocaleString("ko-KR",{timeZone:"Asia/Seoul",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}):"";
 const count=Array.from(draft.body).length; const bounds=lengthBounds(lengthSetting);
 function chooseLength(value:LengthSetting){const next=customers.map(c=>c.id===customerId?{...c,defaultLength:value}:c);if(persistCustomers(next,customerId)){setCustomers(next);setLengthSetting(value);N("고객의 기본 본문 분량을 저장했습니다.");}}
 async function generate(mode:string){
   if(!dataReady||!referencesReady)return N("기존 데이터를 먼저 불러와야 합니다.");
   if(mode==="generate"&&(!topic.trim()||!facts.trim()))return N("주제와 주요 내용을 입력해 주세요.");
   if((mode==="review"||mode==="resize")&&!draft.body.trim())return N("검토할 원고를 먼저 작성해 주세요.");
   if(mode==="photo-plan"&&!photos.length)return N("분석할 사진을 선택해 주세요.");
   B(mode);N("");const before={...draft,tags:allTags};
   try{
     const response=await fetch("/api/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,topic,facts,length,lengthSetting,tone,customer,references:ownReferences.length>=3?ownReferences:[],body:draft.body,title:draft.title,photos:mode!=="review"&&mode!=="resize"?await Promise.all(photos.map(preparePhoto)):[]})});
     const data=await response.json();if(!response.ok)throw Error(data.error);
     if(mode==="photo-plan"){
       D({...draft,photoPlan:{...data.photoPlan,photoKeys:photos.map(p=>p.source)}});Tab("사진 배치");N("사진 분석을 마쳤습니다. 실제 시간순 확인 여부와 편집 제안을 확인하세요.");return;
     }
     const item:Draft={...draft,...data,id:draft.id||crypto.randomUUID(),customerId,topic,facts,length,lengthSetting,tone,title:(mode==="review"||mode==="resize")?draft.title:data.titles[0],tagSettings:{...currentTagSettings,required:mode==="generate"?customerRequired:required,recommended:(mode==="review"||mode==="resize")?currentTagSettings.recommended:normalizeTags(data.recommendedTags??data.tags)},tags:(mode==="review"||mode==="resize")?allTags:finalTags(customerRequired,{...currentTagSettings,recommended:normalizeTags(data.recommendedTags??data.tags)}),placements:(mode==="review"||mode==="resize")?draft.placements:data.placements,photoPlan:(mode==="review"||mode==="resize")?draft.photoPlan:{...data.photoPlan,photoKeys:photos.map(p=>p.source)}};
     const recorded=persistDraft(item,mode==="resize"?"AI 본문 분량 조정":mode==="review"?"원고 수정":"AI 초안 생성",before);
     if(!recorded)D(item);
     Tab(mode==="review"?"검토 의견":"원고 편집");if(recorded)N(mode==="resize"?`본문 분량 조정 완료 · 실제 ${Array.from(item.body).length.toLocaleString()}자. 범위 충족 여부를 확인하세요.`:mode==="review"?"본문 검토와 수정 이력 저장을 마쳤습니다.":"초안을 생성하고 저장했습니다. 유사 표현 탭에서 과거 원고와 비교할 수 있습니다.");
   }catch(e){N(e instanceof Error?e.message:"AI 요청에 실패했습니다.");}finally{B("");}
 }
 function applyParagraph(selection:ParagraphSelection,text:string,notes:string[]){
   try{const body=replaceParagraph(draft.body,selection.start,selection.end,selection.text,text);const item={...draft,body,tags:allTags,review:[...draft.review,...notes]};if(!persistDraft(item,"AI 선택 문단 재작성",{...draft,tags:allTags}))return false;N("선택 문단만 수정했습니다. 다른 문단은 유지되며 이전 내용은 이력에 저장했습니다.");return true;}catch(e){N(e instanceof Error?e.message:"문단 적용에 실패했습니다.");return false;}
 }
 function applyPhotoOrder(){const plan=draft.photoPlan;if(!plan||plan.photoKeys?.join("|")!==photos.map(p=>p.source).join("|")){N("사진이 변경되었습니다. 다시 분석해 주세요.");return;}P(plan.items.map(item=>photos[item.photo-1]));D({...draft,photoPlan:undefined,placements:[]});N("선택 사진 순서를 변경했습니다. 새 순서로 원고를 생성하거나 다시 분석하면 사진 번호와 삽입 위치가 갱신됩니다.");}
 function save(){if(!draft.title.trim()&&!draft.body.trim()){N("저장할 제목이나 본문을 입력해 주세요.");return;}if(persistDraft({...draft,tags:allTags,topic,facts,length,lengthSetting,tone},"수동 저장"))N("원고와 수정 이력을 저장했습니다.");}
 const full=()=>`${draft.title}\n\n${draft.body}\n\n${allTags.map(t=>`#${t}`).join(" ")}`;
 async function copy(){try{await navigator.clipboard.writeText(full());N("제목, 본문, 해시태그를 모두 복사했습니다.");}catch{N("복사 권한을 확인하거나 파일로 내려받아 주세요.");}}
 function download(){const url=URL.createObjectURL(new Blob([full()],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=(draft.title||"블로그 원고").replace(/[\\/:*?"<>|]/g,"_")+".txt";a.click();URL.revokeObjectURL(url);}
 function reset(){if((draft.title||draft.body)&&!persistDraft({...draft,tags:allTags,topic,facts,length,lengthSetting,tone},"새 원고 전 저장"))return;D(blank);T("");F("");Tags("");photos.forEach(p=>URL.revokeObjectURL(p.url));P([]);setLengthSetting(customer.defaultLength||defaultLength);V("write");N("새 원고를 시작합니다.");}
 function navigate(next:string){if(busy)return;if((draft.title||draft.body)&&!persistDraft({...draft,tags:allTags,topic,facts,length,lengthSetting,tone},"화면 전환 전 저장"))return;setTransferOpen(false);V(next);}
 const viewLabels:Record<string,string>={dashboard:"대시보드",write:"새 원고 작성",saved:"원고 보관함",customers:"고객 관리",settings:"설정"};
 const customerSettings = (<div className="customer-settings"><h3>고객별 블로그 설정</h3><label htmlFor="customer">고객 선택</label><select id="customer" value={customerId} disabled={!settingsReady || !!busy} onChange={e => selectCustomer(e.target.value)}>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="new-customer-form"><label htmlFor="new-customer-name">신규 고객 이름</label><input id="new-customer-name" aria-label="새 고객 이름" placeholder="새 고객 이름" maxLength={100} value={customerName} disabled={!settingsReady||!!busy} onChange={e => setCustomerName(e.target.value)}/><label htmlFor="new-customer-tags">신규 고객 필수 해시태그</label><input id="new-customer-tags" placeholder="#키워드 #고객이름" value={newCustomerTags} disabled={!settingsReady||!!busy} onChange={e=>setNewCustomerTags(e.target.value)}/><button className="button secondary" disabled={!settingsReady||!!busy||!customerName.trim()} onClick={addCustomer}>고객 추가</button></div><label htmlFor="customer-kind">블로그 유형</label><select id="customer-kind" value={customer.kind} disabled={!settingsReady || !!busy} onChange={e => updateCustomer({kind:e.target.value as Customer["kind"]})}><option value="politician">정치인 의정활동</option><option value="general">일반 블로그</option></select><IndustrySetting customer={customer} disabled={!settingsReady||!!busy} onChange={industry=>updateCustomer({industry})}/><label htmlFor="perspective">글쓰기 시점</label><select id="perspective" value={customer.perspective} disabled={!settingsReady || !!busy} onChange={e => updateCustomer({perspective:e.target.value as Customer["perspective"]})}><option value="first">1인칭 · 본인이 직접 전하는 이야기</option><option value="third">3인칭 · 외부에서 전하는 활동 기록</option></select><p className="help">고객별로 이 브라우저에 자동 저장됩니다. 정치인 의정활동은 1인칭을 기본으로 하며, 확인되지 않은 참석·발언·활동은 작성하지 않습니다.</p><NaverBlogSetting key={`blog-${customerId}-${customer.naverBlogUrl||""}`} value={customer.naverBlogUrl||""} onSave={naverBlogUrl=>updateCustomer({naverBlogUrl})} disabled={!!busy||!settingsReady}/>{view==="customers"&&<RequiredTagEditor key={`required-${customerId}-${JSON.stringify(customerRequired)}`} tags={customerRequired} onSave={value=>updateCustomer({requiredTags:value})} disabled={!!busy||!settingsReady}/>}<ReferenceSettings key={customerId} customerId={customerId} posts={ownReferences} onSave={saveReference} disabled={!!busy||!dataReady||!referencesReady}/></div>);
 return <div className="shell" data-text-size={textSize}><aside><a className="brand" href="/" aria-label="BLOG STUDIO"><span className="brand-icon">✎</span><span>BLOG STUDIO<small>블로그 관리 프로그램</small></span></a><nav aria-label="주 메뉴">{[{id:"dashboard",icon:"▦",label:"대시보드"},{id:"write",icon:"✎",label:"새 원고 작성"},{id:"saved",icon:"▱",label:"원고 보관함"},{id:"customers",icon:"◉",label:"고객 관리"},{id:"settings",icon:"⚙",label:"설정"}].map(item=><button key={item.id} className={view===item.id?"active":""} disabled={!!busy} onClick={()=>navigate(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}{item.id==="saved"&&<b>{saved.length}</b>}</button>)}</nav></aside><div className="main-shell"><header><div>작업 공간 <span>/</span> <b>{viewLabels[view]}</b></div><div className="header-tools"><div className="text-size-control" role="group" aria-label="글씨 크기"><span className="text-size-label">글씨 크기</span>{[{value:"small",label:"소"},{value:"medium",label:"중"},{value:"large",label:"대"}].map(size => <button key={size.value} type="button" className={`text-size-button size-${size.value}`} aria-label={`글씨 크기 ${size.label}`} title={`글씨 크기 ${size.label}`} aria-pressed={textSize === size.value} onClick={() => changeTextSize(size.value)}>가</button>)}</div></div></header><main><div className="heading"><div><h1>{viewLabels[view]}</h1></div><button className="button secondary" disabled={!!busy} onClick={reset}>＋ 새 원고</button></div>{notice&&<div className="notice" role="status">{notice}<button aria-label="알림 닫기" onClick={()=>N("")}>×</button></div>}
 {view==="dashboard"?<Dashboard customer={customer} drafts={saved} customersCount={customers.length} onWrite={()=>navigate("write")} onOpen={openDraft}/>:view==="customers"?<section className="panel management-panel">{customerSettings}</section>:view==="settings"?<section className="panel management-panel"><h2>프로그램 설정</h2><p className="help">고객 설정·원고는 현재 브라우저에 저장됩니다. 원고 보관함과 파일 백업으로 관리하세요. 사진 폴더는 고객별 읽기 권한으로 연결합니다.</p><LocalAutomationStatus/><details className="policy-details"><summary>네이버 입력 정책</summary><p>자동 로그인·콘텐츠 삽입·발행은 제공하지 않습니다. 사전 허락을 확인할 수 없어 수동 입력 모드를 사용합니다.</p><a href="https://policy.naver.com/policy/service.html" target="_blank" rel="noreferrer">네이버 이용약관</a></details></section>:view==="saved"?<DraftArchive drafts={saved} customers={customers} customerId={customerId} onCustomerChange={selectCustomer} onOpen={openDraft} onPublish={publication}/>:<><div className="workflow"><span className="selected"><b>1</b> 작성 정보 입력</span><i/><span className={draft.body?"selected":""}><b>2</b> 초안 생성 & 편집</span><i/><span className={saved.some(s=>s.id===draft.id)?"selected":""}><b>3</b> 검토 & 저장</span></div><div className="studio"><section className="panel input-panel"><div className="panel-heading"><span>✎</span><div><h2>작성 정보</h2></div></div><details className="write-customer-settings"><summary>고객 설정 · {customer.name}</summary>{customerSettings}</details><label htmlFor="topic">포스팅 주제 <em>*</em></label><input id="topic" placeholder="예: 우리 동네 보행환경 개선 현장 방문" value={topic} maxLength={200} onChange={e=>T(e.target.value)}/><div className="label-row"><label htmlFor="facts">주요 내용 <em>*</em></label><small>사실과 현장 중심으로</small></div><textarea id="facts" className="facts" placeholder={"어떤 활동을 하셨나요?\n\n• 일시와 장소\n• 활동 목적과 주요 내용\n• 주민 의견이나 전하고 싶은 메시지"} value={facts} maxLength={12000} onChange={e=>F(e.target.value)}/><p className="help">입력한 내용을 바탕으로 작성하며, 없는 사실을 덧붙이지 않아요.</p><LengthSelector key={`${customerId}-${lengthSetting.preset}-${lengthSetting.customTarget||0}-${Boolean(lengthSetting.legacyRange)}`} value={lengthSetting} disabled={!!busy||!settingsReady} onChange={chooseLength}/><ToneSelector value={tone} customer={customer} onChange={Tone} disabled={!!busy}/><PhotoLibrary key={customerId} customerId={customerId} photos={photos} onChange={P} disabled={!!busy}/><section className="hashtag-management" aria-label="해시태그 관리"><h3>해시태그 관리</h3><RequiredTagEditor key={`write-required-${customerId}-${JSON.stringify(customerRequired)}`} tags={customerRequired} onSave={value=>updateCustomer({requiredTags:value})} disabled={!!busy||!settingsReady}/><AdditionalTagEditor key={`additional-${draft.id||customerId}`} required={required} settings={currentTagSettings} onChange={value=>D({...draft,tagSettings:value})} disabled={!!busy}/></section><button className="button primary generate" disabled={!!busy || !settingsReady} onClick={()=>generate("generate")}><span>✧</span>{busy==="generate"?"원고 생성 중…":"AI 원고 작성"}<i>→</i></button><div className="connection"><span className={connected?"online":""}/> {connected?"AI 작성 준비 완료":"AI 연결 설정이 필요해요"}</div></section>
 <section className="panel editor"><div className="editor-heading"><div><h2>나의 블로그 원고</h2></div><span className="badge">{draft.body?"작성 중":"새 원고"}</span></div><div className="tabs">{["원고 편집","사진 배치","검토 의견","유사 표현","수정 이력"].map(t=><button className={tab===t?"active":""} onClick={()=>Tab(t)} key={t}>{t}{t==="검토 의견"&&draft.review.length>0&&" ·"}</button>)}<small>직접 수정할 수 있어요</small></div>{tab==="원고 편집"?<div className="editor-content"><div className="section-label">제목 추천 <small>3가지 아이디어에서 골라보세요</small></div>{draft.titles.length?<div className="titles">{draft.titles.map((t,i)=><button className={draft.title===t?"selected":""} key={i} disabled={!!busy} onClick={()=>D({...draft,title:t})}><b>0{i+1}</b>{t}<i>{draft.title===t?"✓":"↗"}</i></button>)}</div>:<div className="title-placeholder"><span>01</span> 주제를 담은 세 가지 제목이 여기에 만들어져요.</div>}<input className="draft-title" disabled={!!busy} aria-label="원고 제목" value={draft.title} placeholder="원고 제목" onChange={e=>D({...draft,title:e.target.value})}/><div className="body-editor"><textarea disabled={!!busy} aria-label="원고 본문" value={draft.body} placeholder={"작성 정보를 입력하고 AI 원고 작성을 누르세요.\n\n본문을 직접 작성하거나 수정할 수도 있습니다."} onChange={e=>D({...draft,body:e.target.value})}/></div><ParagraphRewrite key={draft.id||"new"} draft={draft} customer={customer} references={ownReferences} facts={facts} tone={tone} disabled={!!busy||!dataReady} onBusy={waiting=>B(waiting?"rewrite":"")} onApply={applyParagraph}/><div className="counter"><span>● &nbsp;{draft.body?"편집 중":"작성된 내용 없음"}</span><span className={count&&(count<bounds[0]||count>bounds[1])?"warn":""}><span>현재 본문 <b>{count.toLocaleString()}자</b></span><small>목표 · 본문 전체 {bounds[0].toLocaleString()}~{bounds[1].toLocaleString()}자</small></span></div><p className="help count-explanation">글자 수는 공백·줄바꿈·소제목을 포함한 본문 전체 기준입니다. 제목·해시태그는 제외하며, 문단별 목표가 아닙니다.</p><div className="length-result" role="status">{count>0&&(count<bounds[0]||count>bounds[1])?<><p>{count<bounds[0]?`${(bounds[0]-count).toLocaleString()}자 부족`:`${(count-bounds[1]).toLocaleString()}자 초과`} · 현재 {count.toLocaleString()}자 / 목표 {bounds[0].toLocaleString()}~{bounds[1].toLocaleString()}자</p><button className="button secondary" disabled={!!busy} onClick={()=>generate("resize")}>{busy==="resize"?"분량 조정 중…":"선택한 분량으로 다시 맞추기"}</button></>:count>0?<p>선택한 분량에 맞습니다 · {count.toLocaleString()}자</p>:null}</div><FinalTagSummary required={required} settings={currentTagSettings} onCopy={async()=>{try{await navigator.clipboard.writeText(allTags.map(t=>`#${t}`).join(" "));N("최종 해시태그를 복사했습니다.");}catch{N("복사 권한을 확인해 주세요.");}}}/></div>:tab==="사진 배치"?<PhotoFlowPanel plan={draft.photoPlan} photos={photos} onAnalyze={()=>generate("photo-plan")} onApply={applyPhotoOrder} disabled={!!busy}/>:tab==="수정 이력"?<VersionPanel draft={draft} onRestore={restore} disabled={!!busy}/>:tab==="유사 표현"?<SimilarityPanel draft={draft} posts={ownReferences} drafts={saved} customerId={customerId}/>:<div className="aux"><span>{tab==="사진 배치"?"▧":"✓"}</span><h3>{tab==="사진 배치"?"이야기에 어울리는 사진의 자리":"더 자연스럽고 정확한 문장으로"}</h3><p>{tab==="사진 배치"?"사진 설명과 본문의 흐름을 연결해 배치를 제안합니다.":"맞춤법, 띄어쓰기와 문장 흐름을 함께 살펴봅니다."}</p>{(tab==="사진 배치"?draft.placements:draft.review).length?<ol>{(tab==="사진 배치"?draft.placements:draft.review).map((t,i)=><li key={i}>{t}</li>)}</ol>:<div className="aux-empty">{tab==="사진 배치"?"사진과 설명을 추가한 뒤 초안을 생성하면 추천 위치가 표시됩니다.":"원고를 작성한 뒤 아래 ‘문장 검토’를 눌러주세요."}</div>}</div>}<div className="editor-actions"><MiricanvasThumbnailButton customerName={customer.name} title={draft.title} caption={draft.thumbnail?.design.text} photoName={photos[0]?.name} disabled={!!busy||!dataReady} onNotice={N}/><button className="button secondary" disabled={!!busy||!draft.title.trim()||!draft.body.trim()} onClick={()=>setTransferOpen(true)}>네이버 블로그로 옮기기</button><button className="button review" disabled={!!busy||!draft.body.trim()} onClick={()=>generate("review")}>✓ {busy==="review"?"검토 중…":"원고 수정"}</button><div><button className="button secondary download" aria-label="현재 원고 파일 백업" title="현재 원고 파일 백업 (제목·본문·해시태그)" onClick={download}>↓ 파일 백업</button><button className="button secondary" onClick={copy}>원고 복사</button><button className="button primary" disabled={!!busy||!dataReady} onClick={save}>원고 저장</button></div></div><div className="storage"><p className="save-status" role="status">{!dataReady?"저장 데이터 확인 중 · 저장 가능 여부를 확인해 주세요.":unsavedChanges?"● 미저장 변경 내용 있음 · ‘원고 저장’를 눌러 주세요.":lastSaved?"✓ 현재 원고 브라우저 저장 완료":"작성된 내용 없음 · 아직 저장하지 않았습니다."}{lastSavedLabel&&<span>마지막 저장 {lastSavedLabel} (한국 시간)</span>}</p><p>입력 중 실시간 자동 저장은 하지 않습니다. 저장 버튼, AI 초안 생성·수정 적용, 원고·고객 전환 시 이 브라우저에 저장됩니다. 서버에는 원고를 보관하지 않습니다.</p><p>브라우저 데이터 삭제, 시크릿 모드 종료 또는 다른 브라우저 사용 시 저장 원고를 이용할 수 없을 수 있습니다. ‘파일 백업’으로 현재 제목·본문·해시태그를 TXT 파일로 보관하세요.</p></div></section></div></>}
 {transferOpen&&<NaverTransfer customer={customer} draft={draft} tags={allTags} photos={photos} onClose={()=>setTransferOpen(false)}/>}</main><footer className="copyright-footer">© 2026 조원혜. All rights reserved.</footer></div></div>;
}
