/*
 * Draws the hero timeline from impact.csv.
 *
 * Dogs helped    = unique case ids. An empty case cell belongs to the case above it.
 * Grants paid out = unique dates. Several rows on one date are one occasion.
 */

// ponytail: split(',') is enough while the CSV holds dates and case ids.
// Swap in a real CSV parser if a free-text column is ever exported alongside them.
function parseImpact(csv) {
    const rows = csv.trim().split(/\r?\n/);
    const cell = (row, i) => (row[i] || '').trim().replace(/^"|"$/g, '');

    // Find the columns by header name, so column order and extra columns don't matter.
    const header = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const colDate = header.findIndex(h => h === 'date' || h === 'datum');
    const colCase = header.findIndex(h => h === 'case' || h === 'ärende-id' || h === 'arende-id');
    if (colDate === -1 || colCase === -1) throw new Error('impact.csv needs a "date" and a "case" column');

    const dogs = new Map();   // case id -> first date
    const grants = new Set();
    let id = '';

    rows.slice(1).forEach(line => {
        const row = line.split(',');
        const date = cell(row, colDate);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;   // blank or malformed row

        if (cell(row, colCase)) id = cell(row, colCase);
        if (id && !dogs.has(id)) dogs.set(id, date);
        grants.add(date);
    });

    return { dogs: [...dogs.values()].sort(), grants: [...grants].sort() };
}

if (typeof window !== 'undefined') {
    let impactData = null;

    function renderTimeline() {
        const el = document.getElementById('timeline');
        if (!el || !impactData) return;
        const all = impactData.dogs.concat(impactData.grants);
        if (!all.length) return;
        const lang = document.documentElement.lang || 'sv';
        const t = translations[lang] || translations.sv;
        const months = 12;
        // Month number since year 0, so slots are simple subtraction.
        const idx = date => {
            const [y, mo] = date.slice(0, 7).split('-').map(Number);
            return y * 12 + (mo - 1);
        };
        const first = Math.min(...all.map(idx));
        const slot = date => Math.min(Math.max(idx(date) - first, 0), months - 1);
        const fmt = new Intl.DateTimeFormat(lang, { month: 'short' });
        const labels = Array.from({ length: months }, (_, i) => {
            const y = Math.floor((first + i) / 12), m = (first + i) % 12;
            const month = fmt.format(new Date(y, m, 1));
            // Year only where it changes: the first slot and every January.
            return (i === 0 || m === 0) ? `${month}<small>${y}</small>` : month;
        });

        const lane = (dates, key) => {
            const seen = {};
            const dots = dates.map(date => {
                const s = slot(date);
                seen[s] = (seen[s] || 0) + 1;
                // Nudge repeats within one month apart so they stay countable.
                const nudge = (seen[s] - 1) * 9;
                return `<span class="tl-dot" style="left:calc(${(s + 0.5) / months * 100}% + ${nudge}px)"></span>`;
            }).join('');
            const fill = (Math.max(...dates.map(slot), 0) + 0.5) / months * 100;
            return `<div class="tl-lane">
                    <span class="tl-label">${t[key]}</span>
                    <span class="tl-count">${dates.length}</span>
                </div>
                <div class="tl-track"><span class="tl-fill" style="width:${fill}%"></span>${dots}</div>`;
        };

        el.innerHTML = lane(impactData.dogs, 'impact-dogs') + lane(impactData.grants, 'impact-grants') +
            `<div class="tl-months">${labels.map(m => `<span>${m}</span>`).join('')}</div>`;

        document.getElementById('timeline-summary').textContent =
            `${t['impact-dogs']}: ${impactData.dogs.length}. ` +
            `${t['impact-grants']}: ${impactData.grants.length}.`;

        requestAnimationFrame(() => el.classList.add('visible'));
    }

    window.renderTimeline = renderTimeline;

    // The timeline is supplementary: if the CSV can't be read (offline, or the page
    // opened over file://), leave it out rather than showing an empty strip.
    fetch('impact.csv')
        .then(res => {
            if (!res.ok) throw new Error(`impact.csv: ${res.status}`);
            return res.text();
        })
        .then(csv => {
            impactData = parseImpact(csv);
            renderTimeline();
        })
        .catch(err => console.warn('Timeline not shown:', err.message));
}

if (typeof module !== 'undefined') module.exports = { parseImpact };
