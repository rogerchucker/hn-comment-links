// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'collect_links') {
    const data = extractLinks();
    sendResponse(data);
  }
});

function getHostname(u) {
  try {
    return new URL(u, location.href).hostname;
  } catch (_) {
    return "";
  }
}

function normalizeUrl(u) {
  try {
    const url = new URL(u, location.href);
    return url.toString();
  } catch (_) {
    return u;
  }
}

function extractLinks() {
  const anchors = document.querySelectorAll('.commtext a[href]');
  const all = [];
  const uniqueUrls = new Set();
  const unique = [];
  const grouped = {};

  anchors.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;

    const row = a.closest('tr.comtr') || a.closest('tr.athing.comtr') || a.closest('tr');
    const authorEl = row ? row.querySelector('.hnuser') : null;
    const author = authorEl ? authorEl.textContent.trim() : "";

    const commentTextEl = row ? row.querySelector('.commtext') : a.closest('.commtext');
    const commentText = commentTextEl ? commentTextEl.textContent.replace(/\s+/g, ' ').trim() : a.textContent.trim();

    let snippet = commentText;
    if (snippet.length > 200) snippet = snippet.slice(0, 200) + '…';

    let commentId = "";
    let permalink = "";
    if (row) {
      if (row.id) commentId = row.id;
      const ageLink = row.querySelector('.age > a[href]');
      if (ageLink) permalink = new URL(ageLink.getAttribute('href'), location.origin).toString();
    }

    const url = normalizeUrl(href);
    const domain = getHostname(url);
    const linkData = {
      url,
      text: a.textContent.trim(),
      domain,
      author,
      commentId,
      permalink,
      snippet,
    };

    all.push(linkData);

    if (!uniqueUrls.has(url)) {
      unique.push(linkData);
      uniqueUrls.add(url);
    }

    (grouped[domain] ||= []).push(linkData);
  });

  return { all, unique, grouped };
}
