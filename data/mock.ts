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
  ["parking", "ai-computer", "코딩감자", 942, 4],
  ["star", "smart-it", "번개손", 920, 7],
  ["rope", "nursing", "나이팅게일", 930, 10],
  ["memory", "nursing", "맥박장인", 905, 13],
  ["jump", "smart-it", "비트마스터", 910, 17],
  ["memory", "ai-computer", "알고리듬", 903, 21],
  ["parking", "smart-it", "스마트펭귄", 901, 25],
  ["rope", "visual-video-design", "픽셀러너", 890, 29],
  ["star", "ai-computer", "세명봇", 887, 34],
  ["memory", "sports-leisure", "체대의자존심", 880, 39],
  ["parking", "business", "상한가", 880, 44],
  ["jump", "ai-computer", "컴파일완료", 876, 50],
  ["jump", "visual-video-design", "프레임", 875, 56],
  ["memory", "police", "정의의버튼", 870, 63],
  ["jump", "business", "흑자전환", 865, 71],
  ["star", "visual-video-design", "컬러피커", 860, 79],
  ["rope", "biopharma-industry", "배양중", 860, 88],
  ["parking", "nursing", "백의천사", 850, 98],
  ["rope", "business", "기획천재", 850, 109],
  ["memory", "smart-it", "아이티짱", 850, 121],
  ["star", "police", "광속순경", 845, 134],
  ["rope", "architecture", "모형장인", 840, 148],
  ["memory", "visual-video-design", "키프레임", 840, 163],
  ["jump", "biopharma-industry", "신약개발자", 840, 179],
  ["memory", "social-welfare", "복지요정", 835, 196],
  ["parking", "police", "캠퍼스지킴이", 830, 214],
  ["star", "biopharma-industry", "바이오리듬", 830, 233],
  ["jump", "architecture", "건축박자", 830, 253],
  ["rope", "sports-leisure", "점프왕", 825, 274],
  ["memory", "business", "마감준수", 820, 296],
  ["star", "architecture", "스케일백", 820, 319],
  ["rope", "ai-computer", "디버거", 815, 343],
  ["memory", "biopharma-industry", "정밀피펫", 815, 368],
  ["parking", "sports-leisure", "근육참새", 810, 394],
  ["star", "nursing", "빠른처치", 810, 421],
  ["rope", "social-welfare", "함께달려", 810, 449],
  ["jump", "police", "순찰비트", 810, 478],
  ["rope", "police", "추격자", 800, 508],
  ["jump", "sports-leisure", "응원단장", 800, 539],
  ["parking", "biopharma-industry", "세포비행", 795, 571],
  ["jump", "social-welfare", "마음박자", 795, 604],
  ["memory", "architecture", "수평수직", 790, 638],
  ["star", "sports-leisure", "스타트왕", 790, 673],
  ["rope", "smart-it", "버그헌터", 780, 709],
  ["parking", "visual-video-design", "레이어백개", 780, 746],
  ["star", "social-welfare", "공감버튼", 780, 784],
  ["parking", "architecture", "공중도면", 760, 823],
  ["star", "business", "속전속결", 760, 863],
  ["parking", "social-welfare", "희망날개", 740, 904],
  ["jump", "nursing", "심장박동", 790, 946],
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
