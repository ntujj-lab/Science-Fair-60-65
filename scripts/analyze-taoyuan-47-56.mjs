const root = 'https://twsf.ntsec.gov.tw/activity/race-1';
const subjects = ['物理科', '化學科', '生物科', '數學科', '地球科學科', '生活與應用科學科'];
const individualPages = (edition) => subjects.map((subject, index) => ({
  subject,
  source: `${root}/${edition}/high${String(index + 1).padStart(2, '0')}.htm`,
}));

const editions = [
  { edition: 47, pages: [{ source: `${root}/47/high.html` }] },
  { edition: 48, pages: [{ source: `${root}/48/high.html` }] },
  { edition: 49, pages: [{ source: `${root}/49/high.html` }] },
  { edition: 50, pages: [{ source: `${root}/50/high.html` }] },
  { edition: 51, pages: [{ source: `${root}/51/high.html` }] },
  { edition: 52, pages: individualPages(52) },
  { edition: 53, pages: individualPages(53) },
  { edition: 54, pages: [{ source: `${root}/54/high.htm` }] },
  { edition: 55, pages: [{ source: `${root}/55/high.htm` }] },
  { edition: 56, pages: [{ source: `${root}/56/high.html` }] },
];

function decode(value) {
  return value
    .replace(/<img\b[^>]*\balt\s*=\s*["']([^"']*)["'][^>]*>/gi, ' $1 ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const subjectPattern = /(生活與應用科學科|生物及地球科學科|理化科|地球科學科|物理科|化學科|生物科|數學科)/g;

function nearestSubject(html, index) {
  const matches = [...html.slice(Math.max(0, index - 6000), index).matchAll(subjectPattern)];
  return matches.at(-1)?.[1] || '';
}

function isTaoyuan(school) {
  return /桃園(?:縣|市)/.test(school) || /新興學校財團法人.*新興高級/.test(school);
}

function parsePage(html, edition, source, fixedSubject = '') {
  const rows = [];
  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const table = tableMatch[0];
    const subject = fixedSubject || nearestSubject(html, tableMatch.index || 0);
    for (const rowMatch of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
      if (cells.length < 4 || !/^\d{6,}$/.test(cells[0])) continue;
      const [workId, title, school, award] = cells;
      if (!school || !title || !isTaoyuan(school)) continue;
      rows.push({ edition, workId, title, school, subject: subject || '未標示科別', award, source });
    }
  }
  return rows;
}

const years = [];
for (const config of editions) {
  const pageRows = [];
  for (const page of config.pages) {
    const response = await fetch(page.source, { headers: { 'user-agent': 'Science-Fair-Atlas/1.0' } });
    if (!response.ok) throw new Error(`第${config.edition}屆名冊無法下載：${response.status} ${page.source}`);
    pageRows.push(...parsePage(await response.text(), config.edition, page.source, page.subject));
  }
  const deduped = [...new Map(pageRows.map((row) => [row.workId, row])).values()];
  const awardDetails = deduped.filter((row) => row.award).map(({ subject, award, school, title }) => ({ subject, rank: award, school, title }));
  const compactRank = (rank) => rank.replace(/\s+/g, '');
  const first = awardDetails.filter((row) => /第一名/.test(compactRank(row.rank))).length;
  const second = awardDetails.filter((row) => /第二名/.test(compactRank(row.rank))).length;
  const third = awardDetails.filter((row) => /第三名/.test(compactRank(row.rank))).length;
  const merit = awardDetails.filter((row) => /佳作/.test(compactRank(row.rank))).length;
  years.push({
    edition: config.edition,
    entries: deduped.length,
    awards: awardDetails.length,
    first,
    second,
    third,
    merit,
    other: awardDetails.filter((row) => !/第一名|第二名|第三名|佳作/.test(compactRank(row.rank))).length,
    source: config.pages[0].source,
    awardDetails,
  });
}

console.log(JSON.stringify({ scope: '第47–56屆官方國中組名冊；以學校名稱含桃園縣／市判定。各屆資料依原始名冊的科別設計保留。', years }, null, 2));
