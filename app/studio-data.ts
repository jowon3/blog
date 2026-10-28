import type {Thumbnail} from "./thumbnail-data";
import type {LengthSetting} from "./length-settings";
import type {TagSettings} from "./hashtags";
import type {PhotoPlan} from "./photo-plan";
export type ReferencePost = {id:string;customerId:string;title:string;body:string;createdAt:string};
export type Snapshot = {id:string;at:string;reason:string;title:string;body:string;tags:string[];titles:string[];placements:string[];review:string[];photoPlan?:PhotoPlan;tagSettings?:TagSettings;lengthSetting?:LengthSetting;thumbnail?:Thumbnail};
export type Draft = {id:string;title:string;body:string;tags:string[];titles:string[];placements:string[];review:string[];updated:string;customerId?:string;createdAt?:string;publishedAt?:string;status?:"draft"|"published";versions?:Snapshot[];topic?:string;facts?:string;length?:number;tone?:string;photoPlan?:PhotoPlan;tagSettings?:TagSettings;lengthSetting?:LengthSetting;thumbnail?:Thumbnail};
export const blankDraft: Draft = {id:"",title:"",body:"",tags:[],titles:[],placements:[],review:[],updated:""};
export const draftCustomer = (draft:Draft)=>draft.customerId || "choi";
export function snapshot(draft:Draft,reason:string,now:string):Snapshot { return {id:crypto.randomUUID(),at:now,reason,title:draft.title,body:draft.body,tags:[...draft.tags],titles:[...draft.titles],placements:[...draft.placements],review:[...draft.review],photoPlan:draft.photoPlan,tagSettings:draft.tagSettings,lengthSetting:draft.lengthSetting,thumbnail:draft.thumbnail}; }
export function recordDraft(draft:Draft,previous:Draft|undefined,customerId:string,reason:string,now=new Date().toISOString()):Draft {
 const versions=[...(previous?.versions || draft.versions || [])];
 const same=(a:Snapshot,b:Draft)=>a.title===b.title&&a.body===b.body&&JSON.stringify(a.tags)===JSON.stringify(b.tags)&&JSON.stringify(a.placements)===JSON.stringify(b.placements)&&JSON.stringify(a.review)===JSON.stringify(b.review)&&JSON.stringify(a.photoPlan)===JSON.stringify(b.photoPlan)&&JSON.stringify(a.tagSettings)===JSON.stringify(b.tagSettings)&&JSON.stringify(a.lengthSetting)===JSON.stringify(b.lengthSetting)&&JSON.stringify(a.thumbnail)===JSON.stringify(b.thumbnail);
 if(previous && (!versions.length || !same(versions[versions.length-1],previous))) versions.push(snapshot(previous,"이전 저장본",previous.updated||now));
 if(!versions.length || !same(versions[versions.length-1],draft)) versions.push(snapshot(draft,reason,now));
 return {...draft,id:draft.id||crypto.randomUUID(),customerId:previous?draftCustomer(previous):customerId,createdAt:previous?.createdAt||draft.createdAt||(!previous?now:undefined),updated:now,versions,status:draft.status||"draft"};
}
export function restoreSnapshot(current:Draft,version:Snapshot):Draft {return {...current,title:version.title,body:version.body,tags:[...version.tags],titles:[...version.titles],placements:[...version.placements],review:[...version.review],photoPlan:version.photoPlan,tagSettings:version.tagSettings,lengthSetting:version.lengthSetting,thumbnail:version.thumbnail};}
export function monthOf(iso:string|undefined){if(!iso)return "";const date=new Date(iso);if(Number.isNaN(date.getTime()))return "";return new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit"}).format(date);}
export function monthlyStats(drafts:Draft[],customerId:string,month:string){const own=drafts.filter(d=>draftCustomer(d)===customerId);const written=own.filter(d=>monthOf(d.createdAt)===month);return {written:written.length,published:own.filter(d=>d.status==="published"&&monthOf(d.publishedAt)===month).length,pending:written.filter(d=>d.status!=="published").length,unknown:own.filter(d=>!d.createdAt).length};}
export function paragraphs(body:string){const blocks:{start:number;end:number;text:string}[]=[];const re=/\S[\s\S]*?(?=\n[ \t]*\n|$)/g;let match;while((match=re.exec(body))!==null){blocks.push({start:match.index,end:match.index+match[0].length,text:match[0]});}return blocks;}
export function replaceParagraph(body:string,start:number,end:number,original:string,replacement:string){if(body.slice(start,end)!==original)throw Error("원문이 변경되었습니다. 문단을 다시 선택해 주세요.");return body.slice(0,start)+replacement+body.slice(end);}
export function validReference(value:unknown):value is ReferencePost{if(!value||typeof value!=="object")return false;const p=value as Record<string,unknown>;return typeof p.id==="string"&&typeof p.customerId==="string"&&typeof p.title==="string"&&p.title.trim().length>0&&p.title.length<=200&&typeof p.body==="string"&&p.body.trim().length>0&&p.body.length<=12000&&typeof p.createdAt==="string";}
const normalize=(text:string)=>text.toLowerCase().replace(/[^\p{L}\p{N}]/gu,"");
function grams(text:string){const value=normalize(text);return new Set(Array.from({length:Math.max(0,value.length-2)},(_,i)=>value.slice(i,i+3)));}
export function titleSimilarity(a:string,b:string){const x=normalize(a),y=normalize(b);if(!x||!y)return 0;if(x===y)return 1;const left=grams(a),right=grams(b);if(!left.size||!right.size)return 0;return 2*[...left].filter(s=>right.has(s)).length/(left.size+right.size);}
export type Similarity = {source:string;kind:"title"|"phrase";text:string;score?:number};
export function compareWriting(draft:Draft,others:{id:string;title:string;body:string}[]):Similarity[]{const results:Similarity[]=[];for(const old of others){if(old.id===draft.id)continue;const score=titleSimilarity(draft.title,old.title);if(score>=.45)results.push({source:old.title,kind:"title",text:old.title,score});const found=new Set<string>();const words=draft.body.match(/\S+/g)||[];for(let i=0;i<=words.length-4;i++){const phrase=words.slice(i,i+4).join(" ");if(normalize(phrase).length>=12&&normalize(old.body).includes(normalize(phrase))){if(![...found].some(p=>p.includes(phrase)))found.add(phrase);if(found.size===5)break;}}for(const text of found)results.push({source:old.title,kind:"phrase",text});}return results;}


export function validDraft(value:unknown):value is Draft{
 if(!value||typeof value!=="object")return false;const d=value as Record<string,unknown>;
 return ["id","title","body","updated"].every(k=>typeof d[k]==="string")&&["tags","titles","placements","review"].every(k=>Array.isArray(d[k])&&(d[k] as unknown[]).every(v=>typeof v==="string"))&&(d.customerId===undefined||typeof d.customerId==="string")&&(d.versions===undefined||Array.isArray(d.versions));
}

