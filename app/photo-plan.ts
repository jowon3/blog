export type PhotoPlan = {items:{photo:number;placement:string;reason:string;evidence:string}[];chronologyConfirmed:boolean;note:string;photoKeys?:string[]};
export const planSchema={type:"object",properties:{items:{type:"array",items:{type:"object",properties:{photo:{type:"integer",minimum:1,maximum:6},placement:{type:"string"},reason:{type:"string"},evidence:{type:"string"}},required:["photo","placement","reason","evidence"],additionalProperties:false}},chronologyConfirmed:{type:"boolean"},note:{type:"string"}},required:["items","chronologyConfirmed","note"],additionalProperties:false};
export function checkPhotoPlan(plan:PhotoPlan,count:number,facts:string){
 if(!plan||!Array.isArray(plan.items)||plan.items.length!==count||new Set(plan.items.map(p=>p.photo)).size!==count||plan.items.some(p=>!Number.isInteger(p.photo)||p.photo<1||p.photo>count))throw Error("사진 순서 응답을 확인하지 못했습니다. 다시 분석해 주세요.");
 const verified=Boolean(count>1&&plan.chronologyConfirmed&&plan.items.every(p=>p.evidence.trim().length>=6&&facts.includes(p.evidence.trim())));
 return {...plan,chronologyConfirmed:verified,note:verified?plan.note:`편집을 위한 구성 제안입니다. 실제 행사 시간순은 확인되지 않았습니다. ${plan.note}`};
}

