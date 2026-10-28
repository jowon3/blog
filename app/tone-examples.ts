import type {Customer} from "./customer-settings";

// Display-only samples. Never include these sentences in draft requests or saved drafts.
export const toneOptions = [
  {value:"따뜻하고 친근하게", label:"따뜻하고 친근하게", example:"궁금했던 내용을 함께 살펴볼게요."},
  {value:"차분하고 전문적으로", label:"차분하고 전문적으로", example:"핵심 내용을 기준에 따라 정리했습니다."},
  {value:"생생한 현장 이야기로", label:"생생하고 자연스럽게", example:"하나씩 살펴보니 작은 차이가 눈에 들어옵니다."},
  {value:"쉽고 알기 쉽게", label:"쉽고 알기 쉽게", example:"처음 접해도 이해하기 쉽도록 풀어볼게요."},
  {value:"간결하고 명확하게", label:"간결하고 명확하게", example:"필요한 내용만 간단히 정리했습니다."},
  {value:"밝고 경쾌하게", label:"밝고 경쾌하게", example:"오늘은 어떤 점이 다른지 가볍게 살펴볼까요?"},
] as const;

export const industryOptions = [
  ["food","음식점·카페"], ["beauty","미용·뷰티"], ["retail","쇼핑·판매"],
  ["education","교육"], ["health","의료·건강"], ["property","부동산"],
  ["travel","여행·숙박"], ["service","전문 서비스"], ["public","정치·공공"],
  ["other","기타 업종"],
] as const;

const subjects: Record<string, string> = {
  food:"메뉴를 고를 때 참고할 점", beauty:"관리 방법을 선택할 때 참고할 점",
  retail:"제품을 비교할 때 참고할 점", education:"학습 방법을 선택할 때 참고할 점",
  health:"건강 정보를 살펴볼 때 확인할 점", property:"공간을 알아볼 때 확인할 점",
  travel:"머무를 곳을 고를 때 참고할 점", service:"서비스를 선택할 때 확인할 점",
  public:"공공 정보를 살펴볼 때 확인할 점",
};

export function toneExample(tone: string, customer: Pick<Customer,"kind"|"industry">) {
  const index = toneOptions.findIndex(option=>option.value===tone);
  const selected = toneOptions[index < 0 ? 0 : index];
  const subject = customer.kind === "politician" && customer.industry === "public"
    ? "생활과 관련된 정책을 살펴볼 때 확인할 점"
    : subjects[customer.industry || ""];
  if (!subject) return {text:selected.example, contextual:false};
  const examples = [
    `${subject}을 함께 알아볼게요.`, `${subject}을 기준별로 정리했습니다.`,
    `${subject}을 하나씩 살펴보니 작은 차이가 눈에 들어옵니다.`,
    `${subject}을 이해하기 쉽게 풀어볼게요.`, `${subject}만 간단히 정리했습니다.`,
    `${subject}, 함께 가볍게 살펴볼까요?`,
  ];
  return {text:examples[index < 0 ? 0 : index], contextual:true};
}
