import {validLengthSetting,type LengthSetting} from "./length-settings";
export type Customer = { id: string; name: string; kind: "politician" | "general"; perspective: "first" | "third"; requiredTags?: string[]; naverBlogUrl?: string; defaultLength?: LengthSetting; industry?: string };
export const defaultCustomer: Customer = { id: "choi", name: "최정웅 의원", kind: "politician", perspective: "first" };
export function validCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (c.industry === undefined || (typeof c.industry === "string" && c.industry.length <= 100)) && (c.defaultLength === undefined || validLengthSetting(c.defaultLength)) && (c.naverBlogUrl === undefined || (typeof c.naverBlogUrl === "string" && c.naverBlogUrl.length <= 200)) && typeof c.id === "string" && c.id.length > 0 && c.id.length <= 100 && typeof c.name === "string" && c.name.trim().length > 0 && c.name.length <= 100 && ["politician", "general"].includes(c.kind as string) && ["first", "third"].includes(c.perspective as string) && (c.requiredTags === undefined || (Array.isArray(c.requiredTags) && c.requiredTags.every(t=>typeof t === "string" && t.length <= 120)));
}
export function perspectiveInstructions(customer: Customer) {
  const voice = customer.perspective === "first"
    ? "고객 본인이 직접 작성한 것처럼 자연스러운 1인칭으로 작성한다. 본인을 이름이나 직함으로 반복해서 지칭하지 않는다. '저는'은 주체를 밝혀야 할 때만 쓰고 이후에는 주어를 생략하거나 문장 구조를 바꿔 반복을 피한다."
    : "외부 작성자가 고객의 활동을 전달하는 3인칭으로 작성한다. 고객을 이름이나 직함으로 자연스럽게 지칭하며, 고객을 화자로 한 '저는', '제가', '하겠습니다' 같은 1인칭 표현을 사용하지 않는다.";
  return `글쓰기 시점 설정은 초안 생성과 문장 검토 모두에 적용한다. ${voice} ${customer.kind === "politician" ? "정치인의 의정활동 블로그다. 과장된 홍보보다 사실에 근거한 활동 기록을 작성한다." : "고객의 블로그에 어울리는 활동 기록을 작성한다."} '현장에서 직접 살펴보았습니다'는 제공한 자료에서 고객 본인의 현장 방문 및 확인이 명시된 경우에만 문맥에 맞게 사용한다. '앞으로도 주민 여러분의 목소리에 귀 기울이겠습니다'는 1인칭 의정활동 기록에서 문맥에 어울릴 때 사용할 수 있는 일반적인 다짐이며, 매번 같은 마무리로 반복하지 않는다. 이 예시는 필수 문구가 아니다. 고객별 설정이나 사진 설명만으로 참석, 발언, 현장 확인을 사실로 추정하지 않는다. 입력 자료에 확인되지 않은 참석, 발언, 만남, 활동, 성과와 구체적인 약속을 절대 만들지 않는다. 시점을 바꾸더라도 다른 사람의 활동을 고객의 활동으로 바꾸지 않는다. 사실 확인이 필요한 부분은 본문에서 단정하지 말고 review에 적는다.`;
}
