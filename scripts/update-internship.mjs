import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await fs.readFile(path.join(root, 'assets/internship-data.json'), 'utf8'));
const featured = [9, 10, 13].map(id => data.find(item => item.id === id));
const selected = featured.slice(0, 2);
const amount = selected.reduce((sum, item) => sum + item.gmv, 0);
const units = selected.reduce((sum, item) => sum + item.items, 0);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
function card(item, feature = false) {
  const title = `${item.period} · ${item.kind}`;
  const caption = `${item.display} · ${item.items} 件；${item.note}`;
  return `<figure class="evidence-card${feature ? ' evidence-featured' : ''}">
    <a class="evidence-image" href="previews/internship/${item.file}" target="_blank" rel="noopener" data-evidence="${item.id}" data-title="${escape(title)}" data-caption="${escape(caption)}" aria-label="放大查看：${escape(title)}，${escape(caption)}">
      <img src="previews/internship/thumb-${item.file}" alt="TikTok 后台实拍：${escape(title)}，${escape(caption)}" width="450" height="600" loading="lazy">
      <span class="evidence-number">PHOTO ${String(item.id).padStart(2, '0')}</span><span class="evidence-enlarge">查看大图 ${arrow}</span>
    </a>
    <figcaption><span class="evidence-period">${escape(item.period)}</span><h4>${escape(item.kind)} <strong>${escape(item.display)}</strong></h4><p>${item.items} 件 · ${escape(item.note)}</p></figcaption>
  </figure>`;
}
const content = `
      <!-- INTERNSHIP:START -->
      <article class="internship" aria-labelledby="internship-title">
        <div class="internship-heading"><p class="eyebrow"><span class="tiny-square" aria-hidden="true"></span> INTERNSHIP / AUTOMATION IN PRACTICE</p><span class="internship-label">个人实习经历</span></div>
        <div class="internship-lead">
          <div><h3 id="internship-title">搭建 TikTok<br>自动化工作流<span>。</span></h3><p class="internship-description">实习期间，搭建 TikTok 自动化工作流，将工具应用于实际运营场景。结合带货后台的 GMV、成交件数与商品曝光，记录业务表现，让实习成果有据可查。</p><div class="internship-tags"><span>工作流搭建</span><span>TikTok 电商</span><span>运营数据</span></div></div>
          <a class="internship-site" href="http://qingkongai.com/" target="_blank" rel="noopener noreferrer" aria-label="访问 TikTok 自动化工作流项目 qingkongai.com（在新标签页打开）"><span class="internship-site-top">PROJECT LINK ${arrow}</span><strong>qingkong<span>ai</span>.com</strong><span class="internship-site-bottom">TikTok 自动化工作流<span>访问项目 ↗</span></span></a>
        </div>
        <div class="internship-metrics" aria-label="后台报表中的实习成果">
          <div><span class="metric-label">精选 6、7 月 Commission GMV</span><strong><small>约 $</small>${(amount / 1000).toFixed(1)}<small>K</small></strong><p>两份完整月报展示值合计 · ${units} 件商品</p></div>
          <div><span class="metric-label">8 月完整月报 · 归因 GMV</span><strong><small>约 $</small>1.7<small>K</small></strong><p>2026.08.01—08.31 · 134 件商品</p></div>
          <div><span class="metric-label">8 月商品曝光次数</span><strong>115.4<small>K</small></strong><p>同份 8 月报表 · 商品点击约 7.9K 次</p></div>
        </div>
        <p class="internship-source">数据来自下方 TikTok 后台实拍。$ 保留后台币种符号，K 表示千；缩写金额为约数。Commission GMV 与归因 GMV 分开统计，以上数据不代表个人净收入或自动化带来的增量。</p>
        <div class="evidence-heading"><div><p class="eyebrow">RESULTS, WITH RECEIPTS</p><h4>业务成果，留在真实记录里。</h4></div><span>13 张实拍 · 点击放大</span></div>
        <div class="evidence-grid">${featured.map(item => card(item, true)).join('\n')}</div>
        <details class="evidence-more"><summary><span>查看其余 10 张实拍与全部数据明细</span><span class="details-toggle" aria-hidden="true">＋</span></summary>
          <p class="evidence-detail-intro">完整保留每张照片的统计区间与指标名称。未显示账号标识的报表独立列示；单日数据、阶段快照与完整月报不重复累加。</p>
          <div class="evidence-table-wrap" role="region" aria-label="13 张实拍数据明细，可横向滚动" tabindex="0"><table class="evidence-table"><caption>后台数据逐图核对 · 金额为照片中的显示值</caption><thead><tr><th scope="col">照片</th><th scope="col">报表区间</th><th scope="col">指标</th><th scope="col">GMV</th><th scope="col">件数</th><th scope="col">统计说明</th></tr></thead><tbody>${data.map(item => `<tr><th scope="row">${String(item.id).padStart(2,'0')}</th><td>${escape(item.period)}</td><td>${escape(item.kind)}</td><td>${escape(item.display)}</td><td>${item.items}</td><td>${escape(item.note)}</td></tr>`).join('')}</tbody></table></div>
          <div class="evidence-grid evidence-archive">${data.filter(item => !featured.some(f => f.id === item.id)).map(item => card(item)).join('\n')}</div>
        </details>
      </article>
      <!-- INTERNSHIP:END -->
`;
const file = path.join(root, 'index.html');
let html = await fs.readFile(file, 'utf8');
if (html.includes('<!-- INTERNSHIP:START -->')) {
  html = html.replace(/\s*<!-- INTERNSHIP:START -->[\s\S]*?<!-- INTERNSHIP:END -->\s*/, () => content);
} else {
  html = html.replace(/(<section id="about"[\s\S]*?)(<\/section>)/, (_, start, end) => start + content + end);
}
html = html.replace('关于实验场</a>', '关于我与实习</a>');
if (!html.includes('src="assets/internship.js"')) html = html.replace('</head>', '  <script src="assets/internship.js" defer></script>\n</head>');
if (!html.includes('id="evidence-dialog"')) html = html.replace('</body>', `  <dialog id="evidence-dialog" class="evidence-dialog" aria-labelledby="evidence-title" aria-describedby="evidence-caption">
    <div class="dialog-header"><span class="eyebrow">TIKTOK / ORIGINAL RECORDS</span><button id="evidence-close" aria-label="关闭实拍大图" autofocus>×</button></div>
    <h2 id="evidence-title"></h2><p id="evidence-caption"></p>
    <div class="evidence-dialog-photo"><img alt=""></div>
    <div class="evidence-dialog-actions"><button id="evidence-prev" aria-label="上一张实拍">← 上一张</button><span id="evidence-position" role="status" aria-live="polite"></span><button id="evidence-next" aria-label="下一张实拍">下一张 →</button><a id="evidence-file" target="_blank" rel="noopener">单独打开图片 ↗</a></div>
  </dialog>
</body>`);
await fs.writeFile(file, html);
console.log(`Updated internship: ${data.length} photos; selected Commission GMV ≈ $${amount}, ${units} items.`);
