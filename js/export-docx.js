/* 결과물 문서: 입력값 → 모델 → (미리보기 HTML | Word .docx) */
(function () {
  var W = window.Worksheet, ST = window.Store, acts = W.acts;
  function get(id) { var f = W.computed[id]; return f ? f(get) : ST.get(id); }

  var CORE = 'AI를 썼는지 잡아내는 평가보다, 평가 목적에 따라 AI의 허용·제한·금지 범위를 정하고 학생의 판단·검토·수정 과정을 증거로 확인하는 평가를 설계합니다.';
  var OUTPUTS = [
    ['1차시', '내 교과의 평가 문제와 AI 활용 경계를 찾습니다.', '평가 고민 · 핵심 질문 · 허용/제한/금지 초안'],
    ['2차시', '생성형 AI와 함께 기존 수행평가를 현실적으로 재설계합니다.', '6칸 평가 설계안 · 평가계획서 반영 문구'],
    ['3차시', '실제 학생 증거에 루브릭을 적용하고 피드백·기록까지 연결합니다.', '루브릭 · 평가근거 · 피드백 · 기록 후보 · 실행계획']
  ];

  /* ---------- 모델 ---------- */
  function actItems(a) {
    var items = [], kv = null;
    a.blocks.forEach(function (b) {
      if (b.t === 'text') {
        if (!kv) { kv = { t: 'kv', rows: [] }; items.push(kv); }
        kv.rows.push([b.label.replace(/\s*\(선택\)$/, ''), get(b.id)]);
        return;
      }
      kv = null;
      if (b.t === 'mx') {
        var rows = b.rows.map(function (r) {
          var lab = r.labelFrom && get(r.labelFrom) ? get(r.labelFrom) : r.label;
          var cells;
          if (r.span) cells = [r.cells.map(function (c) { return get(c.id); }).filter(Boolean).join(' — ')];
          else cells = r.cells.map(function (c) { return get(c.id); });
          return [lab].concat(cells);
        });
        var head = b.head.slice();
        items.push({ t: 'table', head: head, rows: rows });
      } else if (b.t === 'checks') {
        items.push({ t: 'checks', title: b.title, items: b.items.map(function (i) { return { label: i.label, on: !!get(i.id), memo: i.memo ? get(i.memo) : '' }; }) });
      } else if (b.t === 'choice') {
        items.push({ t: 'kv', rows: [[b.label, get(b.id)]] });
      } else if (b.t === 'prompt') {
        var rows2 = [];
        (b.inputs || []).forEach(function (f) { rows2.push([f.label, get(f.id)]); });
        if (get(b.rid)) rows2.push(['AI 응답 (붙여넣기)', get(b.rid)]);
        rows2.push([b.flabel, get(b.fid)]);
        items.push({ t: 'kv', title: (b.n <= 7 ? 'PROMPT ' + b.n + ' · ' : '') + b.title, rows: rows2 });
      } else if (b.t === 'formula') {
        var rows3 = b.fields.map(function (f) { return [f.label, get(b.id + '.' + f.k)]; });
        rows3.push(['핵심 평가 질문', get(b.finalId)]);
        items.push({ t: 'kv', rows: rows3 });
      } else if (b.t === 'six') {
        items.push({ t: 'kv', rows: b.cells.map(function (c) { return [c.title, get(c.id)]; }) });
      }
    });
    return items;
  }
  function model() {
    return W.sessions.slice(1).map(function (s) {
      return {
        title: s.name,
        acts: W.order.filter(function (id) { return acts[id].ses === s.no; }).map(function (id) { return { title: acts[id].title, items: actItems(acts[id]) }; })
      };
    });
  }
  function dateStr() {
    if (window.CONFIG && CONFIG.date) return CONFIG.date;
    var d = new Date(); return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  }

  /* ---------- 미리보기 ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pv(text) { return '<div style="white-space:pre-wrap">' + esc(text) + '</div>'; }
  function previewHTML() {
    var p = ST.profile();
    var h = '<div class="info" style="border:1px solid var(--line);border-radius:10px;padding:14px 18px;background:#fff"><h3 style="color:var(--navy)">' + esc(CONFIG.title) + ' · 연수 결과물</h3><p class="muted small">성명: ' + esc(p.name) + ' · 소속: ' + esc(p.org) + ' · ' + esc(dateStr()) + '</p></div>';
    model().forEach(function (s) {
      h += '<h3 style="margin:18px 0 6px;color:var(--navy)">' + esc(s.title) + '</h3>';
      s.acts.forEach(function (a) {
        h += '<div style="margin:0 0 14px;border:1px solid var(--line);border-radius:10px;padding:10px 14px;background:#fff"><b style="color:var(--accent)">' + esc(a.title) + '</b>';
        a.items.forEach(function (it) {
          if (it.t === 'kv') {
            h += (it.title ? '<div class="lbl" style="margin-top:8px">' + esc(it.title) + '</div>' : '') + '<table class="mx" style="margin-top:6px"><tbody>' + it.rows.map(function (r) { return '<tr><td class="rl">' + esc(r[0]) + '</td><td>' + (r[1] ? pv(r[1]) : '<span class="muted">(미작성)</span>') + '</td></tr>'; }).join('') + '</tbody></table>';
          } else if (it.t === 'table') {
            h += '<div class="mx-scroll"><table class="mx" style="margin-top:6px"><thead><tr>' + it.head.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + it.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i === 0 ? ' class="rl"' : '') + '>' + (c ? pv(c) : '<span class="muted">-</span>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
          } else if (it.t === 'checks') {
            h += (it.title ? '<div class="lbl" style="margin-top:8px">' + esc(it.title) + '</div>' : '') + '<ul style="list-style:none;padding:0;margin:6px 0">' + it.items.map(function (c) { return '<li>' + (c.on ? '☑' : '☐') + ' ' + esc(c.label) + (c.memo ? ' <span class="muted">— ' + esc(c.memo) + '</span>' : '') + '</li>'; }).join('') + '</ul>';
          }
        });
        h += '</div>';
      });
    });
    return h;
  }

  /* ---------- Word ---------- */
  function buildDoc() {
    var D = window.docx, p = ST.profile();
    var FONT = { ascii: 'Malgun Gothic', hAnsi: 'Malgun Gothic', eastAsia: 'Malgun Gothic' };
    var NAVY = '1F2F63', SKY = 'E9EEFB', LINE = 'B8C2E0', WIDTH = 9638;
    var BORDER = { style: D.BorderStyle.SINGLE, size: 4, color: LINE };
    var BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER, insideHorizontal: BORDER, insideVertical: BORDER };

    function run(text, o) { return new D.TextRun(Object.assign({ text: text, font: FONT, size: 21 }, o || {})); }
    function paras(text, o) {
      var lines = String(text == null ? '' : text).split(/\r?\n/);
      return lines.map(function (ln) { return new D.Paragraph({ spacing: { after: 40, line: 300 }, children: [run(ln, o)] }); });
    }
    function cell(text, w, o) {
      o = o || {};
      return new D.TableCell({
        width: { size: w, type: D.WidthType.DXA },
        shading: o.fill ? { type: D.ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
        margins: { top: 70, bottom: 70, left: 110, right: 110 },
        children: paras(text, o.run)
      });
    }
    function table(colW, rowsArr) {
      return new D.Table({ width: { size: colW.reduce(function (a, b) { return a + b; }, 0), type: D.WidthType.DXA }, columnWidths: colW, borders: BORDERS, rows: rowsArr });
    }
    function tr(cells, o) { return new D.TableRow({ cantSplit: true, tableHeader: o && o.header, children: cells }); }
    function spacer() { return new D.Paragraph({ spacing: { after: 120 }, children: [] }); }
    function heading(text, level, o) {
      return new D.Paragraph(Object.assign({ heading: level, spacing: { before: level === D.HeadingLevel.HEADING_1 ? 0 : 280, after: 140 }, keepNext: true, children: [run(text, { bold: true, size: level === D.HeadingLevel.HEADING_1 ? 32 : 25, color: level === D.HeadingLevel.HEADING_1 ? NAVY : '3F4FA0' })] }, o || {}));
    }

    var body = [];
    /* 표지 */
    body.push(new D.Paragraph({ spacing: { before: 1400, after: 120 }, alignment: D.AlignmentType.CENTER, children: [run('연수 결과물', { size: 26, color: '5F79C4', bold: true })] }));
    body.push(new D.Paragraph({ spacing: { after: 120 }, alignment: D.AlignmentType.CENTER, children: [run(CONFIG.title, { size: 48, bold: true, color: NAVY })] }));
    body.push(new D.Paragraph({ spacing: { after: 600 }, alignment: D.AlignmentType.CENTER, children: [run(CONFIG.subtitle + ' · 참여자 활동 결과', { size: 24, color: '5D6885' })] }));
    body.push(table([2200, 7438], [
      tr([cell('성명', 2200, { fill: SKY, run: { bold: true } }), cell(p.name, 7438)]),
      tr([cell('소속', 2200, { fill: SKY, run: { bold: true } }), cell(p.org, 7438)]),
      tr([cell('연수 일자', 2200, { fill: SKY, run: { bold: true } }), cell(dateStr(), 7438)])
    ]));
    body.push(spacer());
    body.push(new D.Paragraph({ spacing: { before: 200, after: 100 }, children: [run('연수의 핵심', { bold: true, color: NAVY })] }));
    body.push(new D.Paragraph({ spacing: { after: 300, line: 320 }, children: [run(CORE, { color: '333B55' })] }));
    body.push(table([1200, 4300, 4138], [tr([cell('차시', 1200, { fill: NAVY, run: { bold: true, color: 'FFFFFF' } }), cell('무엇을 하나요?', 4300, { fill: NAVY, run: { bold: true, color: 'FFFFFF' } }), cell('가져갈 결과물', 4138, { fill: NAVY, run: { bold: true, color: 'FFFFFF' } })], { header: true })]
      .concat(OUTPUTS.map(function (o) { return tr([cell(o[0], 1200, { fill: SKY, run: { bold: true } }), cell(o[1], 4300), cell(o[2], 4138)]); }))));
    body.push(new D.Paragraph({ spacing: { before: 300 }, children: [run('※ 이 문서는 “완벽한 새 평가안”이 아니라, 기존 수행평가에서 꼭 바꿔야 할 지점을 찾고 학교에서 실제로 써볼 수 있는 수준까지 정리한 초안입니다. 생성형 AI가 만든 문구는 교사가 직접 검토·수정한 뒤 학교 평가계획과 규정에 맞게 사용하세요.', { size: 19, color: '5D6885' })] }));

    /* 본문 */
    model().forEach(function (s) {
      body.push(new D.Paragraph({ pageBreakBefore: true, heading: D.HeadingLevel.HEADING_1, spacing: { after: 140 }, children: [run(s.title, { bold: true, size: 32, color: NAVY })] }));
      s.acts.forEach(function (a) {
        body.push(heading(a.title, D.HeadingLevel.HEADING_2));
        a.items.forEach(function (it) {
          if (it.title) body.push(new D.Paragraph({ spacing: { before: 120, after: 80 }, keepNext: true, children: [run(it.title, { bold: true, color: NAVY })] }));
          if (it.t === 'kv') {
            body.push(table([2700, 6938], it.rows.map(function (r) { return tr([cell(r[0], 2700, { fill: SKY, run: { bold: true } }), cell(r[1], 6938)]); })));
          } else if (it.t === 'table') {
            var n = it.head.length, first = n === 2 ? 2700 : (n === 3 ? 2200 : 1900), rest = Math.floor((WIDTH - first) / (n - 1));
            var cw = [first].concat(new Array(n - 1).fill(rest));
            var hdr = tr(it.head.map(function (x, i) { return cell(x, cw[i], { fill: NAVY, run: { bold: true, color: 'FFFFFF' } }); }), { header: true });
            body.push(table(cw, [hdr].concat(it.rows.map(function (r) {
              return tr(r.map(function (c, i) { return cell(c, cw[i], i === 0 ? { fill: SKY, run: { bold: true } } : {}); }));
            }))));
          } else if (it.t === 'checks') {
            it.items.forEach(function (c) {
              body.push(new D.Paragraph({ spacing: { after: 60, line: 300 }, indent: { left: 200 }, children: [run((c.on ? '☑ ' : '☐ ') + c.label, {}), c.memo ? run('  — ' + c.memo, { color: '5D6885' }) : run('')] }));
            });
          }
          body.push(spacer());
        });
      });
    });

    return new D.Document({
      creator: p.name || '연수 참여자', title: CONFIG.title + ' 연수 결과물',
      styles: {
        default: { document: { run: { font: FONT, size: 21 } } },
        paragraphStyles: [
          { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true, color: NAVY }, paragraph: { spacing: { before: 0, after: 140 } } },
          { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 25, bold: true, color: '3F4FA0' }, paragraph: { spacing: { before: 280, after: 140 } } }
        ]
      },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 567, footer: 567 } } },
        headers: { default: new D.Header({ children: [new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [run(CONFIG.title + (p.name ? ' · ' + p.name : ''), { size: 17, color: '7A84A3' })] })] }) },
        footers: { default: new D.Footer({ children: [new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [new D.TextRun({ children: ['- ', D.PageNumber.CURRENT, ' -'], font: FONT, size: 17, color: '7A84A3' })] })] }) },
        children: body
      }]
    });
  }
  function fileName() {
    var d = new Date(), st = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
    return 'AI디지털평가_연수결과물_' + ((ST.profile().name || '참여자').replace(/[\\/:*?"<>|]/g, '')) + '_' + st + '.docx';
  }
  function saveDocx() {
    ST.flush();
    return window.docx.Packer.toBlob(buildDoc()).then(function (blob) {
      var name = fileName(), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      return name;
    });
  }

  window.Exporter = { model: model, previewHTML: previewHTML, saveDocx: saveDocx, buildDoc: buildDoc, fileName: fileName };
})();
