export type ScienceNewsItem = {
  id: string;
  region: '國內' | '國際';
  category: '科展資源' | '期刊導讀' | '科學時事';
  topic: '研究設計' | '太空與天文' | '環境與地球' | '健康與生命' | 'AI 與研究倫理';
  date: string;
  source: string;
  title: string;
  summary: string;
  fairPrompt: string;
  url: string;
};

export const scienceNewsCheckedAt = '2026-10-06';

// Curated from public, primary or editorial sources.  This is intentionally a
// reading list rather than an automatically syndicated feed, so every entry can
// carry a classroom-ready research prompt and a stable source link.
export const scienceNews: ScienceNewsItem[] = [
  {
    id: 'ntsec-digital-investigation', region: '國內', category: '科展資源', topic: '研究設計', date: '2026', source: '國立臺灣科學教育館',
    title: '把手機、影像與感測器變成可驗證的研究工具',
    summary: '國立臺灣科學教育館的科展培訓課程納入手機影像與影音、ImageJ、Phyphox、Tracker、Arduino、AI／機器學習與 3D 建模；它提示了國中作品可先從可靠量測與資料處理開始，而非只做展示。',
    fairPrompt: '一個肉眼可見的現象，能否用手機感測、影像追蹤或簡易感測器，轉成可重複比較的數據？',
    url: 'https://www.ntsec.gov.tw/article/FileAtt.ashx?id=8303',
  },
  {
    id: 'tisf-2026', region: '國內', category: '科展資源', topic: '研究設計', date: '2026', source: '臺灣國際科學展覽會／國立臺灣科學教育館',
    title: '從國內探究走向國際科學展覽：作品需要說清楚什麼？',
    summary: '臺灣國際科學展覽會的官方資料說明，展覽結合學生遴選、國際交流、講座與公開展示。閱讀國際競賽規範時，最值得回看的是問題是否清楚、證據是否可追溯，以及結果能否被陌生讀者理解。',
    fairPrompt: '若只能用一張研究架構圖向外校評審說明，研究問題、對照、資料與結論之間的連線是否完整？',
    url: 'https://twsf.ntsec.gov.tw/activity/race-2/TISF2026/images/2026Manual.pdf',
  },
  {
    id: 'science-monthly-satellites', region: '國內', category: '期刊導讀', topic: '太空與天文', date: '2026-10', source: '科學月刊',
    title: '我們頭頂上的衛星：從太空系統回看日常觀測',
    summary: '《科學月刊》以衛星為主題，適合作為遙測、通訊、光害、定位與地表觀測的延伸閱讀。科展不必直接發射衛星，也能從可取得的公開資料或地面觀察建立小尺度問題。',
    fairPrompt: '能否將一個宏大的衛星議題縮小為校園或社區可量測的光、溫度、位置或影像資料問題？',
    url: 'https://www.scimonth.com.tw/tw/article/index.aspx?page=1',
  },
  {
    id: 'science-monthly-pollutants', region: '國內', category: '期刊導讀', topic: '環境與地球', date: '2026-06', source: '科學月刊',
    title: '新興污染物研究的基本功：採樣、背景值與時空尺度',
    summary: '環境化學的專題討論重金屬與新興污染物時，特別凸顯標準化採樣與不同時間、地點背景資料的重要。這也是把「某處好像比較髒」轉成可檢驗研究的第一步。',
    fairPrompt: '採樣地點、時間、容器與保存方式若不同，怎麼判斷差異來自污染，而非採樣流程？',
    url: 'https://www.scimonth.com.tw/tw/article/index.aspx?cat=4&root=2',
  },
  {
    id: 'isef-2026-awards', region: '國際', category: '科展資源', topic: '研究設計', date: '2026-05-15', source: 'Society for Science／Regeneron ISEF',
    title: 'ISEF 2026 得獎資料庫：用國際作品校準研究表達',
    summary: 'Regeneron ISEF 公開各類大獎名單、專題資料庫與決賽者資料。它適合用來觀察跨國學生如何從研究題目、方法到應用意義，建立評審可理解的完整故事。',
    fairPrompt: '選一件同領域國際作品：它的題目、研究問題、資料來源與應用意義，各用多少文字說清楚？自己的作品少了哪一段？',
    url: 'https://www.societyforscience.org/press-release/regeneron-isef-2026-full-awards/',
  },
  {
    id: 'nasa-moon-base', region: '國際', category: '科學時事', topic: '太空與天文', date: '2026-09-30', source: 'NASA',
    title: 'NASA 為月球表面任務選定新的科學調查',
    summary: 'NASA 公布三項將隨月球任務前往表面的科學調查。月球題材的價值不只在於新奇，而在於如何在極端環境下設定儀器限制、採樣策略與可驗證的問題。',
    fairPrompt: '若研究場域無法直接到達，哪些替代材料、縮尺模型或公開資料能保留關鍵機制，同時清楚標示外推限制？',
    url: 'https://www.nasa.gov/news-release/nasa-adds-new-science-investigations-for-moon-base/',
  },
  {
    id: 'nasa-earth-explorers', region: '國際', category: '科學時事', topic: '環境與地球', date: '2026-02-05', source: 'NASA',
    title: '兩項地球系統衛星任務，指向環境預報與災害理解',
    summary: 'NASA 選定兩項 Earth System Explorers 任務，目標是增進對地球系統變化、環境預報與災害風險的理解。對地球科學探究而言，這提醒我們把單次觀察放進長期、跨尺度資料中解讀。',
    fairPrompt: '你的研究是否能同時呈現「一次現地觀察」與「較長時間的公開資料」？兩者若不一致，可能是尺度還是機制不同？',
    url: 'https://www.nasa.gov/news-release/nasa-selects-two-earth-system-explorers-missions/',
  },
  {
    id: 'nature-ai-imagery', region: '國際', category: '科學時事', topic: 'AI 與研究倫理', date: '持續更新', source: 'Nature News',
    title: 'AI 科學影像的可信度：好看的圖，不必然等於觀測資料',
    summary: 'Nature News 持續追蹤 AI 與科學影像的研究倫理討論。對學生研究而言，生成式工具可以協助找資料與整理想法，但影像、圖表與數據必須清楚標示來源、處理流程與是否為實測。',
    fairPrompt: '每一張圖表都能回答三件事嗎：原始資料從哪裡來、經過什麼處理、讀者能否重做或檢查？',
    url: 'https://www.nature.com/news',
  },
  {
    id: 'nature-health-reading', region: '國際', category: '期刊導讀', topic: '健康與生命', date: '持續更新', source: 'Nature News',
    title: '健康與生命科學：閱讀新聞時先分辨證據強度',
    summary: 'Nature News 持續報導疾病機制、治療與臨床研究。醫學新聞常把「初步結果」帶到大眾面前，讀者可練習追問樣本數、比較組、研究階段與是否真的能推到所有人。',
    fairPrompt: '看到一則健康研究時，能否先列出研究對象、比較條件、主要測量值與尚未回答的限制？',
    url: 'https://www.nature.com/news',
  },
  {
    id: 'science-monthly-method', region: '國內', category: '期刊導讀', topic: '研究設計', date: '持續更新', source: '科學月刊',
    title: '研究方法帶讀：把好奇心變成能被檢驗的提問',
    summary: '科學傳播內容中的研究方法主題，適合教師帶領學生辨別「主題」、「研究問題」與「可驗證假設」的差異。先縮小問題，才能決定合理的變因、對照與證據。',
    fairPrompt: '把目前題目改寫成一句可否證的問題：改變什麼、比較什麼、預期量到什麼，哪些條件要固定？',
    url: 'https://www.scimonth.com.tw/tw/article/index.aspx?cat=12',
  },
];

export const scienceNewsRegions = ['全部', '國內', '國際'] as const;
export const scienceNewsTopics = ['全部', '研究設計', '太空與天文', '環境與地球', '健康與生命', 'AI 與研究倫理'] as const;
