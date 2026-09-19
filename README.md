# Alfons minnesfond

The website for [alfonsminnesfond.se](https://alfonsminnesfond.se) — a static page
(`index.html`) published with GitHub Pages.

## Getting started

Tooling is handled by [mise](https://mise.jdx.dev). If you don't have it:

```bash
curl https://mise.run | sh
```

Then, in the repo:

```bash
mise install
```

## Updating the timeline

The timeline in the hero is drawn from `impact.csv`, which the page loads on startup.

When we have helped another dog:

1. Export the sheet as CSV.
2. Keep only the `date` and `case` columns — this is the anonymisation step, no names or
   amounts belong in this file.
3. Save it over `impact.csv`.
4. `mise run test` — confirms the file parses and prints the counts.
5. Commit and push. The site updates within a minute.

How the numbers are counted:

| Number | Rule |
| --- | --- |
| Dogs helped | Unique case ids. An empty case cell belongs to the case on the row above. |
| Grants paid out | Unique dates. Several rows on the same date count as one occasion. |

The axis shows twelve months starting from the earliest date in the file, with the year
printed under the first month and under every January.

Column order doesn't matter and extra columns are ignored — the headers are what's looked up
(`date`/`datum` and `case`/`ärende-id`).

## Running the site locally

```bash
mise run serve
```

Then open http://localhost:8765.

Opening `index.html` straight from the file system won't work for the timeline: browsers block
the `impact.csv` fetch over `file://`, so the timeline is left out and everything else renders.

## Other scripts

`generate_favicons.js` and `remove_background.js` are one-off image tools, run with `node`
directly. They need `npm install` first.
