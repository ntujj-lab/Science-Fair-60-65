import { mkdir, writeFile } from 'node:fs/promises';

const root = 'https://twsf.ntsec.gov.tw/activity/race-1';
const outputDir = new URL('../app/data/', import.meta.url);
const userAgent = 'Science-Fair-Atlas/1.0 (public education research index)';
const groups = [
  { id: 'elementary', label: '國小組', prefix: 'elementary' },
  { id: 'junior', label: '國中組', prefix: 'high' },
  { id: 'senior', label: '高中組', prefix: 'senior' },
];
const splitSubjects = ['物理科', '化學科', '生物科', '數學科', '地球科學科', '生活與應用科學科'];
const subjectPattern = /(工程學科\([一二三四五六七八九十]\)|工程學\([一二三四五六七八九十]\)科|生活與應用科學\([一二三四五六七八九十]\)科|地球與行星科學科|動物與醫學科|農業與食品學科|電腦與資訊學科|行為與社會科學科|生活與應用科學科|生物及地球科學科|生物\(生命科學\)科|植物學科|環境學科|應用科學科|地球科學科|物理科|化學科|生物科|數學科|理化科)/g;

const decode = (value) => value
  .replace(/<img\b[^>]*\balt\s*=\s*["']([^"']*)["'][^>]*>/gi, ' $1 ')
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;|&#34;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&mdash;/gi, '—')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const nearestSubject = (html, index) => [...html.slice(Math.max(0, index - 6500), index).matchAll(subjectPattern)].at(-1)?.[1] || '未標示科別';
const compact = (value = '') => value.replace(/\s+/g, '');
const isTaoyuan = (school = '') => /桃園(?:縣|市)/.test(school) || /新興學校財團法人.*新興高級/.test(school) || /桃園市私立新興高級/.test(school);

function pageConfigs(edition, group) {
  if (edition === 52 || edition === 53) {
    return splitSubjects.map((subject, index) => ({
      source: `${root}/${edition}/${group.prefix}${String(index + 1).padStart(2, '0')}.htm`,
      subject,
    }));
  }
  const extension = edition === 54 || edition === 55 ? 'htm' : 'html';
  return [{ source: `${root}/${edition}/${group.prefix}.${extension}` }];
}

async function fetchText(source) {
  const response = await fetch(source, { headers: { 'user-agent': userAgent } });
  if (!response.ok) throw new Error(`${response.status} ${source}`);
  const bytes = await response.arrayBuffer();
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  return utf8.includes('�') ? new TextDecoder('big5').decode(bytes) : utf8;
}

function parsePage(html, { edition, group, source, fixedSubject = '' }) {
  const rows = [];
  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const table = tableMatch[0];
    const subject = fixedSubject || nearestSubject(html, tableMatch.index || 0);
    for (const rowMatch of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
      if (cells.length < 3 || !/^\d{4,}$/.test(cells[0])) continue;
      const [work_id, title, school, award = ''] = cells;
      if (!title || !school) continue;
      rows.push({ edition, group: group.label, subject, award, work_id, title, school, source_url: source });
    }
  }
  return rows;
}

const allWorks = [];
for (let edition = 39; edition <= 65; edition += 1) {
  for (const group of groups) {
    const pages = pageConfigs(edition, group);
    const pageRows = [];
    for (const page of pages) {
      const html = await fetchText(page.source);
      pageRows.push(...parsePage(html, { edition, group, source: page.source, fixedSubject: page.subject }));
    }
    const uniqueRows = [...new Map(pageRows.map((row) => [`${row.group}-${row.work_id}`, row])).values()];
    if (!uniqueRows.length) throw new Error(`第${edition}屆${group.label}未解析出任何作品，請檢查官方頁面格式。`);
    allWorks.push(...uniqueRows);
    console.log(`第${edition}屆 ${group.label}: ${uniqueRows.length} 件`);
  }
}

const periods = [
  { id: 'recent', title: '近十年：第57–65屆', yearsLabel: '2017–2025', summary: '以完整公開名冊逐件比對桃園市學校，呈現近十年的科別與名次。' },
  { id: 'legacy', title: '前十年：第47–56屆', yearsLabel: '2007–2016', summary: '保留改制前後原始科別名稱，避免將早年學制直接套入現行分類。' },
  { id: 'archive', title: '再前十年：第39–46屆', yearsLabel: '1999–2006', summary: '以早期數位名冊建立可回查的逐件紀錄；第37–38屆仍另列為數位專輯待補。' },
];

function rankTotals(details) {
  const count = (pattern) => details.filter((item) => pattern.test(compact(item.rank))).length;
  const first = count(/第一名/);
  const second = count(/第二名/);
  const third = count(/第三名/);
  const merit = count(/佳作/);
  return { first, second, third, merit, other: details.length - first - second - third - merit };
}

function makeYear(edition, group) {
  const entries = allWorks.filter((work) => work.edition === edition && work.group === group.label && isTaoyuan(work.school));
  const awardDetails = entries.filter((work) => compact(work.award)).map(({ subject, award, school, title, work_id }) => ({ subject, rank: award, school, title, workId: work_id }));
  return {
    edition,
    entries: entries.length,
    awards: awardDetails.length,
    ...rankTotals(awardDetails),
    source: pageConfigs(edition, group)[0].source,
    awardDetails,
  };
}

const taoyuanGroups = groups.map((group) => ({
  id: group.id,
  label: group.label,
  summary: group.label === '高中組' ? '高中階段兼具自然科學與工程、資訊等跨域研究，適合觀察題目如何往專題化與實作驗證深化。' : group.label === '國中組' ? '國中階段維持原有長期追蹤，並與高中、國小採用相同的官方名冊統計口徑。' : '國小階段以生活觀察、環境與跨域實作為常見起點，可作為探究問題萌發與證據設計的參考。',
  periods: periods.map((period) => ({
    ...period,
    sourceNote: '第39–65屆以官方組別名冊逐件比對學校所在地；獲獎率＝有獎項標示的作品數 ÷ 桃園市該組參展作品數。不同屆次的獎項與科別制度可能不同，適合觀察脈絡，不宜直接作跨屆競爭強度比較。',
    years: Array.from({ length: period.id === 'recent' ? 9 : 10 }, (_, index) => {
      const ranges = { recent: 57, legacy: 47, archive: 39 };
      return makeYear(ranges[period.id] + index, group);
    }),
  })),
}));

const data = {
  scope: '第39–65屆全國中小學科學展覽會國小、國中與高中組公開參展名冊；第66屆官方目前以大會獎名冊另行呈現，未併入完整參展件數。',
  sourceRoot: root,
  works: allWorks,
};
const taoyuan = {
  scope: '第39–65屆全國中小學科學展覽會官方組別名冊；學校名稱含桃園縣／市，或新興高中校名者歸類為桃園。第37–38屆數位優勝專輯資料不足，保留於既有國中組歷史註記，不以推測補值。',
  groups: taoyuanGroups,
};

await mkdir(outputDir, { recursive: true });
await writeFile(new URL('national-fair-works-39-65.json', outputDir), `${JSON.stringify(data)}\n`);
await writeFile(new URL('taoyuan-national-performance-groups-39-65.json', outputDir), `${JSON.stringify(taoyuan)}\n`);
console.log(`\n共收錄 ${allWorks.length} 件作品；桃園得獎 ${allWorks.filter((work) => isTaoyuan(work.school) && compact(work.award)).length} 件。`);
