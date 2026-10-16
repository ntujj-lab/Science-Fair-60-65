import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { get } from 'node:https';

const editions = [
  // The sectioned high.html view for the 50th fair repeats the physics table under chemistry.
  // The official complete list keeps the correct category code and award in each final table cell.
  [50, ['https://twsf.ntsec.gov.tw/activity/race-1/50.html']],
  [51, ['https://twsf.ntsec.gov.tw/activity/race-1/51/high.html']],
  [52, [
    ['https://twsf.ntsec.gov.tw/activity/race-1/52/high01.htm', '物理科'],
    ['https://twsf.ntsec.gov.tw/activity/race-1/52/high02.htm', '化學科'],
    ['https://twsf.ntsec.gov.tw/activity/race-1/52/high03.htm', '生物科'],
    ['https://twsf.ntsec.gov.tw/activity/race-1/52/high04.htm', '數學科'],
    ['https://twsf.ntsec.gov.tw/activity/race-1/52/high05.htm', '地球科學科'],
    ['https://twsf.ntsec.gov.tw/activity/race-1/52/high06.htm', '生活與應用科學科'],
  ]],
  [53, [1, 2, 3, 4, 5, 6].map((subject) => `https://twsf.ntsec.gov.tw/activity/race-1/53/high0${subject}.htm`)],
  [54, ['https://twsf.ntsec.gov.tw/activity/race-1/54/high.htm']],
];
const rawRoot = process.env.SCIENCE_FAIR_RAW_ROOT || 'D:/科學教育-科展分析60-66/原始資料/第50-54屆官方得獎名冊';
const output = resolve('app/data/historical-awards-50-54.json');
const subjectPattern = /(生活與應用科學\s*(?:\([一二]\))?科|地球科學科|物理科|化學科|生物科|數學科)/g;

function decode(value) {
  return value.replace(/<br\s*\/?>/gi, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;|&#34;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function nearestSubject(before) {
  const matches = [...before.matchAll(subjectPattern)];
  return matches.at(-1)?.[1]?.replace(/\s+/g, '') || '';
}

function subjectFromWorkId(workId) {
  return ({
    '01': '物理科',
    '02': '化學科',
    '03': '生物科',
    '04': '數學科',
    '05': '地球科學科',
    '08': '生活與應用科學科',
  })[workId.slice(2, 4)] || '';
}

function download(sourceUrl) {
  return new Promise((resolveDownload, reject) => {
    const request = get(sourceUrl, { headers: { 'user-agent': 'Science-Fair-Atlas/1.0' } }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        if (response.statusCode !== 200) return reject(new Error(`下載失敗：${response.statusCode} ${sourceUrl}`));
        const raw = Buffer.concat(chunks);
        const encodingHint = `${response.headers['content-type'] || ''} ${raw.subarray(0, 4096).toString('ascii')}`;
        const charset = /charset\s*=\s*["']?big5|big5/i.test(encodingHint) ? 'big5' : 'utf-8';
        resolveDownload(new TextDecoder(charset).decode(raw));
      });
    });
    request.setTimeout(30_000, () => request.destroy(new Error(`下載逾時：${sourceUrl}`)));
    request.on('error', reject);
  });
}

function parseTables(html, edition, sourceUrl, subjectOverride = '') {
  const records = [];
  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const subject = subjectOverride || nearestSubject(html.slice(Math.max(0, tableMatch.index - 1200), tableMatch.index));
    if (!subject) continue;
    for (const rowMatch of tableMatch[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
      if (cells.length < 4 || !/^\d{6,}$/.test(cells[0])) continue;
      const [workId, title, school, ...trailingCells] = cells;
      const award = trailingCells.at(-1) || '';
      if (!award || !title || !school) continue;
      records.push({ edition, subject: subjectFromWorkId(workId) || subject, award, work_id: workId, title, school, source_url: sourceUrl, evidence_level: 'official-award-list-title-guide' });
    }
  }
  return records;
}

function parseCompleteList(html, edition, sourceUrl) {
  const records = [];
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
    if (cells.length < 4 || !/^03\d{4}$/.test(cells[0])) continue;
    const [workId, title, school, ...trailingCells] = cells;
    const subject = subjectFromWorkId(workId);
    const award = trailingCells.at(-1) || '';
    if (!subject || !award || !title || !school) continue;
    records.push({ edition, subject, award, work_id: workId, title, school, source_url: sourceUrl, evidence_level: 'official-award-list-title-guide' });
  }
  return records;
}

await mkdir(rawRoot, { recursive: true });
const allRecords = [];
const report = [];
for (const [edition, sourceUrls] of editions) {
  const pages = [];
  const records = [];
  for (const source of sourceUrls) {
    const [sourceUrl, subjectOverride] = Array.isArray(source) ? source : [source, ''];
    const html = await download(sourceUrl);
    pages.push(html);
    records.push(...(edition === 50 ? parseCompleteList(html, edition, sourceUrl) : parseTables(html, edition, sourceUrl, subjectOverride)));
  }
  if (!records.length) throw new Error(`第${edition}屆未擷取到大會獎作品，請檢查名冊格式。`);
  await writeFile(resolve(rawRoot, `第${edition}屆國中組官方得獎名冊.html`), pages.join('\n<!-- official source split -->\n'), 'utf8');
  allRecords.push(...records);
  report.push({ edition, works: records.length, subjects: [...new Set(records.map((record) => record.subject))] });
}
await writeFile(output, `${JSON.stringify(allRecords, null, 2)}\n`, 'utf8');
await writeFile(resolve(rawRoot, '第50-54屆國中組大會獎作品清單.json'), `${JSON.stringify(allRecords, null, 2)}\n`, 'utf8');
await writeFile(resolve(rawRoot, '擷取說明.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), editions: report, records: allRecords.length, scope: '僅保留官方國中組名冊中有大會獎名次的作品；空白名次的參展作品不計入。' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ records: allRecords.length, report }, null, 2));
