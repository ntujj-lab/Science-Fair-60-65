import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { get } from 'node:https';

const root = 'https://twsf.ntsec.gov.tw/activity/race-1';
const editions = [45, 46, 47, 48, 49];
const rawRoot = process.env.SCIENCE_FAIR_RAW_ROOT || 'D:/科學教育-科展分析60-66/原始資料/第45-49屆官方得獎名冊';
const output = resolve('app/data/historical-awards-45-49.json');
const subjectPattern = /(生活與應用科學科|生物及地球科學科|理化科|應用科學科|地球科學科|物理科|化學科|生物科|數學科)/g;

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

function nearestSubject(before) {
  const matches = [...before.matchAll(subjectPattern)];
  return matches.at(-1)?.[1] || '';
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

function tableRecords(html, edition, sourceUrl) {
  const records = [];
  for (const tableMatch of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const subject = nearestSubject(html.slice(Math.max(0, tableMatch.index - 8000), tableMatch.index));
    if (!subject) continue;
    for (const rowMatch of tableMatch[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
      if (cells.length < 3 || !/^03\d{4}$/.test(cells[0])) continue;
      const [workId, title, ...rest] = cells;
      const award = rest.at(-1) || '';
      const school = rest.length > 1 ? rest.at(-2) || '' : '';
      if (!title || !award) continue;
      records.push({
        edition,
        subject: edition <= 48 ? subject : subjectFromWorkId(workId) || subject,
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

function rosterById(html) {
  const roster = new Map();
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => decode(cell[1]));
    if (!/^03\d{4}$/.test(cells[0] || '') || cells.length < 3) continue;
    roster.set(cells[0], { title: cells[1], school: cells[2] || '' });
  }
  return roster;
}

await mkdir(rawRoot, { recursive: true });
const allRecords = [];
const report = [];
for (const edition of editions) {
  const sourceUrl = `${root}/${edition}/high.html`;
  const awardsHtml = await download(sourceUrl);
  const records = tableRecords(awardsHtml, edition, sourceUrl);
  if (!records.length) throw new Error(`第${edition}屆未擷取到大會獎作品，請檢查名冊格式。`);
  const rawPages = [awardsHtml];
  if (edition === 45) {
    const rosterUrl = `${root}/45.html`;
    const fullRoster = await download(rosterUrl);
    rawPages.push(fullRoster);
    const roster = rosterById(fullRoster);
    const unmatched = [];
    for (const record of records) {
      const matched = roster.get(record.work_id);
      if (!matched) unmatched.push(record.work_id);
      else {
        record.title = matched.title || record.title;
        record.school = matched.school;
        record.roster_source_url = rosterUrl;
      }
    }
    if (unmatched.length) throw new Error(`第45屆有 ${unmatched.length} 件得獎作品無法對應官方完整名冊：${unmatched.join(', ')}`);
  }
  const duplicateIds = records.filter((record, index) => records.findIndex((other) => other.work_id === record.work_id) !== index);
  if (duplicateIds.length) throw new Error(`第${edition}屆出現重複作品編號：${[...new Set(duplicateIds.map((record) => record.work_id))].join(', ')}`);
  const missingAwards = records.filter((record) => !record.award.trim());
  if (missingAwards.length) throw new Error(`第${edition}屆有 ${missingAwards.length} 件缺少大會獎名次。`);
  await writeFile(resolve(rawRoot, `第${edition}屆國中組官方得獎名冊.html`), rawPages.join('\n<!-- official source split -->\n'), 'utf8');
  allRecords.push(...records);
  report.push({ edition, works: records.length, subjects: [...new Set(records.map((record) => record.subject))], awards: [...new Set(records.map((record) => record.award))] });
}

await writeFile(output, `${JSON.stringify(allRecords, null, 2)}\n`, 'utf8');
await writeFile(resolve(rawRoot, '第45-49屆國中組大會獎作品清單.json'), `${JSON.stringify(allRecords, null, 2)}\n`, 'utf8');
await writeFile(resolve(rawRoot, '擷取說明.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  editions: report,
  records: allRecords.length,
  scope: '僅保留官方國中組名冊中明載大會獎名次的作品；第45屆以得獎名冊的名次、完整名冊的學校資訊交叉核對。第45–48屆沿用當時的理化科與生物及地球科學科分科名稱。',
  evidenceLevel: 'official-award-list-title-guide',
}, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ records: allRecords.length, report }, null, 2));
