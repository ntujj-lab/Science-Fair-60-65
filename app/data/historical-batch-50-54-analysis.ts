import { historicalResearchBlueprints } from './historical-batch-55-59-analysis';

export const historicalBatch50to54 = {
  range: '50–54',
  scope: '第50–54屆全國中小學科學展覽會・國中組・官方名冊中有大會獎標示的作品',
  evidenceLevel: 'official-award-list-title-guide',
  totalAwards: 334,
  editions: [
    { edition: 50, awards: 69, top3: 31 },
    { edition: 51, awards: 65, top3: 28 },
    { edition: 52, awards: 61, top3: 27 },
    { edition: 53, awards: 74, top3: 30 },
    { edition: 54, awards: 65, top3: 29 },
  ],
  note: '下列內容以官方名冊的科別、題名與獎項建立跨作品的選題與研究設計導引。操縱／應變變因、對照、量測與限制是帶讀時應回到作品說明書查核的設計框架，不是對任一題名的全文結論。第50屆改用官方完整名冊擷取，因該屆分科瀏覽頁存在重複顯示物理科資料的情形。',
} as const;

// The subject-specific framework distinguishes title-guided teaching prompts from any full-text conclusion.
export const historicalResearchBlueprints50to54 = historicalResearchBlueprints;
