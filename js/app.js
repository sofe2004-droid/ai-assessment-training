/* 앱 본체: 라우팅, 슬라이드 뷰어, 활동 입력 패널 */
(function () {
  'use strict';
  var W = window.Worksheet, C = window.Cases, SL = window.Slides, ST = window.Store;
  var acts = W.acts;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function get(id) {
    var f = W.computed[id];
    return f ? f(get) : ST.get(id);
  }
  var main = $('#main'), sidebar = $('#sidebar');

  /* ---------- 필드 메타 (fill 버튼에서 사용) ---------- */
  var meta = {};
  Object.keys(acts).forEach(function (aid) {
    acts[aid].blocks.forEach(function (b) {
      if (b.t === 'text') meta[b.id] = b;
    });
  });

  /* ================= 슬라이드 블록 ================= */
  function cardHTML(c) {
    return '<div class="card ' + (c.tone || '') + (c.big ? ' big' : '') + '">' +
      (c.tag ? '<div class="tag">' + c.tag + '</div>' : '') +
      (c.h ? '<h4>' + c.h + '</h4>' : '') + (c.p ? '<p>' + c.p + '</p>' : '') +
      (c.ul ? '<ul>' + c.ul.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') + '</div>';
  }
  function cellHTML(c) { return typeof c === 'object' ? '<td class="' + c.c + '">' + c.t + '</td>' : '<td>' + c + '</td>'; }
  function blockHTML(b) {
    switch (b.k) {
      case 'lead': return '<p class="lead ' + b.cls + '">' + b.text + '</p>';
      case 'list': return '<ul class="list ' + b.cls + '">' + b.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>';
      case 'cards': return '<div class="cards" style="--cols:' + b.cols + '">' + b.items.map(cardHTML).join('') + '</div>';
      case 'steps': return '<div class="steps" style="--cols:' + b.cols + '">' + b.items.map(function (s) {
        return '<div class="step' + (s.hl ? ' hl' : '') + '">' + (s.tag ? '<div class="tag">' + s.tag + '</div>' : '') + '<h4>' + s.h + '</h4>' + (s.p ? '<p>' + s.p + '</p>' : '') + '</div>';
      }).join('') + '</div>';
      case 'table': return '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + b.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
        b.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 && typeof c !== 'object' ? '<th scope="row">' + c + '</th>' : cellHTML(c); }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      case 'compare': return '<div class="compare">' + [['a', b.a], ['b', b.b]].map(function (p) {
        var s = p[1];
        return '<div class="side ' + p[0] + '"><h4>' + s.h + '</h4>' + (s.desc ? '<p class="desc">' + s.desc + '</p>' : '') + (s.items && s.items.length ? '<ul>' + s.items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('') + '</div>';
      case 'callout': return '<div class="callout ' + b.tone + '">' + b.html + '</div>';
      case 'html': return b.html;
      case 'img': return '<figure class="slide-fig"><img src="' + b.src + '" alt="' + esc(b.alt || '') + '" loading="lazy">' + (b.cap ? '<figcaption>' + b.cap + '</figcaption>' : '') + '</figure>';
      case 'survey':
        var u = (window.CONFIG || {}).surveyUrl;
        return '<div class="qr"><p class="lead">오늘 연수는 어떠셨나요?<br>더 나은 연수 운영을 위해 만족도 조사에 참여 부탁드립니다.</p>' +
          (u ? '<a class="btn primary" href="' + esc(u) + '" target="_blank" rel="noopener">만족도 조사 참여하기 ↗</a>' : '<p class="muted">만족도 조사 링크는 강사가 안내합니다.</p>') +
          '<p class="muted small">참여해 주셔서 감사합니다. 왼쪽 아래 “결과물 문서 저장”에서 오늘의 활동 결과를 Word 문서로 저장하세요.</p></div>';
    }
    return '';
  }
  function slideHTML(sl) {
    var ses = W.sessions[sl.ses];
    var hint = sl.act ? '<div class="act-hint">✍️ 아래 입력 패널에 내 활동 내용을 작성하세요 <span class="muted small" style="font-weight:400">(자동 저장됩니다)</span></div>' : '';
    return '<article class="slide ' + (sl.cls || '') + '" id="slide"><div class="slide-bar"><span>' + esc(ses.short) + '</span><span>· 교안 ' + sl.n + '쪽</span><span class="sp"></span><button class="btn sm" data-do="full" title="슬라이드 전체 화면">⛶ 전체 화면</button></div>' +
      '<div class="slide-body">' + (sl.kicker ? '<div class="slide-kicker">' + sl.kicker + '</div>' : '') + '<h2 class="slide-title">' + sl.title + '</h2>' +
      '<div class="blocks">' + sl.blocks.map(blockHTML).join('') + '</div>' + hint + '</div></article>';
  }

  /* ================= 활동 패널 ================= */
  var STATE_LABEL = { none: '미작성', part: '작성 중', done: '완료' };
  function badgeHTML(actId) {
    var s = W.status(actId, get);
    return '<span class="badge ' + s.state + '" data-badge="' + actId + '">' + STATE_LABEL[s.state] + (s.total ? ' ' + s.filled + '/' + s.total : '') + '</span>';
  }
  function areaHTML(id, rows, ph) {
    return '<textarea class="in" data-f="' + id + '" rows="' + (rows || 3) + '" placeholder="' + esc(ph || '') + '">' + esc(ST.get(id)) + '</textarea>';
  }
  function inputHTML(id, ph) {
    return '<input class="in" type="text" data-f="' + id + '" value="' + esc(ST.get(id)) + '" placeholder="' + esc(ph || '') + '">';
  }
  function segHTML(id, opts, cls) {
    var cur = ST.get(id);
    return '<div class="seg ' + (cls || '') + '" role="radiogroup">' + opts.map(function (o) {
      return '<label class="o-' + esc(o) + '"><input type="radio" name="' + id + '" data-f="' + id + '" value="' + esc(o) + '"' + (cur === o ? ' checked' : '') + '>' + esc(o) + '</label>';
    }).join('') + '</div>';
  }
  function selectHTML(id, opts) {
    var cur = ST.get(id);
    return '<select class="in" data-f="' + id + '"><option value="">선택</option>' + opts.map(function (o) { return '<option' + (cur === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
  }
  function fillBtn(to, from, label) { return '<button type="button" class="btn sm fillbtn" data-do="fill" data-to="' + to + '" data-from="' + from + '">' + (label || '앞에서 쓴 내용 불러오기') + '</button>'; }
  function cellHTMLp(c) {
    if (c.k === 'radio') return segHTML(c.id, c.opts);
    if (c.k === 'select') return selectHTML(c.id, c.opts);
    if (c.k === 'area') return areaHTML(c.id, c.rows, c.ph);
    return inputHTML(c.id, c.ph);
  }

  function promptText(b) {
    var out = b.base;
    if (b.ctx && b.ctx.length) {
      out += '\n\n[내 수행평가 정보]\n' + b.ctx.map(function (p) { return p[0] + ': ' + (get(p[1]) || '(입력 필요)'); }).join('\n');
    }
    if (b.inputs && b.inputs.length) {
      out += '\n\n' + b.inputs.map(function (f) { return '[' + f.label + ']\n' + (get(f.id) || '(입력 필요)'); }).join('\n\n');
    }
    return out;
  }

  function composeQuestion(id) {
    var g = function (k) { return (ST.get(id + '.' + k) || '').trim(); };
    if (!g('student') && !g('ai') && !g('learn') && !g('evid')) return '';
    return (g('student') || '학생') + '이(가) ' + (g('ai') || 'AI를 활용한 과제에서') + ' ' + (g('learn') || '실제 배움') + '을(를) 어떤 증거(' + (g('evid') || '증거') + ')로 확인할 것인가?';
  }

  function caseHubHTML() {
    var cm = C.common, A = C.students.A, B = C.students.B;
    function ev(list) { return list.map(function (e) { return '<div class="ev' + (e.miss ? ' miss' : '') + '"><b>' + e.no + ' ' + e.h + '</b><br>' + e.t + '</div>'; }).join(''); }
    var t1 = '<div class="info">' + esc(C.notice) + '</div>' +
      '<div class="ev"><b>공통 과제 · ' + cm.title + '</b><br>' + cm.task + '</div>' +
      '<div class="ev"><b>연습용 목표</b> ' + cm.goal + '<br><b>수행 조건</b> ' + cm.cond + '</div>' +
      '<div class="tbl-wrap"><table class="tbl"><caption style="text-align:left;padding:4px 0;font-weight:700">' + cm.data1.caption + '</caption><thead><tr>' + cm.data1.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      cm.data1.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="ev">' + cm.memo + '</div>' +
      '<div class="callout note"><b>AI 검토용 주장</b><br>' + cm.claim + '<br><span class="small muted">' + cm.claimNote + '</span></div>' +
      '<div class="ev"><b>AI 미사용자도 쓸 수 있는 질문 카드</b><ul style="margin:4px 0 0;padding-left:18px">' + cm.cards.map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ul></div>';
    var fin = '<div class="ev"><b>공통 최종 제안문 (두 학생 동일)</b><br>' + cm.finalText + '</div>';
    var tA = fin + ev(A.items) + '<div class="callout">' + A.question + '</div>';
    var tB = fin + ev(B.items) + '<div class="small muted">' + C.mark + '</div>';
    var tR = '<div class="tbl-wrap"><table class="tbl"><caption style="text-align:left;padding:4px 0;font-weight:700">' + C.rubricTitle + '</caption><thead><tr>' + C.rubric.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      C.rubric.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="callout note"><b>증거가 충분하지 않은 경우</b><br>' + C.hold + '</div>' +
      '<div class="ev"><b>서로 합의할 사항</b><ul style="margin:4px 0 0;padding-left:18px">' + C.agree.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    var tabs = [['과제·자료', t1], ['학생 A', tA], ['학생 B', tB], ['연습용 루브릭', tR]];
    return '<div class="casehub"><div class="tabs" role="tablist">' + tabs.map(function (t, i) { return '<button type="button" class="tab' + (i === 0 ? ' on' : '') + '" data-do="tab" data-i="' + i + '">' + t[0] + '</button>'; }).join('') + '</div>' +
      tabs.map(function (t, i) { return '<div class="tabpane" data-pane="' + i + '"' + (i ? ' hidden' : '') + '>' + t[1] + '</div>'; }).join('') + '</div>';
  }

  function panelBlockHTML(b) {
    switch (b.t) {
      case 'info': return '<div class="info ' + b.tone + '">' + b.html + '</div>';
      case 'text':
        var fb = '';
        if (b.fill) fb = fillBtn(b.id, b.fill);
        if (b.fillText) fb = '<button type="button" class="btn sm fillbtn" data-do="filltext" data-to="' + b.id + '">' + (b.fillLabel || '예시 넣기') + '</button>';
        return '<div class="field"><label for="f-' + b.id + '">' + esc(b.label) + (b.opt ? ' <span class="hint">(선택)</span>' : '') + '</label>' +
          (b.hint ? '<span class="hint">' + b.hint + '</span>' : '') +
          (b.rows === 1 ? inputHTML(b.id, b.ph) : areaHTML(b.id, b.rows, b.ph)) + (fb ? '<div class="fill-row">' + fb + '</div>' : '') + '</div>';
      case 'mx':
        var span = false;
        var rows = b.rows.map(function (r) {
          var lab = r.labelFrom ? (get(r.labelFrom) ? esc(get(r.labelFrom)) + '<small>' + esc(r.label) + '</small>' : esc(r.label) + '<small>앞 단계에서 정한 요소가 여기에 표시됩니다</small>') : esc(r.label);
          var cells;
          if (r.span) cells = '<td colspan="' + (b.head.length - 1) + '"><div style="display:grid;gap:8px">' + r.cells.map(cellHTMLp).join('') + '</div></td>';
          else cells = r.cells.map(function (c) { return '<td>' + cellHTMLp(c) + '</td>'; }).join('');
          return '<tr><td class="rl">' + lab + '</td>' + cells + '</tr>';
        }).join('');
        var tbl = '<table class="mx"><thead><tr>' + b.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table>';
        return b.scroll ? '<div class="mx-scroll">' + tbl + '</div>' : tbl;
      case 'checks':
        return (b.title ? '<div class="lbl">' + esc(b.title) + '</div>' : '') + '<div class="chk-list">' + b.items.map(function (it) {
          var chk = '<label class="chk"><input type="checkbox" data-f="' + it.id + '"' + (ST.get(it.id) ? ' checked' : '') + '><span>' + esc(it.label) + '</span></label>';
          return it.memo ? '<div class="chk-row">' + chk + inputHTML(it.memo, '메모') + '</div>' : chk;
        }).join('') + '</div>';
      case 'choice':
        return '<div class="field"><div class="lbl">' + esc(b.label) + '</div>' + segHTML(b.id, b.opts, 'wrap') + '</div>';
      case 'recall':
        return '<details class="recall" open><summary>' + esc(b.title) + '</summary><dl>' + b.items.map(function (p) {
          var v = get(p[1]);
          return '<dt>' + esc(p[0]) + '</dt><dd class="' + (v ? '' : 'empty') + '">' + (v ? esc(v) : '아직 작성하지 않았어요') + '</dd>';
        }).join('') + '</dl></details>';
      case 'prompt':
        var pid = 'pr-' + b.n;
        var ins = (b.inputs || []).map(function (f) { return '<div class="field"><label>' + esc(f.label) + '</label>' + areaHTML(f.id, f.rows) + '</div>'; }).join('');
        var sample = b.sample ? '<div class="fill-row"><button type="button" class="btn sm" data-do="sample" data-n="' + b.n + '">' + esc(b.sample.label) + '</button></div>' : '';
        return '<div class="prompt" data-prompt="' + b.n + '"><div class="prompt-head"><span>' + (b.n <= 7 ? 'PROMPT ' + b.n + ' · ' : '') + esc(b.title) + '</span><button type="button" class="btn sm" data-do="copy" data-target="' + pid + '">📋 프롬프트 복사</button></div>' +
          '<pre class="prompt-box" id="' + pid + '">' + esc(promptText(b)) + '</pre>' +
          '<div class="prompt-body">' + (b.tip ? '<div class="prompt-tip">💡 ' + esc(b.tip) + '</div>' : '') + ins + sample +
          '<div class="prompt-tip">복사한 프롬프트를 사용하는 생성형 AI(ChatGPT·Claude·Gemini 등)에 붙여 넣고, 받은 응답을 아래에 붙여 넣으세요. 응답은 <b>그대로 쓰지 않고</b> 내 평가 목적에 맞게 고칩니다.</div>' +
          '<div class="field"><label>AI 응답 붙여넣기 <span class="hint">(선택 · Word 결과물에 함께 저장됩니다)</span></label>' + areaHTML(b.rid, 5) + '</div>' +
          '<div class="field"><label>' + esc(b.flabel) + '</label>' + areaHTML(b.fid, 4) + '</div></div></div>';
      case 'formula':
        return '<div class="formula">' + b.fields.map(function (f) { return '<div class="field"><label>' + esc(f.label) + '</label>' + inputHTML(b.id + '.' + f.k, f.ph) + '</div>'; }).join('') + '</div>' +
          '<div><div class="lbl">공식으로 만든 문장</div><div class="composed" data-composed="' + b.id + '">' + esc(composeQuestion(b.id) || '위 칸을 채우면 문장이 만들어집니다') + '</div>' +
          '<div class="fill-row" style="margin-top:6px"><button type="button" class="btn sm" data-do="compose" data-id="' + b.id + '" data-to="' + b.finalId + '">아래 칸에 넣기</button></div></div>' +
          '<div class="field"><label>내 핵심 평가 질문 <span class="hint">(문장을 다듬어 최종 질문으로 완성하세요)</span></label>' + areaHTML(b.finalId, 3) + '</div>';
      case 'chips':
        return '<div class="field"><div class="lbl">후보 (누르면 빈 칸에 들어갑니다)</div><div class="chips">' + b.items.map(function (x) { return '<button type="button" class="chip" data-do="chip" data-targets="' + b.targets.join(',') + '" data-v="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div></div>';
      case 'six':
        return '<div class="six">' + b.cells.map(function (c) {
          return '<div class="cell' + (c.last ? ' last' : '') + '"><div class="no">' + c.no + '</div><h4>' + esc(c.title) + '</h4>' + areaHTML(c.id, 5, c.ph) + '<div class="fill-row">' + fillBtn(c.id, c.fill, '불러오기') + '</div></div>';
        }).join('') + '</div>';
      case 'casehub': return caseHubHTML();
    }
    return '';
  }
  function panelHTML(actId) {
    var a = acts[actId];
    return '<section class="panel" id="panel-' + actId + '"><div class="panel-head"><span>✍️</span><h3>' + esc(a.title) + '</h3>' + badgeHTML(actId) + '</div><div class="panel-body">' + a.blocks.map(panelBlockHTML).join('') + '</div></section>';
  }

  /* ================= 화면 ================= */
  var cur = null; // 현재 슬라이드
  function idxOf(n) { for (var i = 0; i < SL.length; i++) if (SL[i].n === n) return i; return -1; }

  function renderSlide(n) {
    var i = idxOf(n); if (i < 0) { i = 0; n = SL[0].n; }
    var sl = SL[i]; cur = sl;
    ST.setPos(n);
    main.innerHTML = '<div class="main-inner">' + slideHTML(sl) + (sl.act ? sl.act.map(panelHTML).join('') : '') + '</div>';
    growAll();
    var prev = SL[i - 1], next = SL[i + 1];
    $('#pager').innerHTML = '<button class="btn" data-go="' + (prev ? prev.n : '') + '"' + (prev ? '' : ' disabled') + '>← 이전</button><span class="ct">' + (i + 1) + ' / ' + SL.length + '</span><button class="btn primary" data-go="' + (next ? next.n : '') + '"' + (next ? '' : ' disabled') + '>다음 →</button>';
    $('#pager').hidden = false;
    document.body.classList.remove('start-mode', 'nav-open');
    updateSidebarCur();
    window.scrollTo(0, 0);
    document.title = sl.title.replace(/<[^>]+>/g, '') + ' · ' + CONFIG.title;
  }

  function growTA(el) { el.style.height = 'auto'; el.style.height = Math.max(el.scrollHeight + 2, 44) + 'px'; }
  function growAll() { $$('textarea.in', main).forEach(function (t) { if (t.value) growTA(t); }); }

  function renderStart() {
    cur = null;
    document.body.classList.add('start-mode');
    $('#pager').hidden = true;
    var p = ST.profile(), has = ST.hasProfile();
    main.innerHTML = '<div class="card-page"><div class="hd"><h1>' + esc(CONFIG.title) + '</h1><p>' + esc(CONFIG.subtitle) + ' · 참여자 활동 웹앱</p></div><div class="bd">' +
      '<p>교안을 보며 활동지를 바로 작성합니다. 입력한 내용은 <b>이 브라우저에 자동 저장</b>되며, 연수가 끝나면 <b>Word 문서</b>로 저장할 수 있습니다.</p>' +
      '<div class="field"><label for="pf-name">성명</label><input class="in" id="pf-name" value="' + esc(p.name) + '" autocomplete="off"></div>' +
      '<div class="field"><label for="pf-org">소속</label><input class="in" id="pf-org" value="' + esc(p.org) + '" autocomplete="off" placeholder="예) ○○중학교 · 국어"></div>' +
      '<div class="row"><button class="btn primary" data-do="begin">' + (has ? '이어서 하기' : '연수 시작하기') + '</button>' +
      '<button class="btn" data-do="import">백업 파일 불러오기</button><input type="file" id="import-file" accept=".json,application/json" hidden></div>' +
      '<div class="info warn" style="padding:10px 14px;border-radius:10px;background:var(--red-bg);border:1px solid #efc3c3;color:#7a2323"><b>개인정보 주의</b> 학생 이름·학번·민감정보는 이 앱과 생성형 AI 입력창에 넣지 않습니다. 연수에서는 <b>가상 사례</b>만 사용하세요.</div>' +
      '<div class="small muted">' +
      '<p>· 입력 내용은 서버로 전송되지 않고, <b>이 기기의 이 브라우저</b>에만 저장됩니다. 다른 브라우저·기기에서는 보이지 않습니다.</p>' +
      '<p>· 브라우저 방문 기록/사이트 데이터를 지우면 입력이 사라질 수 있으니, 활동 중간과 마지막에 <b>백업 파일</b>을 저장해 두세요.</p>' +
      (ST.isMemoryOnly() ? '<p style="color:var(--red)">⚠️ 이 브라우저는 저장 기능이 막혀 있어 새로고침하면 입력이 사라집니다. 일반(비시크릿) 창에서 열어 주세요.</p>' : '') +
      '</div></div></div>';
    $('#pf-name').focus();
    updateSidebarCur();
  }

  function renderExport() {
    cur = null;
    document.body.classList.remove('start-mode', 'nav-open');
    $('#pager').hidden = true;
    var rows = '';
    var totalF = 0, totalT = 0;
    W.sessions.slice(1).forEach(function (s) {
      rows += '<h3 style="margin:16px 0 6px;color:var(--navy)">' + esc(s.name) + '</h3><div class="export-grid">';
      W.order.filter(function (id) { return acts[id].ses === s.no; }).forEach(function (id) {
        var st = W.status(id, get); totalF += st.filled; totalT += st.total;
        var miss = W.missing(id, get);
        var first = SL.filter(function (x) { return x.act && x.act.indexOf(id) >= 0; })[0];
        rows += '<div class="ex-row"><div><b>' + esc(acts[id].title) + '</b> ' + badgeHTML(id) + '<div class="meter"><i style="width:' + (st.total ? Math.round(st.filled / st.total * 100) : 0) + '%"></i></div>' +
          (miss.length ? '<div class="missing">비어 있는 칸: ' + miss.slice(0, 4).map(function (m) { return esc(m.label); }).join(' · ') + (miss.length > 4 ? ' 외 ' + (miss.length - 4) + '곳' : '') + '</div>' : '') + '</div>' +
          (first ? '<button class="btn sm" data-go="' + first.n + '">작성하러 가기</button>' : '') + '</div>';
      });
      rows += '</div>';
    });
    var pct = totalT ? Math.round(totalF / totalT * 100) : 0;
    main.innerHTML = '<div class="main-inner"><div class="slide"><div class="slide-bar"><span>결과물</span><span class="sp"></span></div><div class="slide-body">' +
      '<div class="slide-kicker">RESULT</div><h2 class="slide-title">결과물 문서 저장</h2>' +
      '<p class="lead" style="font-size:1.1rem">필수 항목 <b>' + totalF + ' / ' + totalT + '</b> (' + pct + '%) 작성됨. 빈 칸이 있어도 문서를 저장할 수 있으며, 빈 칸은 문서에서 비워 둡니다.</p>' +
      '<div class="row" style="margin:14px 0"><button class="btn primary" data-do="docx">📄 Word 문서(.docx) 저장</button><button class="btn" data-do="backup">💾 백업 파일(.json) 저장</button><button class="btn" data-do="preview">👁 내용 미리보기</button></div>' +
      '<div class="callout note">문서에는 <b>차시별 활동 내용</b>과 <b>AI 응답·내가 고친 최종본</b>이 함께 들어갑니다. 문서의 문구는 학교 규정과 평가계획에 맞게 다시 확인해 사용하세요.</div>' +
      '<div id="preview-area" hidden style="margin-top:16px"></div>' + rows + '</div></div></div>';
    updateSidebarCur();
    window.scrollTo(0, 0);
    document.title = '결과물 문서 저장 · ' + CONFIG.title;
  }

  /* ================= 사이드바 ================= */
  function buildSidebar() {
    var html = '';
    W.sessions.forEach(function (s) {
      var list = SL.filter(function (x) { return x.ses === s.no; });
      html += '<div class="side-group open" data-ses="' + s.no + '"><button class="side-head" data-do="toggle"><span class="caret">▶</span><span>' + esc(s.no === 0 ? '오리엔테이션' : s.name.split(' · ')[0] + ' · ' + s.name.split(' · ')[1]) + '</span><span class="pct" data-pct="' + s.no + '"></span></button>' +
        '<div class="side-bar"><i data-bar="' + s.no + '"></i></div><div class="side-list">' +
        list.map(function (x) {
          return '<button class="side-item" data-go="' + x.n + '" data-n="' + x.n + '"><span class="num">' + x.n + '</span><span class="t">' + x.title.replace(/<[^>]+>/g, '') + '</span>' + (x.act ? '<span class="dot" data-dot="' + x.n + '">○</span>' : '') + '</button>';
        }).join('') + '</div></div>';
    });
    html += '<div class="side-extra"><button class="btn primary" data-go="export">📄 결과물 문서 저장</button><button class="btn" data-do="backup">💾 백업 파일 저장</button><button class="btn" data-go="start">👤 내 정보 · 백업 불러오기</button></div>';
    sidebar.innerHTML = html;
    updateStatus();
  }
  function updateSidebarCur() {
    $$('.side-item', sidebar).forEach(function (b) { b.classList.toggle('cur', !!cur && String(cur.n) === b.dataset.n); });
    var c = $('.side-item.cur', sidebar);
    if (c && c.scrollIntoView) { var r = c.getBoundingClientRect(), sr = sidebar.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) c.scrollIntoView({ block: 'center' }); }
  }
  var statusRAF = 0;
  function updateStatus() {
    if (statusRAF) return;
    statusRAF = requestAnimationFrame(function () {
      statusRAF = 0;
      var sf = {}, st = {};
      W.order.forEach(function (id) { var s = W.status(id, get), a = acts[id]; sf[a.ses] = (sf[a.ses] || 0) + s.filled; st[a.ses] = (st[a.ses] || 0) + s.total; });
      [1, 2, 3].forEach(function (n) {
        var pct = st[n] ? Math.round(sf[n] / st[n] * 100) : 0;
        var p = $('[data-pct="' + n + '"]', sidebar), b = $('[data-bar="' + n + '"]', sidebar);
        if (p) p.textContent = pct + '%'; if (b) b.style.width = pct + '%';
      });
      SL.forEach(function (x) {
        if (!x.act) return;
        var states = x.act.map(function (id) { return W.status(id, get).state; });
        var s = states.every(function (v) { return v === 'done'; }) ? 'done' : (states.some(function (v) { return v !== 'none'; }) ? 'part' : 'none');
        var d = $('[data-dot="' + x.n + '"]', sidebar);
        if (d) { d.className = 'dot ' + s; d.textContent = s === 'done' ? '✓' : (s === 'part' ? '◐' : '○'); }
      });
      $$('[data-badge]').forEach(function (el) {
        var id = el.dataset.badge, s = W.status(id, get);
        el.className = 'badge ' + s.state; el.textContent = STATE_LABEL[s.state] + (s.total ? ' ' + s.filled + '/' + s.total : '');
      });
    });
  }
  function refreshPrompts() {
    $$('.prompt[data-prompt]').forEach(function (el) {
      var n = +el.dataset.prompt, b = null;
      Object.keys(acts).forEach(function (aid) { acts[aid].blocks.forEach(function (x) { if (x.t === 'prompt' && x.n === n) b = x; }); });
      if (b) { var box = $('.prompt-box', el); if (box) box.textContent = promptText(b); }
    });
    $$('[data-composed]').forEach(function (el) { el.textContent = composeQuestion(el.dataset.composed) || '위 칸을 채우면 문장이 만들어집니다'; });
  }

  /* ================= 유틸 ================= */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } document.body.removeChild(ta);
    });
  }
  function download(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function fileStamp() { var d = new Date(); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function safeName() { return (ST.profile().name || '참여자').replace(/[\\/:*?"<>|]/g, ''); }
  function setValue(id, v) {
    ST.set(id, v);
    $$('[data-f="' + id + '"]').forEach(function (el) { if (el.type === 'radio' || el.type === 'checkbox') return; el.value = v; if (el.tagName === 'TEXTAREA') growTA(el); });
    refreshPrompts(); updateStatus();
  }

  /* ================= 이벤트 ================= */
  document.addEventListener('input', function (e) {
    var el = e.target, id = el.dataset && el.dataset.f;
    if (!id || el.type === 'checkbox' || el.type === 'radio') return;
    ST.set(id, el.value);
    if (el.tagName === 'TEXTAREA') growTA(el);
    refreshPrompts(); updateStatus();
  });
  document.addEventListener('change', function (e) {
    var el = e.target, id = el.dataset && el.dataset.f;
    if (el.id === 'import-file') return;
    if (!id) return;
    if (el.type === 'checkbox') ST.set(id, el.checked ? '1' : '');
    else if (el.type === 'radio') ST.set(id, el.value);
    else ST.set(id, el.value);
    refreshPrompts(); updateStatus();
  });

  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go && !go.disabled) { navigate(go.dataset.go); return; }
    var d = e.target.closest('[data-do]');
    if (!d) return;
    var act = d.dataset.do;
    if (act === 'toggle') d.parentElement.classList.toggle('open');
    else if (act === 'full') { var s = $('#slide'); if (s && s.requestFullscreen) s.requestFullscreen().catch(function () {}); }
    else if (act === 'fill') {
      var to = d.dataset.to, v = get(d.dataset.from);
      if (!v) { toast('가져올 내용이 아직 없습니다. 앞 단계를 먼저 작성해 주세요.'); return; }
      if (ST.get(to) && ST.get(to) !== v && !confirm('이미 작성한 내용이 있습니다. 불러온 내용으로 바꿀까요?')) return;
      setValue(to, v); toast('불러왔습니다');
    } else if (act === 'filltext') {
      var m = meta[d.dataset.to];
      if (ST.get(d.dataset.to) && !confirm('이미 작성한 내용이 있습니다. 예시로 바꿀까요?')) return;
      setValue(d.dataset.to, m.fillText);
    } else if (act === 'copy') {
      var box = document.getElementById(d.dataset.target);
      copyText(box.textContent).then(function () { toast('프롬프트를 복사했습니다. 생성형 AI 입력창에 붙여 넣으세요.'); }, function () { toast('복사에 실패했습니다. 직접 선택해 복사해 주세요.'); });
    } else if (act === 'sample') {
      var b = null;
      Object.keys(acts).forEach(function (aid) { acts[aid].blocks.forEach(function (x) { if (x.t === 'prompt' && x.n === +d.dataset.n) b = x; }); });
      var vals = b.sample.values, has = Object.keys(vals).some(function (k) { return ST.get(k); });
      if (has && !confirm('이미 작성한 내용이 있습니다. 연습용 사례로 바꿀까요?')) return;
      Object.keys(vals).forEach(function (k) { var v = vals[k]; setValue(k, W.computed[v] ? W.computed[v](get) : v); });
      toast('연습용 사례를 채웠습니다');
    } else if (act === 'compose') {
      var q = composeQuestion(d.dataset.id);
      if (!q) { toast('위 칸을 먼저 채워 주세요.'); return; }
      if (ST.get(d.dataset.to) && !confirm('이미 작성한 질문이 있습니다. 바꿀까요?')) return;
      setValue(d.dataset.to, q);
    } else if (act === 'chip') {
      var targets = d.dataset.targets.split(','), free = targets.filter(function (t) { return !ST.get(t); })[0];
      if (!free) { toast('평가 요소 칸이 모두 찼습니다.'); return; }
      setValue(free, d.dataset.v);
    } else if (act === 'tab') {
      var hub = d.closest('.casehub');
      $$('.tab', hub).forEach(function (t) { t.classList.toggle('on', t === d); });
      $$('.tabpane', hub).forEach(function (p) { p.hidden = p.dataset.pane !== d.dataset.i; });
    } else if (act === 'begin') {
      var name = $('#pf-name').value.trim();
      if (!name) { toast('성명을 입력해 주세요.'); $('#pf-name').focus(); return; }
      ST.setProfile({ name: name, org: $('#pf-org').value });
      ST.flush(); updateTopbar();
      navigate(String(ST.pos()));
    } else if (act === 'import') $('#import-file').click();
    else if (act === 'backup') { ST.flush(); download(new Blob([ST.exportJSON()], { type: 'application/json' }), '연수백업_' + safeName() + '_' + fileStamp() + '.json'); toast('백업 파일을 저장했습니다'); }
    else if (act === 'docx') {
      d.disabled = true; d.textContent = '문서 만드는 중…';
      Exporter.saveDocx().then(function (name) { toast('저장했습니다: ' + name); }, function (err) { console.error(err); toast('문서 생성에 실패했습니다: ' + err.message); }).then(function () { d.disabled = false; d.textContent = '📄 Word 문서(.docx) 저장'; });
    } else if (act === 'preview') {
      var pa = $('#preview-area'); pa.hidden = !pa.hidden;
      if (!pa.hidden) pa.innerHTML = Exporter.previewHTML();
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.id !== 'import-file') return;
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        if (ST.hasAnyData() && !confirm('현재 브라우저에 저장된 입력을 백업 파일의 내용으로 바꿉니다. 계속할까요?')) return;
        ST.importJSON(r.result); updateTopbar(); buildSidebar(); toast('백업을 불러왔습니다'); renderStart();
      } catch (err) { toast(err.message || '불러오기에 실패했습니다'); }
    };
    r.readAsText(f); e.target.value = '';
  });

  document.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!cur) return;
    var i = idxOf(cur.n);
    if (e.key === 'ArrowRight' && SL[i + 1]) navigate(String(SL[i + 1].n));
    else if (e.key === 'ArrowLeft' && SL[i - 1]) navigate(String(SL[i - 1].n));
  });

  $('#nav-toggle').addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  $('#brand').addEventListener('click', function () { navigate(ST.hasProfile() ? String(ST.pos()) : 'start'); });
  $('#go-export').addEventListener('click', function () { navigate('export'); });

  /* ================= 라우팅 ================= */
  function navigate(to) {
    var h = to === 'start' || to === 'export' ? '#/' + to : '#/s/' + to;
    if (location.hash === h) route(); else location.hash = h;
  }
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    if (h === 'export') { if (!ST.hasProfile()) return renderStart(); return renderExport(); }
    if (h === 'start' || !ST.hasProfile()) return renderStart();
    var m = h.match(/^s\/(\d+)$/);
    renderSlide(m ? +m[1] : ST.pos());
  }
  window.addEventListener('hashchange', route);

  /* ================= 상단바 ================= */
  function updateTopbar() {
    var p = ST.profile();
    $('#who').textContent = p.name ? p.name + (p.org ? ' · ' + p.org : '') : '';
  }
  ST.onChange(function (type) {
    var s = $('#save-state');
    if (type === 'saving') { s.textContent = '저장 중…'; s.classList.add('busy'); }
    else {
      var d = new Date();
      s.classList.remove('busy');
      s.textContent = ST.isMemoryOnly() ? '⚠ 저장 불가(임시)' : '자동 저장됨 ✓ ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
  });

  /* ================= 시작 ================= */
  $('#brand').textContent = CONFIG.title;
  updateTopbar();
  buildSidebar();
  if (!location.hash) location.hash = ST.hasProfile() ? '#/s/' + ST.pos() : '#/start';
  else route();
  window.addEventListener('beforeunload', function (e) { ST.flush(); });
})();
