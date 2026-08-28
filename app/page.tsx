'use client';

import { useMemo, useState } from 'react';
import rawWorks from './data/science-fair-natural.json';

type Work = { edition:number; subject:string; award:string; id:string; title:string; school:string; phenomenon:string; keywords:string[]; structure:string; analysisLevel:'全文'|'題名' };

const detailedWorks: Work[] = [
  { edition:60, subject:'物理科', award:'第一名', id:'030104', school:'宜蘭縣立國華國民中學', title:'熱鍋上的舞者－聚丙烯酸鈉的 Leidenfrost 效應分析', phenomenon:'熱與相變', keywords:['Leidenfrost效應','振動','聲學','能量轉換'], structure:'異常跳動 → 影像與聲音量測 → 瞬間汽化模型 → 壓電應用', analysisLevel:'全文' },
  { edition:60, subject:'物理科', award:'第二名', id:'030109', school:'高雄市立明華國民中學', title:'「危」風陣陣摧－探討微風對纜車的共振影響及改善方法', phenomenon:'振動與波', keywords:['共振','阻尼','角速度','工程安全'], structure:'纜車擺盪 → 結構變因 → 共振測試 → 伸縮吊臂改善', analysisLevel:'全文' },
  { edition:60, subject:'物理科', award:'第三名', id:'030112', school:'新北市立重慶國民中學', title:'翩翩起舞－旋翼球體在流體中旋轉、浮升、擺盪的現象研究', phenomenon:'流體力學', keywords:['浮力','渦流','旋翼','角動量'], structure:'彎曲浮升 → 軌跡量測 → 尾流解釋 → 旋翼穩定化', analysisLevel:'全文' },
  { edition:60, subject:'物理科', award:'第三名', id:'030115', school:'新北市立安溪國民中學', title:'屋欲靜而電不止－探究冷次定律在建築物的減震運用', phenomenon:'振動與波', keywords:['質量阻尼器','電磁感應','減震','能量回收'], structure:'建物振動 → 阻尼參數最佳化 → 消能元件 → 電能回收', analysisLevel:'全文' },
  { edition:60, subject:'物理科', award:'第三名', id:'030117', school:'彰化縣立陽明國民中學', title:'沙墨乾渴、水山爆發－白板筆之創新設計', phenomenon:'壓力與毛細', keywords:['毛細現象','氣體定律','孔隙率','產品設計'], structure:'漏墨問題 → 壓力與溫度測試 → 參數化設計 → 活塞改良', analysisLevel:'全文' },
  { edition:60, subject:'化學科', award:'第三名', id:'030203', school:'彰化縣立彰泰國民中學', title:'以自組修飾光學檢測儀器探討甜菜紅的特性及與銅鉛離子的作用', phenomenon:'光學分析', keywords:['甜菜紅','重金屬','比耳定律','自製光譜儀'], structure:'食安問題 → 儀器校正 → 濃度曲線 → 重金屬檢測', analysisLevel:'全文' },
  { edition:60, subject:'化學科', award:'第三名', id:'030206', school:'新北市立永和國民中學', title:'多多「液」善－雙溶劑對溶質溶解之研究', phenomenon:'溶解與沉澱', keywords:['雙溶劑','溶解度','離子化合物','沉澱'], structure:'醇析觀察 → 離子系列 → 析出量比較 → 機制檢討', analysisLevel:'全文' },
  { edition:60, subject:'化學科', award:'第二名', id:'030208', school:'雲林縣立樟湖生態國民中小學', title:'色粒分明－探討本氏液與還原醣變色反應', phenomenon:'氧化還原', keywords:['本氏液','還原醣','氧化亞銅','廷得耳效應'], structure:'質疑課本 → 反應時間序列 → 顆粒驗證 → 修正成色解釋', analysisLevel:'全文' },
  { edition:60, subject:'化學科', award:'第一名', id:'030209', school:'新北市立福和國民中學', title:'「層」次「分」明－濃度與色素吸附力關係之探討', phenomenon:'層析與吸附', keywords:['濾紙層析','吸附','離子濃度','校正曲線'], structure:'濃度量測需求 → 自訂層析指標 → 分段線性 → 飲料驗證', analysisLevel:'全文' },
];

const rules:[RegExp,string,string[]][]=[
  [/共振|擺|振動|頻率|聲|波/, '振動與波', ['共振','振動','頻率','聲學']], [/流體|水柱|渦|浮升|風力|射流/, '流體力學', ['流體','渦流','浮力','風力']], [/溫度|熱|火焰|Leidenfrost/i, '熱與相變', ['溫度','熱傳','相變']], [/磁|電池|電解|發電|電磁/, '電磁與能量', ['電磁','電化學','發電']], [/光譜|螢光|色變|色素|光學/, '光學分析', ['光譜','光學','色素']], [/吸附|層析|生物炭/, '層析與吸附', ['吸附','層析','淨化']], [/溶解|沉澱|析出|結晶|凝膠/, '溶解與沉澱', ['溶解度','沉澱','結晶']], [/氧化|還原|雙氧水|催化/, '氧化還原', ['氧化還原','催化','反應速率']], [/塑膠|污染|柴油/, '污染與生態毒理', ['污染','微塑膠','環境']], [/菌|微生物|酵母/, '微生物與生物技術', ['微生物','生物技術']], [/植物|葉|花|果莢|藜|番茄|耐旱/, '植物生理與逆境', ['植物','生理','逆境']], [/蛛|蚊|螂|蠅|蝦|鼠婦|昆蟲|海葵|參/, '動物行為與生態', ['動物行為','生態','生活史']],
];
function classify(title:string,subject:string){const found=rules.find(([r])=>r.test(title));if(found)return{phenomenon:found[1],keywords:found[2]};return subject==='生物科'?{phenomenon:'生態與環境',keywords:['生態','環境因子']}:{phenomenon:'力學與物質',keywords:['變因分析','量化研究']}}
const detailMap=new Map(detailedWorks.map(w=>[`${w.edition}-${w.id}`,w]));
const works:Work[]=(rawWorks as Array<{edition:number;subject:string;award:string;work_id:string;title:string;school:string}>).map(raw=>detailMap.get(`${raw.edition}-${raw.work_id}`)||({...raw,id:raw.work_id,...classify(raw.title,raw.subject),structure:'題名分類完成・全文研究架構待分析',analysisLevel:'題名'} as Work));

