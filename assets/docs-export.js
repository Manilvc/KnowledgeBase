/**
 * EveryCRED Knowledge Base — export downloads (MD / JSON / Word / ZIP).
 * Requires: PAGES, NAV, renderMarkdown, resolveEnvTokens, getEnv, getEnvId, currentPage
 * ZIP requires JSZip (loaded from CDN in index.html).
 */
(function () {
  'use strict';

  const ARCH_DIAGRAM_EXPORT_NOTE =
    '> **Interactive diagram:** See `assets/platform-architecture-diagram.html` in the docs bundle (or open Platform Architecture in the web docs).';

  const ARCH_DIAGRAM_ZIP_NOTE =
    '> **Interactive diagram:** Open `../assets/platform-architecture-diagram.html` in your browser (included in this ZIP under `assets/`).';

  /** Static assets always included in ZIP bundles when fetch succeeds. */
  const BUNDLE_ASSETS = [
    'assets/platform-architecture-diagram.html',
    'assets/everycred_logo.svg',
    'assets/favicon.ico',
    'assets/complete-issuance-flow.png',
    'assets/selective-disclosure-credential-flow.png',
    'assets/anchoring-process-diagram.png',
    'assets/contributor-submission-flow.png',
    'assets/contributor-submission.png',
    'assets/trustless-verification-flow.png',
    'assets/holder-initialted-approval.png',
    'assets/Issuer-driven-workflow-request.png',
    'assets/status-transition-reference.png',
    'assets/credential-lifecycle.png',
    'assets/three-roles.png',
    'assets/system-architecture.png',
  ];

  function escapeHtmlExport(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slugifyExport(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page';
  }

  function getPageSection(id) {
    const group = NAV.find(function (g) {
      return g.items.some(function (item) { return item[0] === id; });
    });
    return group ? group.g : null;
  }

  function sectionSlug(section) {
    return slugifyExport(section || 'reference');
  }

  /** Sidebar section folder: "01 - Overview", "03 - Core Concepts", … */
  function formatSectionFolder(index, sectionName) {
    return String(index).padStart(2, '0') + ' - ' + sectionName;
  }

  /** File base from nav label (matches sidebar titles). */
  function exportFileName(id, navLabel) {
    const title = PAGES[id].title || navLabel || id;
    return String(title)
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || id;
  }

  /** Walk NAV in sidebar order — same structure as the docs menu. */
  function iterNavPages() {
    const list = [];
    NAV.forEach(function (group, idx) {
      const sectionFolder = formatSectionFolder(idx + 1, group.g);
      group.items.forEach(function (item) {
        const id = item[0];
        const navLabel = item[1];
        if (!PAGES[id]) return;
        list.push({
          id: id,
          navLabel: navLabel,
          section: group.g,
          sectionFolder: sectionFolder,
          fileName: exportFileName(id, navLabel),
        });
      });
    });
    return list;
  }

  function prepareBodyForExport(body, opts) {
    opts = opts || {};
    let text = resolveEnvTokens(String(body).trim());
    const diagramNote = opts.forZip ? ARCH_DIAGRAM_ZIP_NOTE : ARCH_DIAGRAM_EXPORT_NOTE;
    text = text.replace(/\{\{ARCHITECTURE_DIAGRAM\}\}/g, diagramNote);
    if (opts.forZip) {
      text = rewriteAssetPathsForZip(text);
    }
    return text;
  }

  /** Fix image/link paths for files under {section}/{title}.md */
  function rewriteAssetPathsForZip(md) {
    return md
      .replace(/\]\(assets\//g, '](../assets/')
      .replace(/!\[([^\]]*)\]\(assets\//g, '![$1](../assets/');
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    downloadBlob(filename, blob);
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function setExportBusy(busy) {
    const btn = document.getElementById('download-btn');
    if (btn) {
      btn.classList.toggle('is-busy', busy);
      btn.textContent = busy ? 'Preparing…' : '';
      if (!busy) {
        btn.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Download';
      }
    }
    document.querySelectorAll('#download-menu [data-export]').forEach(function (el) {
      el.disabled = !!busy;
    });
  }

  function buildPageMarkdown(id, opts) {
    const page = PAGES[id];
    if (!page) return '';
    const section = getPageSection(id);
    let md = '# ' + page.title + '\n\n';
    md += '> **Page ID:** `' + id + '`  \n';
    if (page.badge) md += '> **Category:** ' + page.badge + '  \n';
    if (section) md += '> **Section:** ' + section + '  \n';
    md += '\n';
    md += prepareBodyForExport(page.body, opts);
    return md;
  }

  function buildPageJson(id) {
    const page = PAGES[id];
    const env = getEnv();
    return {
      id: id,
      title: page.title,
      badge: page.badge || null,
      section: getPageSection(id),
      body: prepareBodyForExport(page.body, { forZip: true }),
      bodyFormat: 'markdown',
      exportedAt: new Date().toISOString(),
      environment: getEnvId(),
      apiBase: env.apiBase,
      apiDocs: env.apiDocs,
    };
  }

  function buildWordDocumentHtml(title, bodyHtml, metaLine) {
    const st = '<' + '/style>';
    const hd = '<' + '/head>';
    const bd = '<' + '/body>';
    const hm = '<' + '/html>';
    return [
      '<!DOCTYPE html>',
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">',
      '<head>',
      '<meta charset="utf-8">',
      '<title>' + escapeHtmlExport(title) + '</title>',
      '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->',
      '<style>',
      'body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.55; color: #1e293b; }',
      'h1 { font-size: 22pt; color: #0f172a; margin-bottom: 12pt; }',
      'h2 { font-size: 14pt; margin-top: 20pt; padding-bottom: 4pt; border-bottom: 1px solid #cbd5e1; }',
      'h3 { font-size: 12pt; color: #4338ca; margin-top: 14pt; }',
      'h4 { font-size: 11pt; color: #475569; }',
      'p, li { margin: 0 0 8pt; }',
      'code { font-family: Consolas, monospace; font-size: 9.5pt; background: #f1f5f9; padding: 1px 4px; }',
      'pre { font-family: Consolas, monospace; font-size: 9pt; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10pt; white-space: pre-wrap; }',
      'table { border-collapse: collapse; width: 100%; margin: 12pt 0; }',
      'th, td { border: 1px solid #cbd5e1; padding: 6pt 10pt; vertical-align: top; }',
      'th { background: #f1f5f9; font-weight: 600; }',
      'blockquote { border-left: 3px solid #6366f1; margin: 12pt 0; padding-left: 12pt; color: #475569; }',
      '.page-break { page-break-before: always; }',
      '.footer-meta { margin-top: 24pt; font-size: 9pt; color: #64748b; }',
      st,
      hd,
      '<body>',
      '<h1>' + escapeHtmlExport(title) + '</h1>',
      bodyHtml,
      '<p class="footer-meta">' + escapeHtmlExport(metaLine) + '</p>',
      bd,
      hm,
    ].join('\n');
  }

  function buildPageDocContent(id) {
    const page = PAGES[id];
    if (!page) return '';
    const htmlBody = renderMarkdown(prepareBodyForExport(page.body, { forZip: true }));
    return buildWordDocumentHtml(
      page.title,
      htmlBody,
      'EveryCRED Knowledge Base · ' + new Date().toISOString().slice(0, 10) + ' · Environment: ' + getEnv().label
    );
  }

  function iterAllPageIds() {
    const ids = [];
    NAV.forEach(function (group) {
      group.items.forEach(function (item) {
        const id = item[0];
        if (PAGES[id] && ids.indexOf(id) === -1) ids.push(id);
      });
    });
    return ids;
  }

  function buildFullManifest() {
    const env = getEnv();
    return {
      title: 'EveryCRED Knowledge Base',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      environment: getEnvId(),
      apiBase: env.apiBase,
      apiDocs: env.apiDocs,
      pageCount: iterAllPageIds().length,
      navigation: NAV.map(function (g, idx) {
        return {
          section: g.g,
          icon: g.icon,
          folder: formatSectionFolder(idx + 1, g.g),
          pages: g.items.map(function (item) {
            const id = item[0];
            return {
              id: id,
              title: item[1],
              fileBase: exportFileName(id, item[1]),
              path: formatSectionFolder(idx + 1, g.g) + '/',
            };
          }),
        };
      }),
      pages: iterNavPages().map(function (meta) {
        return {
          id: meta.id,
          title: PAGES[meta.id].title,
          navLabel: meta.navLabel,
          section: meta.section,
          folder: meta.sectionFolder,
          files: {
            markdown: meta.sectionFolder + '/' + meta.fileName + '.md',
            json: meta.sectionFolder + '/' + meta.fileName + '.json',
            word: meta.sectionFolder + '/' + meta.fileName + '.doc',
          },
        };
      }),
    };
  }

  function buildFullMarkdownString() {
    const env = getEnv();
    const parts = [
      '---',
      'title: EveryCRED Knowledge Base',
      'exported: ' + new Date().toISOString(),
      'environment: ' + getEnvId(),
      'api_base: ' + env.apiBase,
      '---',
      '',
      '# EveryCRED Knowledge Base',
      '',
      'Full export of the EveryCRED documentation site.',
      '',
    ];
    iterAllPageIds().forEach(function (id, i) {
      if (i > 0) parts.push('\n\n---\n\n');
      parts.push(buildPageMarkdown(id));
    });
    return parts.join('');
  }

  function buildSectionReadme(group) {
    const lines = [
      '# ' + group.g,
      '',
      'Pages in this section (same order as the docs sidebar):',
      '',
      '| # | Page | Files |',
      '|---:|------|-------|',
    ];
    group.items.forEach(function (item, i) {
      const id = item[0];
      if (!PAGES[id]) return;
      const fn = exportFileName(id, item[1]);
      lines.push('| ' + (i + 1) + ' | ' + item[1] + ' | `' + fn + '.md` · `.json` · `.doc` |');
    });
    return lines.join('\n');
  }

  function buildZipReadme(mode) {
    const env = getEnv();
    const lines = [
      '# EveryCRED Knowledge Base — Export',
      '',
      '- **Exported:** ' + new Date().toISOString(),
      '- **Environment:** ' + env.label + ' (`' + env.apiBase + '`)',
      '- **Pages:** ' + iterAllPageIds().length,
      '- **Export mode:** ' + mode,
      '',
      '## Folder structure',
      '',
      '```',
      'everycred-knowledge-base/',
      '  README.md',
      '  manifest.json',
      '  combined/',
      '    everycred-knowledge-base.md',
      '    everycred-knowledge-base.json',
      '    everycred-knowledge-base.doc',
      '  assets/',
      '    platform-architecture-diagram.html',
      '    …',
      '  01 - Overview/',
      '    Introduction.md',
      '    Introduction.json',
      '    Introduction.doc',
      '    Platform Architecture.md',
      '    …',
      '  02 - Deployment/',
      '  03 - Core Concepts/',
      '  04 - Platform/',
      '  05 - Workflow Engine/',
      '  06 - API Reference/',
      '  07 - Guides/',
      '  08 - Roadmap/',
      '  09 - Reference/',
      '```',
      '',
      'Folders match the **sidebar navigation** (section order and page titles).',
      '',
      '## Platform Architecture',
      '',
      'Open `assets/platform-architecture-diagram.html` in a browser for the full interactive system map.',
      '',
      '## Viewing Markdown',
      '',
      'Image paths in section `*.md` files use `../assets/` so diagrams resolve when opened from any section folder.',
      '',
    ];
    return lines.join('\n');
  }

  function collectReferencedAssets(set) {
    const re = /!\[[^\]]*\]\((assets\/[^)]+)\)/g;
    iterAllPageIds().forEach(function (id) {
      let m;
      const body = String(PAGES[id].body || '');
      while ((m = re.exec(body)) !== null) {
        set.add(m[1]);
      }
    });
  }

  function exportZipFilename() {
    return 'everycred-knowledge-base-' + getEnvId() + '-' + new Date().toISOString().slice(0, 10) + '.zip';
  }

  async function fetchAssetBlob(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.blob();
  }

  async function addAssetsToZip(assetsFolder, report) {
    const paths = new Set(BUNDLE_ASSETS);
    collectReferencedAssets(paths);
    for (const path of paths) {
      try {
        const blob = await fetchAssetBlob(path);
        const name = path.replace(/^assets\//, '');
        assetsFolder.file(name, blob);
        report.assetsOk.push(name);
      } catch (e) {
        report.assetsFailed.push(path);
      }
    }
  }

  /**
   * @param {'complete'|'md-only'|'json-only'} mode
   */
  async function exportFullZip(mode) {
    if (typeof JSZip === 'undefined') {
      alert('ZIP library (JSZip) is not loaded. Serve the site over HTTP and refresh the page.');
      return;
    }

    setExportBusy(true);
    const report = { assetsOk: [], assetsFailed: [] };

    try {
      const zip = new JSZip();
      const rootName = 'everycred-knowledge-base';
      const root = zip.folder(rootName);
      const env = getEnv();

      root.file('README.md', buildZipReadme(mode));
      root.file('manifest.json', JSON.stringify(buildFullManifest(), null, 2));

      const combined = root.folder('combined');

      if (mode !== 'json-only') {
        combined.file('everycred-knowledge-base.md', buildFullMarkdownString());
      }

      if (mode !== 'md-only') {
        const payload = {
          meta: buildFullManifest(),
          pages: iterAllPageIds().map(function (id) { return buildPageJson(id); }),
        };
        combined.file('everycred-knowledge-base.json', JSON.stringify(payload, null, 2));
      }

      if (mode === 'complete') {
        const docParts = [
          '<p>EveryCRED Knowledge Base — full export.</p>',
          '<p><strong>Environment:</strong> ' + escapeHtmlExport(env.label) + ' (' + escapeHtmlExport(env.apiBase) + ')</p>',
        ];
        iterAllPageIds().forEach(function (id, i) {
          const page = PAGES[id];
          const section = getPageSection(id);
          if (i > 0) docParts.push('<div class="page-break"></div>');
          docParts.push('<h2>' + escapeHtmlExport(page.title) + '</h2>');
          if (section || page.badge) {
            docParts.push(
              '<p style="font-size:9pt;color:#64748b">' +
                escapeHtmlExport([section, page.badge].filter(Boolean).join(' · ')) +
                '</p>'
            );
          }
          docParts.push(renderMarkdown(prepareBodyForExport(page.body, { forZip: true })));
        });
        const combinedDoc = buildWordDocumentHtml(
          'EveryCRED Knowledge Base',
          docParts.join('\n'),
          'Exported ' + new Date().toISOString().slice(0, 10)
        );
        combined.file('everycred-knowledge-base.doc', combinedDoc);
      }

      NAV.forEach(function (group, idx) {
        root.folder(formatSectionFolder(idx + 1, group.g)).file('README.md', buildSectionReadme(group));
      });

      const usedNames = {};
      iterNavPages().forEach(function (meta) {
        const sectionFolder = root.folder(meta.sectionFolder);
        let fileName = meta.fileName;
        const key = meta.sectionFolder + '/' + fileName.toLowerCase();
        if (usedNames[key]) {
          fileName = fileName + ' (' + meta.id + ')';
        }
        usedNames[key] = true;

        if (mode !== 'json-only') {
          sectionFolder.file(fileName + '.md', buildPageMarkdown(meta.id, { forZip: true }));
        }
        if (mode !== 'md-only') {
          sectionFolder.file(fileName + '.json', JSON.stringify(buildPageJson(meta.id), null, 2));
        }
        if (mode === 'complete') {
          sectionFolder.file(fileName + '.doc', buildPageDocContent(meta.id));
        }
      });

      if (mode !== 'json-only') {
        await addAssetsToZip(root.folder('assets'), report);
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      downloadBlob(exportZipFilename(), blob);

      if (report.assetsFailed.length > 0) {
        console.warn('Some assets could not be fetched (serve over HTTP):', report.assetsFailed);
      }
    } catch (err) {
      console.error(err);
      alert('ZIP export failed: ' + (err.message || String(err)) + '\n\nTip: open the docs via a local server (npx serve .), not file://');
    } finally {
      setExportBusy(false);
    }
  }

  function exportPageMarkdown(id) {
    const page = PAGES[id];
    if (!page) return;
    downloadFile(slugifyExport(page.title) + '.md', buildPageMarkdown(id), 'text/markdown');
  }

  function exportPageJson(id) {
    const page = PAGES[id];
    if (!page) return;
    downloadFile(
      slugifyExport(page.title) + '.json',
      JSON.stringify(buildPageJson(id), null, 2),
      'application/json'
    );
  }

  function exportPageDoc(id) {
    const page = PAGES[id];
    if (!page) return;
    downloadFile(slugifyExport(page.title) + '.doc', buildPageDocContent(id), 'application/msword');
  }

  function exportFullMarkdown() {
    downloadFile('everycred-knowledge-base.md', buildFullMarkdownString(), 'text/markdown');
  }

  function exportFullJson() {
    const payload = {
      meta: buildFullManifest(),
      pages: iterAllPageIds().map(function (id) { return buildPageJson(id); }),
    };
    downloadFile('everycred-knowledge-base.json', JSON.stringify(payload, null, 2), 'application/json');
  }

  function exportFullDoc() {
    const env = getEnv();
    const chunks = [
      '<p>This document contains the full EveryCRED Knowledge Base export.</p>',
      '<p><strong>Environment:</strong> ' + escapeHtmlExport(env.label) + ' (' + escapeHtmlExport(env.apiBase) + ')</p>',
    ];
    iterAllPageIds().forEach(function (id, i) {
      const page = PAGES[id];
      const section = getPageSection(id);
      if (i > 0) chunks.push('<div class="page-break"></div>');
      chunks.push('<h2>' + escapeHtmlExport(page.title) + '</h2>');
      if (section || page.badge) {
        chunks.push(
          '<p style="font-size:9pt;color:#64748b">' +
            escapeHtmlExport([section, page.badge].filter(Boolean).join(' · ')) +
            '</p>'
        );
      }
      chunks.push(renderMarkdown(prepareBodyForExport(page.body)));
    });
    const doc = buildWordDocumentHtml(
      'EveryCRED Knowledge Base',
      chunks.join('\n'),
      'Exported ' + new Date().toISOString().slice(0, 10) + ' · EveryCRED Documentation'
    );
    downloadFile('everycred-knowledge-base.doc', doc, 'application/msword');
  }

  function runExport(action) {
    const zipActions = {
      'full-zip': function () { return exportFullZip('complete'); },
      'full-zip-md': function () { return exportFullZip('md-only'); },
      'full-zip-json': function () { return exportFullZip('json-only'); },
    };
    if (zipActions[action]) {
      zipActions[action]();
      return;
    }

    const map = {
      'page-md': function () { exportPageMarkdown(currentPage); },
      'page-json': function () { exportPageJson(currentPage); },
      'page-doc': function () { exportPageDoc(currentPage); },
      'full-md': exportFullMarkdown,
      'full-json': exportFullJson,
      'full-doc': exportFullDoc,
    };
    const fn = map[action];
    if (fn) fn();
  }

  function initDownloadMenu() {
    const btn = document.getElementById('download-btn');
    const menu = document.getElementById('download-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function () {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });

    menu.querySelectorAll('[data-export]').forEach(function (el) {
      el.addEventListener('click', function () {
        runExport(el.getAttribute('data-export'));
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  window.initDownloadMenu = initDownloadMenu;
  window.runExport = runExport;
})();
