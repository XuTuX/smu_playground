import { departments } from "@/data/departments";
import type { ScoreRecord } from "@/lib/types";

type MockScoreSeed = [
  gameId: string,
  departmentId: string,
  nickname: string,
  score: number,
  minutesAgo: number,
];

const mockScoreSeeds: MockScoreSeed[] = [
  ["flappy", "ai-computer", "코딩감자", 942, 4],
  ["reaction", "smart-it", "번개손", 920, 7],
  ["dino-run", "nursing", "나이팅게일", 930, 10],
  ["timing", "nursing", "맥박장인", 905, 13],
  ["rhythm", "smart-it", "비트마스터", 910, 17],
  ["timing", "ai-computer", "알고리듬", 903, 21],
  ["flappy", "smart-it", "스마트펭귄", 901, 25],
  ["dino-run", "visual-video-design", "픽셀러너", 890, 29],
  ["reaction", "ai-computer", "세명봇", 887, 34],
  ["timing", "sports-leisure", "체대의자존심", 880, 39],
  ["flappy", "business", "상한가", 880, 44],
  ["rhythm", "ai-computer", "컴파일완료", 876, 50],
  ["rhythm", "visual-video-design", "프레임", 875, 56],
  ["timing", "police", "정의의버튼", 870, 63],
  ["rhythm", "business", "흑자전환", 865, 71],
  ["reaction", "visual-video-design", "컬러피커", 860, 79],
  ["dino-run", "biopharma-industry", "배양중", 860, 88],
  ["flappy", "nursing", "백의천사", 850, 98],
  ["dino-run", "business", "기획천재", 850, 109],
  ["timing", "smart-it", "아이티짱", 850, 121],
  ["reaction", "police", "광속순경", 845, 134],
  ["dino-run", "architecture", "모형장인", 840, 148],
  ["timing", "visual-video-design", "키프레임", 840, 163],
  ["rhythm", "biopharma-industry", "신약개발자", 840, 179],
  ["timing", "social-welfare", "복지요정", 835, 196],
  ["flappy", "police", "캠퍼스지킴이", 830, 214],
  ["reaction", "biopharma-industry", "바이오리듬", 830, 233],
  ["rhythm", "architecture", "건축박자", 830, 253],
  ["dino-run", "sports-leisure", "점프왕", 825, 274],
  ["timing", "business", "마감준수", 820, 296],
  ["reaction", "architecture", "스케일백", 820, 319],
  ["dino-run", "ai-computer", "디버거", 815, 343],
  ["timing", "biopharma-industry", "정밀피펫", 815, 368],
  ["flappy", "sports-leisure", "근육참새", 810, 394],
  ["reaction", "nursing", "빠른처치", 810, 421],
  ["dino-run", "social-welfare", "함께달려", 810, 449],
  ["rhythm", "police", "순찰비트", 810, 478],
  ["dino-run", "police", "추격자", 800, 508],
  ["rhythm", "sports-leisure", "응원단장", 800, 539],
  ["flappy", "biopharma-industry", "세포비행", 795, 571],
  ["rhythm", "social-welfare", "마음박자", 795, 604],
  ["timing", "architecture", "수평수직", 790, 638],
  ["reaction", "sports-leisure", "스타트왕", 790, 673],
  ["dino-run", "smart-it", "버그헌터", 780, 709],
  ["flappy", "visual-video-design", "레이어백개", 780, 746],
  ["reaction", "social-welfare", "공감버튼", 780, 784],
  ["flappy", "architecture", "공중도면", 760, 823],
  ["reaction", "business", "속전속결", 760, 863],
  ["flappy", "social-welfare", "희망날개", 740, 904],
  ["rhythm", "nursing", "심장박동", 790, 946],
];

const seededAt = Date.now();

export const mockScores: ScoreRecord[] = mockScoreSeeds.map(
  ([gameId, departmentId, nickname, score, minutesAgo], index) => ({
    id: `mock-score-${String(index + 1).padStart(3, "0")}`,
    sessionId: `mock-session-${String(index + 1).padStart(3, "0")}`,
    gameId,
    departmentId,
    nickname,
    score,
    createdAt: new Date(seededAt - minutesAgo * 60_000).toISOString(),
  }),
);

export const activeDepartmentIds = new Set(
  departments.filter((department) => department.isActive).map(({ id }) => id),
);
