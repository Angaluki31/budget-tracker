const CATS = ['Food','Transport','Rent','Bills','Airtime & Data','Health','Education','Fun','Savings','Other'];
const GUIDE = {Rent:.20,Food:.15,Transport:.05,Bills:.05,'Airtime & Data':.03,Health:.02,Education:0,Fun:.15,Other:.15,Savings:.20};
const KEY = 'pocketplan-v1';
const $ = id => document.getElementById(id);
const sum = a => a.reduce((s, t) => s + t.amount, 0);
const today = () => new Date().toISOString().slice(0, 10);

let S = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return d; } catch (e) {}
  return { currency: 'KSh', limits: {}, tx: [], goal: { name: '', target: 0 } };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const fmt = n => S.currency + ' ' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

function render() {
  const m = $('month').value;
  const tx = S.tx.filter(t => t.date.slice(0, 7) === m);
  const inc = sum(tx.filter(t => t.type === 'income'));
  const exp = sum(tx.filter(t => t.type === 'expense'));
  $('income').textContent = fmt(inc);
  $('spent').textContent = fmt(exp);
  $('balance').textContent = fmt(inc - exp);
  $('balance').className = inc - exp < 0 ? 'neg' : '';

  const box = $('limits'); box.innerHTML = '';
  CATS.forEach(c => {
    const spent = sum(tx.filter(t => t.type === 'expense' && t.cat === c));
    const lim = S.limits[c] || 0;
    const pct = lim ? Math.min(100, spent / lim * 100) : 0;
    const row = document.createElement('div');
    row.className = 'row' + (lim && spent > lim ? ' over' : lim && spent >= lim * .8 ? ' warn' : '');
    row.innerHTML = `<label>${c}</label><input type="number" min="0" data-c="${c}" placeholder="Limit" value="${lim || ''}"><div class="bar"><i style="width:${pct}%"></i></div><small>${fmt(spent)}${lim ? ' of ' + fmt(lim) + (spent > lim ? ' – over by ' + fmt(spent - lim) : '') : ' spent'}</small>`;
    box.append(row);
  });

  const saved = sum(S.tx.filter(t => t.type === 'expense' && t.cat === 'Savings'));
  const tg = S.goal.target || 0;
  $('goalBar').style.width = (tg ? Math.min(100, saved / tg * 100) : 0) + '%';
  $('goalText').textContent = tg ? `${fmt(saved)} saved of ${fmt(tg)}${S.goal.name ? ' for ' + S.goal.name : ''}` : 'Set a target, then add transactions in the Savings category.';

  const ul = $('history'); ul.innerHTML = '';
  [...tx].sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
    const li = document.createElement('li');
    const d = document.createElement('small'); d.className = 'd'; d.textContent = t.date;
    const n = document.createElement('span'); n.textContent = t.note || (t.type === 'income' ? 'Income' : t.cat);
    if (t.note && t.type === 'expense') { const s = document.createElement('small'); s.textContent = ' · ' + t.cat; n.append(s); }
    const a = document.createElement('span'); a.className = 'amt' + (t.type === 'income' ? ' in' : '');
    a.textContent = (t.type === 'income' ? '+' : '-') + fmt(t.amount);
    const x = document.createElement('button'); x.className = 'del'; x.textContent = '×'; x.title = 'Delete'; x.setAttribute('aria-label', 'Delete transaction');
    x.onclick = () => { S.tx = S.tx.filter(z => z.id !== t.id); save(); render(); };
    li.append(d, n, a, x); ul.append(li);
  });
  $('empty').style.display = tx.length ? 'none' : 'block';
}

// setup
$('cat').innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
$('month').value = today().slice(0, 7);
$('date').value = today();
$('currency').value = S.currency;
$('goalName').value = S.goal.name || '';
$('goalTarget').value = S.goal.target || '';

$('type').onchange = e => { $('cat').style.display = e.target.value === 'income' ? 'none' : ''; };
$('month').onchange = render;
$('currency').onchange = e => { S.currency = e.target.value; save(); render(); };

$('txForm').onsubmit = e => {
  e.preventDefault();
  const amount = parseFloat($('amount').value);
  if (!(amount > 0)) return;
  S.tx.push({ id: Date.now(), type: $('type').value, amount, cat: $('cat').value, note: $('note').value.trim(), date: $('date').value });
  save();
  $('month').value = $('date').value.slice(0, 7);
  $('amount').value = ''; $('note').value = '';
  render();
};

$('limits').onchange = e => {
  if (!e.target.dataset.c) return;
  S.limits[e.target.dataset.c] = Math.max(0, parseFloat(e.target.value) || 0);
  save(); render();
};

$('suggest').onclick = () => {
  const m = $('month').value;
  const inc = sum(S.tx.filter(t => t.type === 'income' && t.date.slice(0, 7) === m));
  if (!inc) return alert('Add your income for this month first, then try again.');
  CATS.forEach(c => S.limits[c] = Math.round(inc * (GUIDE[c] || 0)));
  save(); render();
};

$('goalName').onchange = e => { S.goal.name = e.target.value.trim(); save(); render(); };
$('goalTarget').onchange = e => { S.goal.target = Math.max(0, parseFloat(e.target.value) || 0); save(); render(); };

$('export').onclick = () => {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [['Date', 'Type', 'Category', 'Note', 'Amount'], ...S.tx.map(t => [t.date, t.type, t.cat, t.note, t.amount])];
  const url = URL.createObjectURL(new Blob([rows.map(r => r.map(q).join(',')).join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a'); a.href = url; a.download = 'pocketplan-transactions.csv'; a.click();
  URL.revokeObjectURL(url);
};

$('reset').onclick = () => {
  if (confirm('Delete all transactions, limits and goals? This cannot be undone.')) {
    S = { currency: S.currency, limits: {}, tx: [], goal: { name: '', target: 0 } };
    save(); $('goalName').value = ''; $('goalTarget').value = ''; render();
  }
};

render();