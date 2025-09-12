// popup.js

const $ = (sel, root = document) => root.querySelector(sel);

async function collectFromTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error('No active tab');

  // Ensure we are on a HN item page
  const isHNItem = tab.url && tab.url.startsWith('https://news.ycombinator.com/item');
  if (!isHNItem) {
    $('#list').innerHTML = '<p>Open a Hacker News discussion page (item?id=...).</p>';
    $('#meta').textContent = '';
    return { all: [], unique: [], grouped: {} };
  }

  return await chrome.tabs.sendMessage(tab.id, { type: 'collect_links' });
}

function toCsv(rows) {
  const headers = ['url', 'text', 'domain', 'author', 'commentId', 'permalink', 'snippet'];
  const escape = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

function renderList({ all, unique, grouped }) {
  const showUnique = $('#showUnique').checked;
  const groupByDomain = $('#groupByDomain').checked;
  const term = $('#search').value.trim().toLowerCase();

  const data = showUnique ? unique : all;
  const filtered = term
    ? data.filter(it =>
        it.url.toLowerCase().includes(term) ||
        (it.text || '').toLowerCase().includes(term) ||
        (it.domain || '').toLowerCase().includes(term)
      )
    : data;

  $('#meta').textContent = filtered.length + ' link' + (filtered.length === 1 ? '' : 's') + (filtered.length !== data.length ? ' (filtered from ' + data.length + ')' : '');

  const list = $('#list');
  list.innerHTML = '';

  if (groupByDomain) {
    const domains = Object.keys(grouped).sort((a, b) => (a > b ? 1 : -1));
    for (const d of domains) {
      const links = grouped[d].filter(it =>
        it.url.toLowerCase().includes(term) ||
        (it.text || '').toLowerCase().includes(term) ||
        (it.domain || '').toLowerCase().includes(term)
      );

      if (links.length > 0) {
        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = d || '(no domain)';
        section.appendChild(title);

        for (const it of links) section.appendChild(renderItem(it));
        list.appendChild(section);
      }
    }
  } else {
    for (const it of filtered) list.appendChild(renderItem(it));
  }
}

const itemTpl = document.getElementById('item-tpl');

function renderItem(it) {
  const node = itemTpl.content.firstElementChild.cloneNode(true);
  const urlA = $('.url', node);
  urlA.href = it.url;
  urlA.textContent = it.text || it.url;
  $('.domain', node).textContent = it.domain ? '(' + it.domain + ')' : '';
  $('.author', node).textContent = it.author ? 'by ' + it.author : '';
  const p = $('.permalink', node);
  if (it.permalink) {
    p.href = it.permalink;
  } else {
    p.remove();
  }
  $('.snippet', node).textContent = it.snippet || '';
  return node;
}

async function bootstrap() {
  let data = await collectFromTab();
  renderList(data);

  $('#refresh').addEventListener('click', async () => {
    data = await collectFromTab();
    renderList(data);
  });

  $('#showUnique').addEventListener('change', () => renderList(data));
  $('#groupByDomain').addEventListener('change', () => renderList(data));
  $('#search').addEventListener('input', () => renderList(data));

  $('#copyAll').addEventListener('click', async () => {
    const rows = ($('#showUnique').checked ? data.unique : data.all);
    const urls = rows.map(r => r.url).join('\n');
    await navigator.clipboard.writeText(urls);
    alert('Copied ' + rows.length + ' URL' + (rows.length === 1 ? '' : 's'));
  });

  $('#exportCsv').addEventListener('click', () => {
    const rows = ($('#showUnique').checked ? data.unique : data.all);
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hn-comment-links.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

bootstrap().catch(err => {
  console.error(err);
  $('#list').innerHTML = '<p style="color:#c00">Error: ' + String(err) + '</p>';
});
