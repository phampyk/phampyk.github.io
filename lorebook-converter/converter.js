const opts = { matchWholeWords: true, preserveDisabled: true, autoSelective: true, useProbability: true };
let convertedData = null;

document.querySelectorAll('.option').forEach(el => {
  el.addEventListener('click', () => {
    const key = el.dataset.opt;
    opts[key] = !opts[key];
    el.classList.toggle('active', opts[key]);
  });
});

const pasteArea = document.getElementById('pasteArea');
const entryCountSpan = document.querySelector('#entryCount span');
const convertBtn = document.getElementById('convertBtn');

pasteArea.addEventListener('input', () => {
  const val = pasteArea.value.trim();
  if (!val) { setCount(0, false); convertBtn.disabled = true; return; }
  try {
    const data = JSON.parse(val);
    if (Array.isArray(data)) {
      setCount(data.length, true);
      convertBtn.disabled = data.length === 0;
    } else {
      setCount(0, false);
      convertBtn.disabled = true;
    }
  } catch {
    setCount(0, false);
    convertBtn.disabled = true;
  }
});

function setCount(n, valid) {
  entryCountSpan.textContent = n;
  entryCountSpan.style.color = valid ? 'var(--success)' : 'var(--error)';
}

document.getElementById('clearBtn').addEventListener('click', () => {
  pasteArea.value = '';
  setCount(0, false);
  convertBtn.disabled = true;
  document.getElementById('log').classList.remove('visible');
  document.getElementById('downloadBtn').classList.remove('visible');
  convertedData = null;
});

convertBtn.addEventListener('click', () => {
  let entries;
  try {
    entries = JSON.parse(pasteArea.value.trim());
    if (!Array.isArray(entries)) throw new Error();
  } catch {
    showLog([{ type: 'err', icon: '✗', msg: 'Invalid JSON — please check your input.' }]);
    return;
  }

  const lorebook = { entries: {} };
  let skipped = 0, uid = 0;

  entries.forEach((entry, i) => {
    if (!opts.preserveDisabled && entry.enabled === false) { skipped++; return; }
    const hasSecondary = Array.isArray(entry.keysecondary) && entry.keysecondary.length > 0;
    lorebook.entries[String(uid)] = {
      uid,
      key: entry.key || [],
      keysecondary: entry.keysecondary || [],
      comment: entry.name || entry.comment || '',
      content: entry.content || '',
      constant: entry.constant || false,
      selective: opts.autoSelective ? hasSecondary : false,
      selectiveLogic: entry.selectiveLogic || 0,
      addMemo: true,
      order: entry.insertion_order || i * 100,
      position: 0,
      disable: !(entry.enabled !== false),
      excludeRecursion: false,
      probability: entry.probability ?? 100,
      useProbability: opts.useProbability,
      depth: 4,
      group: '',
      groupOverride: false,
      groupWeight: entry.groupWeight || 100,
      scanDepth: null,
      caseSensitive: entry.case_sensitive || false,
      matchWholeWords: opts.matchWholeWords ? (entry.matchWholeWords ?? null) : null,
      useGroupScoring: false,
      automationId: '',
      role: null,
      vectorized: false,
      displayIndex: uid
    };
    uid++;
  });

  const total = Object.keys(lorebook.entries).length;
  const logs = [{ type: 'info', icon: '◆', msg: `Processing ${entries.length} entries...` }];
  if (skipped > 0) logs.push({ type: 'info', icon: '○', msg: `Skipped ${skipped} disabled entries.` });
  logs.push({ type: 'ok', icon: '✓', msg: `Converted ${total} entries successfully.` });

  convertedData = JSON.stringify(lorebook, null, 2);
  showLog(logs);
  document.getElementById('downloadBtn').classList.add('visible');
  triggerDownload();
});

document.getElementById('downloadBtn').addEventListener('click', triggerDownload);

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function triggerDownload() {
  if (!convertedData) return;
  const name = (document.getElementById('filenameInput').value.trim() || 'lorebook_sillytavern') + '.json';

  if (isIOS()) {
    // iOS Safari doesn't support blob downloads — open in new tab so user can use Share → Save to Files
    const blob = new Blob([convertedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    showLog([
      { type: 'ok', icon: '✓', msg: 'Opened in new tab.' },
      { type: 'info', icon: '◆', msg: 'Tap Share → Save to Files to save the JSON.' }
    ]);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return;
  }

  const blob = new Blob([convertedData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showLog(lines) {
  const log = document.getElementById('log');
  log.innerHTML = lines.map(l =>
    `<div class="log-line ${l.type}"><span class="log-icon">${l.icon}</span><span class="log-msg">${l.msg}</span></div>`
  ).join('');
  log.classList.add('visible');
}