const colors: Record<string,string> = { '振動與波':'#315d83','熱與相變':'#d26a45','流體力學':'#3f8b78','壓力與毛細':'#8a6a9b','光學分析':'#d19b2a','溶解與沉澱':'#657a42','氧化還原':'#b54b63','層析與吸附':'#557c9a','電磁與能量':'#806331','污染與生態毒理':'#946b52','微生物與生物技術':'#567c68','植物生理與逆境':'#748b45','動物行為與生態':'#8f5967','生態與環境':'#607b75','力學與物質':'#6a7180' };

export default function Home() {
  const [query,setQuery]=useState(''); const [edition,setEdition]=useState('全部'); const [subject,setSubject]=useState('全部'); const [phenomenon,setPhenomenon]=useState('全部');
  const scopeWorks=useMemo(()=>works.filter(w=>(edition==='全部'||w.edition===Number(edition))&&(subject==='全部'||w.subject===subject)),[edition,subject]);
  const distribution=useMemo(()=>Object.entries(scopeWorks.reduce<Record<string,number>>((a,w)=>{a[w.phenomenon]=(a[w.phenomenon]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1]),[scopeWorks]);
  let running=0; const chartTotal=scopeWorks.length||1; const gradient=distribution.map(([name,count])=>{const start=running/chartTotal*100;running+=count;return `${colors[name]} ${start}% ${running/chartTotal*100}%`}).join(',');
  const filtered=works.filter(w=>{const hay=[w.title,w.subject,w.award,w.phenomenon,w.structure,...w.keywords].join(' ').toLowerCase();return(edition==='全部'||w.edition===Number(edition))&&(subject==='全部'||w.subject===subject)&&(phenomenon==='全部'||w.phenomenon===phenomenon)&&hay.includes(query.trim().toLowerCase())}).sort((a,b)=>a.edition-b.edition||a.subject.localeCompare(b.subject,'zh-Hant')||a.award.localeCompare(b.award,'zh-Hant'));
  return <main>
    <header className="hero"><nav><span className="brand">科展脈絡</span><span>全國國中科展・第60–66屆</span></nav><div className="hero-copy"><p className="eyebrow">National Science Fair Research Atlas</p><h1>從得獎作品，看見<br/>研究是怎麼長出來的</h1><p className="lede">以屆次、科別、現象與關鍵字整理全國科展，拆解研究問題、變因、量測、證據與應用。</p></div><div className="metrics"><div><strong>201</strong><span>第60–65屆各科前三名</span></div><div><strong>82</strong><span>物理・化學・生物名冊</span></div><div><strong>9</strong><span>已完成全文分析</span></div></div></header>
    <section className="explore"><div className="section-heading"><div><p className="eyebrow">Explore the evidence</p><h2>用現象找到作品</h2></div><p>收錄第60–65屆物理、化學、生物前三名共82件；題名分類與全文分析採不同標示，避免混淆證據層級。</p></div>
      <div className="dashboard"><div className="chart-area"><h3>研究主現象分布</h3><button className="pie" style={{background:gradient?`conic-gradient(${gradient})`:'#ddd'}} onClick={()=>setPhenomenon('全部')} aria-label="研究主現象圓餅圖；點擊清除篩選"><span>{scopeWorks.length}<small>件作品</small></span></button><div className="legend">{distribution.map(([name,count])=><button key={name} onClick={()=>setPhenomenon(name)} className={phenomenon===name?'active':''}><i style={{background:colors[name]}}/>{name}<b>{count}</b></button>)}</div></div>
        <div className="results-area"><div className="filters"><label><span>關鍵字搜尋</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="共振、光譜、微塑膠…"/></label><label><span>屆次</span><select value={edition} onChange={e=>{setEdition(e.target.value);setPhenomenon('全部')}}><option>全部</option>{[60,61,62,63,64,65].map(n=><option key={n} value={n}>第{n}屆</option>)}</select></label><label><span>科別</span><select value={subject} onChange={e=>{setSubject(e.target.value);setPhenomenon('全部')}}><option>全部</option><option>物理科</option><option>化學科</option><option>生物科</option></select></label></div><p className="result-count" aria-live="polite">找到 {filtered.length} 件作品{phenomenon!=='全部'?`・${phenomenon}`:''}</p><div className="work-list">{filtered.map(w=><article key={`${w.edition}-${w.id}`} className="work-card"><div className="work-meta"><span>第{w.edition}屆</span><span>{w.subject}</span><span>{w.award}</span><span>{w.analysisLevel==='全文'?'全文分析':'題名分類'}</span></div><h3>{w.title}</h3><p className="school">{w.school}</p><p className="structure">{w.structure}</p><div className="tags"><button onClick={()=>setPhenomenon(w.phenomenon)}>{w.phenomenon}</button>{w.keywords.map(k=><button key={k} onClick={()=>setQuery(k)}>{k}</button>)}</div></article>)}</div></div>
      </div>
    </section>
  </main>
}
