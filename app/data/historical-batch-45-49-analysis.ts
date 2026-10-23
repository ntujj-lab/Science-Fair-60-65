import { historicalResearchBlueprints, type HistoricalResearchBlueprint } from './historical-batch-55-59-analysis';

export const historicalBatch45to49 = {
  range: '45–49',
  scope: '第45–49屆全國中小學科學展覽會・國中組・官方名冊中有大會獎標示的作品',
  evidenceLevel: 'official-award-list-title-guide',
  totalAwards: 310,
  editions: [
    { edition: 45, awards: 63, top3: 29 },
    { edition: 46, awards: 57, top3: 28 },
    { edition: 47, awards: 60, top3: 29 },
    { edition: 48, awards: 65, top3: 30 },
    { edition: 49, awards: 65, top3: 29 },
  ],
  note: '本批次以官方得獎名冊的科別、題名與獎項建立跨作品的選題與研究設計導引。第45–48屆仍採理化科與生物及地球科學科的合併分科，本站保留原名，不將其倒推拆成現行科別。操縱／應變變因、對照、量測與限制均為帶讀時應回到作品說明書查核的設計框架，不是對任一題名的全文結論。第45屆另以官方完整名冊補核學校資訊。',
} as const;

const physicalChemistryBlueprint: HistoricalResearchBlueprint = {
  trend: '早期理化科題名同時涵蓋運動、熱、光電、溶液、反應與材料；帶讀時先辨明核心問題屬物理量、化學訊號或兩者交互，避免以單一分科框架預設方法。',
  question: '題名中的現象或材料，在什麼可控制條件下改變，且哪一組可量化資料最能辨別其物理、化學或交互機制？',
  independent: '依題名界定溫度、濃度、材質、幾何、時間、初始條件、電路或環境條件；一次優先改變一項主要因素。',
  dependent: '位移、時間、溫度、光／色訊號、質量、體積、電壓／電流、反應速率或材料性能。',
  controls: '樣品來源與量、裝置尺寸、起始狀態、總體積、量測位置、反應或觀察時間、環境與儀器校正。',
  measurement: '先以基準條件確認量測可重複，再作單一變因掃描；必要時以第二種量測、標準品或模型交叉檢驗。',
  evidence: ['先說清楚觀察訊號與欲判讀機制之間的關係', '以空白／基準與處理條件比較，而非只展示單次結果', '保留重複、誤差與可能干擾，讓物理量與化學訊號彼此驗證'],
  limits: ['題名無法判定個別作品採用哪一種儀器、材料或理論模型', '早期合併科別不宜據此倒推成現行物理或化學科的研究結論'],
  extensions: ['將現象拆成力學／能量或反應／檢測兩條可比較的證據線', '加入校正曲線、模型預測或第二種檢測', '比較理想條件與真實情境下的適用範圍'],
};

const lifeEarthBlueprint: HistoricalResearchBlueprint = {
  trend: '生物及地球科學科題名橫跨生物個體與棲地、氣象、水文、地質及環境系統；研究架構的起點是辨明觀察尺度，再以環境背景與目標反應建立可檢驗的關係。',
  question: '題名所指的生物或地球系統現象，在何種時空與環境條件下出現，哪些資料能區分相關性與可能機制？',
  independent: '物種／樣本、生命階段、地點、季節、環境梯度、地形／材料、氣象水文條件、觀測時間或模型設定。',
  dependent: '行為、生長、生存、族群出現率、環境指標、雨量、水位、地貌、影像特徵或其他時空資料。',
  controls: '樣本數與來源、觀察時段、儀器位置與校時、採樣深度／間距、背景棲地或地質，以及處理前基線。',
  measurement: '將野外觀察、感測或公開資料與小型對照實驗／模型分開呈現；跨資料源時標示時間、地點與不確定度。',
  evidence: ['用多個時間點、地點或樣本檢驗趨勢是否一致', '讓環境資料與生命／地球系統反應互相對照', '清楚區分觀察到的相關性、可控制實驗與可外推範圍'],
  limits: ['題名不能直接說明個別作品的採樣設計、統計方法或因果強度', '自然系統受季節、空間異質性與極端事件影響，短期資料可能不足'],
  extensions: ['延長時序並加入不同地點或族群', '補入獨立的公開資料、現地量測或縮尺模型驗證', '量化季節性、採樣誤差與模型敏感度'],
};

// These two historical categories are retained as original official subject names.
export const historicalResearchBlueprints45to49: Record<string, HistoricalResearchBlueprint> = {
  ...historicalResearchBlueprints,
  '理化科': physicalChemistryBlueprint,
  '生物及地球科學科': lifeEarthBlueprint,
};
