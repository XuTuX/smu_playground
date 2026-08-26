import type { College, Department } from "@/lib/types";

type CollegeSeed = {
  id: string;
  name: string;
  departments: Array<[id: string, name: string]>;
};

const collegeSeeds: CollegeSeed[] = [
  {
    id: "humanities-arts",
    name: "인문예술대학",
    departments: [
      ["media-content", "미디어콘텐츠창작학과"],
      ["foreign-languages", "외국어학부"],
      ["art-industrial-design", "아트&산업디자인학과"],
      ["interior-design", "실내디자인학과"],
      ["visual-video-design", "시각·영상디자인학과"],
      ["fashion-design", "패션디자인학과"],
      ["performing-arts", "공연예술학과"],
      ["film-webtoon-animation", "영화웹툰애니메이션학과"],
    ],
  },
  {
    id: "social-sciences",
    name: "사회과학대학",
    departments: [
      ["police", "경찰학과"],
      ["law", "법학과"],
      ["real-estate-cadastral", "부동산지적학과"],
      ["fire-disaster", "소방방재학과"],
      ["business", "경영학과"],
      ["accounting-tax-finance", "회계세무금융학과"],
      ["hotel-management", "호텔경영학과"],
      ["airline-service", "항공서비스학과"],
      ["advertising-pr", "광고홍보학과"],
      ["social-welfare", "사회복지학과"],
      ["counseling-psychology", "상담심리학과"],
    ],
  },
  {
    id: "ai-convergence",
    name: "AI융합대학",
    departments: [
      ["ai-computer", "AI컴퓨터학부"],
      ["smart-it", "스마트IT학부"],
      ["electrical-electronics", "전기전자공학과"],
      ["architecture", "건축학과"],
      ["disaster-safety", "재난안전학과"],
      ["health-safety-engineering", "보건안전공학과"],
    ],
  },
  {
    id: "health-bio",
    name: "보건바이오대학",
    departments: [
      ["nursing", "간호학과"],
      ["occupational-therapy", "작업치료학과"],
      ["clinical-pathology", "임상병리학과"],
      ["biopharma-industry", "바이오제약산업학부"],
      ["biocosmetics", "바이오코스메틱학과"],
      ["beauty-care", "뷰티케어학과"],
      ["food-nutrition", "바이오식품영양학부"],
      ["animal-health", "동물보건학과"],
      ["companion-animal", "반려동물산업학과"],
      ["sports-leisure", "생활체육학과"],
    ],
  },
  {
    id: "oriental-medicine",
    name: "한의과대학",
    departments: [["oriental-medicine-major", "한의예과/한의학과"]],
  },
  {
    id: "liberal-arts",
    name: "교양대학",
    departments: [["open-major", "자율전공학부"]],
  },
];

export const colleges: College[] = collegeSeeds.map((college, index) => ({
  id: college.id,
  name: college.name,
  sortOrder: index + 1,
}));

export const departments: Department[] = collegeSeeds.flatMap((college) =>
  college.departments.map(([id, name], index) => ({
    id,
    collegeId: college.id,
    name,
    slug: id,
    sortOrder: index + 1,
    isActive: true,
  })),
);

export const departmentsByCollege = colleges.map((college) => ({
  ...college,
  departments: departments.filter(
    (department) => department.collegeId === college.id,
  ),
}));

export function getDepartment(idOrSlug: string) {
  return departments.find(
    (department) =>
      department.id === idOrSlug || department.slug === idOrSlug,
  );
}
