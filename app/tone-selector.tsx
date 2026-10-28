"use client";
import type {Customer} from "./customer-settings";
import {industryOptions,toneExample,toneOptions} from "./tone-examples";

export function IndustrySetting({customer,onChange,disabled}:{customer:Customer;onChange:(industry:string)=>void;disabled:boolean}) {
  return <><label htmlFor="customer-industry">업종</label><select id="customer-industry" value={customer.industry || ""} disabled={disabled} onChange={e=>onChange(e.target.value)}><option value="">미등록 · 공통 예시 사용</option>{customer.industry && !industryOptions.some(([id])=>id===customer.industry)&&<option value={customer.industry}>{customer.industry}</option>}{industryOptions.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></>;
}

export default function ToneSelector({value,customer,onChange,disabled}:{value:string;customer:Customer;onChange:(value:string)=>void;disabled:boolean}) {
  const example=toneExample(value,customer);
  return <div className="tone-selector"><label htmlFor="tone">글의 분위기</label><select id="tone" value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}>{!toneOptions.some(option=>option.value===value)&&<option value={value}>{value}</option>}{toneOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><div className="tone-preview" aria-live="polite"><b>{example.contextual?"업종별 문체 예시":"공통 문체 예시"}</b><p>{example.text}</p><small>참고용 예시이며 원고에 자동 삽입되지 않습니다.</small></div></div>;
}
