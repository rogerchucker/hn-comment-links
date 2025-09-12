// background.js (MV3 service worker)

function isHNItem(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'news.ycombinator.com' && u.pathname === '/item';
  } catch (_) {
    return false;
  }
}

function setIconColored(tabId, colored) {
  const prefix = colored ? 'icons/icon-color-' : 'icons/icon-gray-';
  chrome.action.setIcon({
    tabId,
    path: {
    //   16: prefix + '16.png',
    //   32: prefix + '32.png',
      48: prefix + '48.png',
      128: prefix + '128.png'
    }
  });
}

function clearBadge(tabId) {
  chrome.action.setBadgeText({ tabId, text: '' });
}

async function updateForTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url) return;
    if (isHNItem(tab.url)) {
      setIconColored(tabId, true);
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#ff6600' });
      chrome.tabs.sendMessage(tabId, { type: 'collect_links' }, (resp) => {
        const count = resp && resp.unique ? resp.unique.length : 0;
        chrome.action.setBadgeText({ tabId, text: count ? String(count) : '' });
      });
    } else {
      setIconColored(tabId, false);
      clearBadge(tabId);
    }
  } catch (_) {
    // ignore
  }
}

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'complete' || info.url) {
    updateForTab(tabId);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateForTab(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === 'link_count' && sender.tab && sender.tab.id) {
    chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#ff6600' });
    chrome.action.setBadgeText({ tabId: sender.tab.id, text: msg.count ? String(msg.count) : '' });
    setIconColored(sender.tab.id, true);
  }
});