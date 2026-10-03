import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const editions = [
  [55, 'https://twsf.ntsec.gov.tw/activity/race-1/55/high.htm'],
  [56, 'https://twsf.ntsec.gov.tw/activity/race-1/56/high.html'],
  [57, 'https://twsf.ntsec.gov.tw/activity/race-1/57/high.html'],
  [58, 'https://twsf.ntsec.gov.tw/activity/race-1/58/high.html'],
  [59, 'https://twsf.ntsec.gov.tw/activity/race-1/59/high.html'],
];
const rawRoot = process.env.SCIENCE_FAIR_RAW_ROOT || 'D:/科學教育-科展分析60-66/原始資料/第55-59屆官方得獎名冊';
const output = resolve('app/data/historical-awards-55-59.json');
const subjectPattern = /(生活與應用科學\s*(?:\([一二]\))?科|地球科學科|物理科|化學科|生物科|數學科)/g;

function decode(value) {
  return value
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

function nearestSubject(before) {
  const matches = [...before.matchAll(subjectPattern)];
  return matches.at(-1)?.[1]?.replace(/\s+/g, '') || '';
}

function parseTables(html, edition, sourceUrl) {
  const records = [];
  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const table = tableMatch[0];
    const subject = nearestSubject(html.slice(Math.max(0, tableMatch.index - 1200), tableMatch.index));
    if (!subject) continue;
    for (const rowMatch of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
      if (cells.length < 4 || !/^\d{6,}$/.test(cells[0])) continue;
      const [workId, title, school, award] = cells;
      if (!award || !title || !school) continue;
      records.push({
        edition,
        subject,
        award,
        work_id: workId,
        title,
        school,
        source_url: sourceUrl,
        evidence_level: 'official-award-list-title-guide',
      });
    }
  }
  return records;
}

await mkdir(rawRoot, { recursive: true });
const allRecords = [];
const report = [];
for (const [edition, sourceUrl] of editions) {
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'Science-Fair-Atlas/1.0' } });
  if (!response.ok) throw new Error(`第${edition}屆名冊無法下載：${response.status} ${sourceUrl}`);
  const html = await response.text();
  const records = parseTables(html, edition, sourceUrl);
  if (!records.length) throw new Error(`第${edition}屆未擷取到大會獎作品，請檢查名冊格式。`);
  await writeFile(resolve(rawRoot, `第${edition}屆國中組官方得獎名冊.html`), html, 'utf8');
  allRecords.push(...records);
  report.push({ edition, works: records.length, subjects: [...new Set(records.map((record) => record.subject))] });
}
await writeFile(output, `${JSON.stringify(allRecords, null, 2)}\n`, 'utf8');
await writeFile(resolve(rawRoot, '第55-59屆國中組大會獎作品清單.json'), `${JSON.stringify(allRecords, null, 2)}\n`, 'utf8');
await writeFile(resolve(rawRoot, '擷取說明.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), editions: report, records: allRecords.length, scope: '僅保留官方國中組名冊中有大會獎名次的作品；空白名次的參展作品不計入。' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ records: allRecords.length, report }, null, 2));
