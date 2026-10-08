const root = 'https://twsf.ntsec.gov.tw/activity/race-1';
const editions = Array.from({ length: 8 }, (_, index) => ({
  edition: 39 + index,
  source: `${root}/${39 + index}/high.html`,
}));

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

const subjectPattern = /(生活與應用科學科|生物及地球科學科|生物\(生命科學\)科|理化科|應用科學科|地球科學科|物理科|化學科|生物科|數學科)/g;
const nearestSubject = (html, index) => [...html.slice(Math.max(0, index - 6000), index).matchAll(subjectPattern)].at(-1)?.[1] || '未標示科別';
const isTaoyuan = (school) => /桃園(?:縣|市)/.test(school) || /新興學校財團法人.*新興高級/.test(school);
const compactRank = (rank) => rank.replace(/\s+/g, '');

function parsePage(html, edition, source) {
  const rows = [];
  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const table = tableMatch[0];
    const subject = nearestSubject(html, tableMatch.index || 0);
    for (const rowMatch of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
      if (cells.length < 4 || !/^\d{4,}$/.test(cells[0])) continue;
      const [workId, title, school, award] = cells;
      if (!school || !title || !isTaoyuan(school)) continue;
      rows.push({ workId, title, school, subject, award });
    }
  }
  return rows;
}

function parseFortyFifthRoster(html) {
  const rows = [];
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
    if (cells.length < 3 || !/^03\d{4,}$/.test(cells[0])) continue;
    const [workId, title, school] = cells;
    if (!title || !school || !isTaoyuan(school)) continue;
    rows.push({ workId, title, school, subject: '依官方優勝名冊對照', award: '' });
  }
  return rows;
}

function parseFortyFifthAwards(html) {
  const awards = new Map();
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
    if (cells.length < 3 || !/^03\d{4,}$/.test(cells[0])) continue;
    awards.set(cells[0], { title: cells[1], award: cells[2], subject: nearestSubject(html, rowMatch.index || 0) });
  }
  return awards;
}

const years = [];
for (const config of editions) {
  const response = await fetch(config.source, { headers: { 'user-agent': 'Science-Fair-Atlas/1.0' } });
  if (!response.ok) throw new Error(`第${config.edition}屆名冊無法下載：${response.status} ${config.source}`);
  let rows;
  if (config.edition === 45) {
    const rosterSource = `${root}/45.html`;
    const rosterResponse = await fetch(rosterSource, { headers: { 'user-agent': 'Science-Fair-Atlas/1.0' } });
    if (!rosterResponse.ok) throw new Error(`第45屆完整名冊無法下載：${rosterResponse.status} ${rosterSource}`);
    const awards = parseFortyFifthAwards(await response.text());
    const rosterHtml = new TextDecoder('big5').decode(await rosterResponse.arrayBuffer());
    rows = parseFortyFifthRoster(rosterHtml).map((row) => ({ ...row, ...(awards.get(row.workId) || {}) }));
  } else {
    rows = parsePage(await response.text(), config.edition, config.source);
  }
  rows = [...new Map(rows.map((row) => [row.workId, row])).values()];
  const awardDetails = rows.filter((row) => row.award).map(({ subject, award, school, title }) => ({ subject, rank: award, school, title }));
  const first = awardDetails.filter((row) => /第一名/.test(compactRank(row.rank))).length;
  const second = awardDetails.filter((row) => /第二名/.test(compactRank(row.rank))).length;
  const third = awardDetails.filter((row) => /第三名/.test(compactRank(row.rank))).length;
  const merit = awardDetails.filter((row) => /佳作/.test(compactRank(row.rank))).length;
  years.push({
    edition: config.edition,
    entries: rows.length,
    awards: awardDetails.length,
    first,
    second,
    third,
    merit,
    other: awardDetails.filter((row) => !/第一名|第二名|第三名|佳作/.test(compactRank(row.rank))).length,
    source: config.source,
    awardDetails,
  });
}

console.log(JSON.stringify({ scope: '第39–46屆官方國中組名冊；以學校名稱含桃園縣／市判定。各屆資料依原始名冊的科別設計保留。', years }, null, 2));
