export type ScienceTool = {
  id: string;
  group: '現象量測' | '影像與影片' | '資料分析' | '感測與程式' | '野外與地球資料';
  name: string;
  provider: string;
  access: string;
  setup: string;
  level: '入門' | '進階';
  summary: string;
  bestFor: string;
  output: string;
  workflow: string[];
  caution: string;
  url: string;
};

export const scienceToolsCheckedAt = '2026-10-06';

export const scienceTools: ScienceTool[] = [
  {
    id: 'phyphox', group: '現象量測', name: 'phyphox', provider: 'RWTH Aachen University', access: '免費 App', setup: 'Android／iOS 手機', level: '入門',
    summary: '把手機的加速度、磁場、陀螺儀、光、壓力、麥克風與定位等感測器轉為實驗資料，並可匯出常用格式。',
    bestFor: '振動、擺動、聲音、光照、氣壓、高度、運動或環境變化。', output: '時間序列、圖表、CSV／試算表資料。',
    workflow: ['先確認每支手機是否具有所需感測器', '固定手機位置與方向，做空白／基準量測', '匯出原始資料，再以圖表比較處理組'],
    caution: '不同型號感測器範圍與解析度不同；研究報告需註明手機型號、取樣條件與校正方式。', url: 'https://phyphox.org/',
  },
  {
    id: 'tracker', group: '影像與影片', name: 'Tracker', provider: 'Open Source Physics', access: '免費開源', setup: 'Windows／macOS／Linux 或網頁版', level: '入門',
    summary: '影片分析與模型工具，可從影格追蹤物體的位置、速度與加速度，並進行曲線擬合與模型比較。',
    bestFor: '拋體、碰撞、振動、流體軌跡、彈跳、旋轉等可錄影的運動現象。', output: '座標—時間資料、速度／加速度圖與模型疊圖。',
    workflow: ['鏡頭固定、在畫面放入已知長度的尺度', '讓運動盡量與鏡頭平面平行', '以不同影片或重複追蹤估計誤差'],
    caution: '畫面透視、幀率、模糊與校正尺位置都會影響結果；不要只截取最漂亮的一段影片。', url: 'https://opensourcephysics.github.io/tracker/',
  },
  {
    id: 'imagej', group: '影像與影片', name: 'ImageJ／Fiji', provider: 'ImageJ community', access: '公有領域／免費', setup: '桌上型電腦', level: '進階',
    summary: '科學影像處理與分析工具；可量測長度、面積、像素值與時間序列，Fiji 另整合常用社群外掛。',
    bestFor: '葉片／菌落面積、顏色變化、顆粒數、顯微影像、液面高度與生物影像。', output: '校正後的長度或面積、像素強度、分割結果與可重做的巨集流程。',
    workflow: ['同批影像保持距離、光源、曝光與背景一致', '先用尺規或標準物做比例校正', '保留原始圖與處理步驟，讓他人可重做'],
    caution: '調亮、濾鏡或閾值會改變量測結果；同一研究的判定規則應在分析前固定。', url: 'https://imagej.net/learn/index',
  },
  {
    id: 'codap', group: '資料分析', name: 'CODAP', provider: 'Concord Consortium', access: '免費、免帳號網頁工具', setup: '現代瀏覽器', level: '入門',
    summary: '為教育設計的互動式資料分析與視覺化工具，可快速用表格、散點圖、分組和篩選探索資料。',
    bestFor: '試驗前的資料檢查、分組比較、探索異常值與建立初步圖表。', output: '互動圖表、分組摘要與可討論的資料視覺化。',
    workflow: ['每列代表一個觀測單位、每欄只放一種變項', '先看遺漏值與明顯異常值的來源', '以圖表發現趨勢後，再回到原始紀錄檢查'],
    caution: '圖表顯示相關不等於因果；對照組、樣本數與重複量測仍須由研究設計先保證。', url: 'https://codap.concord.org/about/',
  },
  {
    id: 'colab', group: '資料分析', name: 'Google Colab', provider: 'Google Research', access: '可免費使用；資源額度會變動', setup: '瀏覽器與 Google 帳號', level: '進階',
    summary: '可在瀏覽器撰寫及執行 Python 的雲端筆記本，適合把清理資料、繪圖與統計步驟保存成可重做的程式。',
    bestFor: '多批 CSV 合併、重複繪圖、影像資料整理、基礎統計與資料處理紀錄。', output: '可分享的 .ipynb 筆記本、程式、圖表與處理紀錄。',
    workflow: ['從小型、已匿名化的資料副本開始', '每次轉換資料都保留程式碼與輸出', '另存資料字典，說明欄位、單位與缺值'],
    caution: '不要執行來源不明筆記本；免費運算資源與連線時間可能改變，重要結果應能在其他環境重做。', url: 'https://colab.research.google.com/notebooks/welcome.ipynb',
  },
  {
    id: 'arduino', group: '感測與程式', name: 'Arduino', provider: 'Arduino', access: 'IDE 免費；需另備開發板與感測元件', setup: '電腦、開發板、感測器', level: '進階',
    summary: '開源電子與微控制器平台，可讀取光、溫溼度、距離、氣體或自製電路訊號，建立客製化量測裝置。',
    bestFor: '需要固定取樣頻率、長時間記錄、自製感測裝置或控制條件的工程型研究。', output: '序列埠紀錄、感測時間序列、可重製的電路與程式。',
    workflow: ['先用已知標準或商用儀表比對感測值', '分開測試電路穩定性與研究現象', '記錄接線圖、程式版本、取樣時間與供電方式'],
    caution: '感測器的精度、校正與漂移不能省略；涉及市電、高溫或化學品時須由教師評估安全。', url: 'https://docs.arduino.cc/learn',
  },
  {
    id: 'microbit', group: '感測與程式', name: 'micro:bit V2 資料記錄', provider: 'Micro:bit Educational Foundation', access: '程式工具免費；需 micro:bit V2', setup: '電腦、micro:bit V2、電池盒', level: '入門',
    summary: '可用 MakeCode 或 Python 記錄加速度、光、溫度、磁場、聲音等資料；裝置離線也能保存，之後可下載分析。',
    bestFor: '校園微氣候、噪音／光照、移動行為、長時間環境變化與入門資料記錄。', output: '帶時間戳的表格、裝置內圖表與 CSV 資料。',
    workflow: ['先決定記錄間隔、欄位名稱與開始／停止條件', '在相同位置與高度佈設多次或多台記錄器', '下載後檢查時間軸、遺漏值與裝置滿載情形'],
    caution: '內建感測值適合比較趨勢，不必然等同專業儀器；溫度也會受板子與手部熱源影響。', url: 'https://www.microbit.org/get-started/user-guide/data-logging/',
  },
  {
    id: 'qgis', group: '野外與地球資料', name: 'QGIS', provider: 'QGIS Project', access: '免費開源', setup: 'Windows／macOS／Linux', level: '進階',
    summary: '地理資訊系統，可視覺化、管理、編輯與分析向量、網格和資料庫資料，並製作可追溯的研究地圖。',
    bestFor: '棲地分布、採樣點、地形、土地利用、河川／降雨或空間梯度問題。', output: '地圖、空間圖層、採樣點資料與空間分析結果。',
    workflow: ['統一座標系統與資料時間範圍', '先標示採樣可及範圍，避免只取方便地點', '地圖完成後回查每一個圖層的資料來源與日期'],
    caution: '地圖看起來精細不表示資料精確；不同解析度、年代或座標系統混用會製造假趨勢。', url: 'https://www2.qgis.org/en/site/',
  },
  {
    id: 'cwa-opendata', group: '野外與地球資料', name: '中央氣象署開放資料', provider: '交通部中央氣象署', access: '公開資料；部分服務依平台規範使用', setup: '瀏覽器／資料處理工具', level: '入門',
    summary: '可查詢測站位置、觀測時間、降水、風、氣溫、濕度與氣壓等欄位，適合作為在地實測的第二條證據鏈。',
    bestFor: '微氣候、降雨、颱風、熱島、環境因子與長期趨勢的背景資料。', output: '測站觀測資料、位置資訊與可整理的時間序列。',
    workflow: ['挑選與研究地點、時間最接近的測站', '先確認量測單位、時間解析度與缺測標記', '把公開資料當背景或交叉驗證，不取代自己的研究設計'],
    caution: '測站距離、海拔、都市化程度與儀器環境都會造成差異；務必說明為何選用該站。', url: 'https://opendata.cwa.gov.tw/dataset/observation/O-A0001-001',
  },
  {
    id: 'inaturalist', group: '野外與地球資料', name: 'iNaturalist', provider: 'iNaturalist', access: '免費網頁／App', setup: '手機或相機、網路帳號', level: '入門',
    summary: '以照片、聲音、日期與位置記錄野生生物觀察，並可查詢社群觀測資料；適合建立物種出現與季節變化的觀察紀錄。',
    bestFor: '校園生物多樣性、物候、棲地利用、昆蟲／植物出現與長期公民科學紀錄。', output: '帶照片、時間、地點和辨識資訊的觀測紀錄，可依條件篩選或下載。',
    workflow: ['每次觀察保留原始照片、日期、地點與方法', '將平台辨識視為待驗證的假說，而非最後答案', '用採樣努力量與調查時間，讓不同地點可比較'],
    caution: '物種辨識需由證據支持，AI 或社群建議不能單獨當作結論；敏感物種位置也須注意保護。', url: 'https://www.inaturalist.org/pages/about.html',
  },
];

export const scienceToolGroups = ['全部', '現象量測', '影像與影片', '資料分析', '感測與程式', '野外與地球資料'] as const;
