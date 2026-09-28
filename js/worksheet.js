/* 활동지 구조 정의 (활동 = 화면의 입력 패널이자 Word 문서의 한 절)
   블록 종류: info, text, mx, checks, choice, recall, prompt, formula, chips, six, casehub
   - 조별·짝 활동은 개인 활동으로 바꾸어 구성했습니다. */
(function () {
  var C = window.Cases;
  var acts = {};
  var order = [];

  function A(id, ses, title, blocks, opt) {
    acts[id] = Object.assign({ id: id, ses: ses, title: title, blocks: blocks }, opt || {});
    order.push(id);
  }
  function T(id, label, o) { return Object.assign({ t: 'text', id: id, label: label, rows: 3 }, o || {}); }
  function I(html, tone) { return { t: 'info', html: html, tone: tone || '' }; }

  var PRIVACY = '<p><b>개인정보 주의</b> 학생 이름·학번·민감정보는 생성형 AI 입력창(그리고 이 앱)에 넣지 않습니다. 실제 자료를 활용할 때는 필요한 증거만 비식별화합니다.</p>';
  var STEP0_CTX = [['교과·학년', 'b0.subject'], ['단원·성취기준', 'b0.standard'], ['현재 수행평가', 'b0.task'], ['현재 제출 결과물', 'b0.output'], ['가장 고민되는 평가 문제 1가지', 'b0.problem']];

  /* ===================== 1차시 ===================== */
  A('a1', 1, '활동 1 · 내 교과의 평가 고민 1가지', [
    I('<p>먼저 해결책보다 <b>“우리 교과의 가장 불편한 평가 질문”</b>을 정확히 잡습니다. 지금은 해결책을 만들지 않습니다.</p><p><b>좋은 질문의 예</b> “AI를 사용했는가?”에서 끝내지 말고 “학생이 무엇을 이해했고, 어떤 근거로 판단했는지를 무엇으로 확인할 것인가?”로 바꿔봅니다.</p>'),
    T('a1.task', '교과·학년·수행평가', { rows: 2, ph: '예) 중2 국어 · 주장하는 글쓰기 수행평가' }),
    T('a1.hard', 'AI가 개입했을 때 가장 판단하기 어려운 지점', { ph: '예) AI가 쓴 글에서 학생의 생각이 어디까지인지 알기 어렵다' }),
    T('a1.q', '학생의 실제 배움을 확인하기 위해 묻고 싶은 질문', { ph: '“AI 사용 여부”가 아니라 “배움이 보이는가”를 묻는 질문으로' })
  ]);

  A('a2', 1, '활동 2 · 내 고민 묶기 (개인)', [
    I('<p>교과는 달라도 평가 고민은 <b>‘활용 범위, 실제 이해, 과정 증거, 공정성, 피드백’</b>으로 묶이는 경우가 많습니다. (조별 활동 → <b>개인 활동</b>: 내 고민을 다섯 분류에 나누어 적어 봅니다. 해당하지 않는 분류는 비워 두어도 됩니다.)</p>'),
    { t: 'recall', title: '활동 1에서 쓴 내용', items: [['평가 고민', 'a1.task'], ['판단이 어려운 지점', 'a1.hard'], ['묻고 싶은 질문', 'a1.q']] },
    { t: 'mx', head: ['분류', '내 고민에서 이 분류에 해당하는 내용'], rows: [
      { label: 'AI 활용 범위', cells: [{ id: 'a2.c1', k: 'area', rows: 2 }] },
      { label: '학생의 실제 이해', cells: [{ id: 'a2.c2', k: 'area', rows: 2 }] },
      { label: '과정 증거', cells: [{ id: 'a2.c3', k: 'area', rows: 2 }] },
      { label: '공정성·접근성', cells: [{ id: 'a2.c4', k: 'area', rows: 2 }] },
      { label: '피드백·기록', cells: [{ id: 'a2.c5', k: 'area', rows: 2 }] }
    ], noReq: 4 },
    { t: 'choice', id: 'a2.top', label: '내가 가장 중요하다고 본 분류', opts: ['AI 활용 범위', '학생의 실제 이해', '과정 증거', '공정성·접근성', '피드백·기록'] }
  ]);

  A('a2q', 1, '핵심 평가 질문 만들기', [
    I('<p><b>질문 공식</b> 학생 + AI 활용 상황 + 확인할 배움 + 증거</p><p>좋은 질문은 특정 도구보다 평가 목적을 중심에 두고, 학생의 판단·근거·수정 과정을 포함합니다.</p><p class="small muted">예) 학생이 AI를 활용한 과제에서 어떤 증거로 실제 배움을 판단할 것인가?</p>'),
    { t: 'formula', id: 'a2q', finalId: 'a2q.final', fields: [
      { k: 'student', label: '학생', ph: '예) 중2 학생' },
      { k: 'ai', label: 'AI 활용 상황', ph: '예) AI 피드백을 받아 글을 고칠 때' },
      { k: 'learn', label: '확인할 배움', ph: '예) 주장과 근거의 타당성 판단' },
      { k: 'evid', label: '증거', ph: '예) 수정 이유 기록과 짧은 구술' }
    ] }
  ]);

  A('a3', 1, 'AI 활용 허용·제한·금지 초안', [
    I('<p>같은 수행평가 안에서도 <b>단계별로 범위가 달라질 수 있습니다.</b> 이유는 반드시 성취기준·평가목표와 연결합니다. ‘제한’이라면 어디까지, 어떤 조건에서 쓸 수 있는지 한 문장 더 씁니다.</p>'),
    { t: 'recall', title: '내가 정한 핵심 평가 질문', items: [['핵심 질문', 'a2q.final']] },
    { t: 'mx', head: ['단계', 'AI 활용', '이유 / 조건'], rows: [
      { label: '개념 이해·사전 학습', cells: [{ id: 'a3.1.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'a3.1.w', k: 'area', rows: 2 }] },
      { label: '아이디어·자료 탐색', cells: [{ id: 'a3.2.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'a3.2.w', k: 'area', rows: 2 }] },
      { label: '초안·개요 작성', cells: [{ id: 'a3.3.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'a3.3.w', k: 'area', rows: 2 }] },
      { label: '실제 수행평가 핵심 단계', cells: [{ id: 'a3.4.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'a3.4.w', k: 'area', rows: 2 }] },
      { label: '피드백·고쳐쓰기', cells: [{ id: 'a3.5.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'a3.5.w', k: 'area', rows: 2 }] }
    ] }
  ]);

  A('a3c', 1, '사례 확인과 수정 (보충 활동자료 1)', [
    I('<p>아래 사례 중 <b>두 개 이상</b>을 골라 판단합니다. 정답을 맞히기보다 <b>조건을 구체화</b>하는 활동입니다. (조 안 공유 → 개인 판단)</p><p>번역·첨삭이라는 기능명만으로 결정하지 말고, 평가하는 역량을 말해 주세요. 기기가 없는 학생도 그 역량을 보여줄 방법이 있습니까?</p><p class="small muted">' + C.notice + '</p>'),
    I('<p><b>' + C.scope[0].title + '</b></p><p>' + C.scope[0].text + '</p>'),
    { t: 'mx', head: ['판단 항목', '내 판단'], rows: [
      { label: '허용 범위 판단', cells: [{ id: 'cs1.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'cs1.w', k: 'area', rows: 2, ph: '이유' }], span: true },
      { label: '학생이 직접 보여야 할 배움', cells: [{ id: 'cs1.learn', k: 'area', rows: 2 }] },
      { label: '필요한 증거와 사전 안내', cells: [{ id: 'cs1.ev', k: 'area', rows: 2 }] }
    ], noReq: 3 },
    I('<p><b>' + C.scope[1].title + '</b></p><p>' + C.scope[1].text + '</p>'),
    { t: 'mx', head: ['판단 항목', '내 판단'], rows: [
      { label: '허용 범위 판단', cells: [{ id: 'cs2.m', k: 'radio', opts: ['허용', '제한', '금지'] }, { id: 'cs2.w', k: 'area', rows: 2, ph: '이유' }], span: true },
      { label: '학생이 직접 보여야 할 배움', cells: [{ id: 'cs2.learn', k: 'area', rows: 2 }] },
      { label: '필요한 증거와 사전 안내', cells: [{ id: 'cs2.ev', k: 'area', rows: 2 }] }
    ], noReq: 3 },
    I('<p><b>' + C.scope[2].title + '</b></p><p>' + C.scope[2].text + '</p>'),
    { t: 'mx', head: ['판단 항목', '내 판단'], rows: [
      { label: '같은 성취를 보여줄 대체 경로', cells: [{ id: 'cs3.alt', k: 'area', rows: 2 }] },
      { label: '기기 사용 여부와 무관하게 적용할 기준', cells: [{ id: 'cs3.rule', k: 'area', rows: 2 }] }
    ], noReq: 2 },
    I('<p><b>점검</b> 내 판단의 이유에 도구 이름만 들어 있지는 않은가? 목표·활용 단계·조건·학생 증거가 함께 있는가?</p>'),
    T('a3c.revise', '위 사례를 보고 앞의 ‘허용·제한·금지 초안’에서 고칠 한 가지', { rows: 2 })
  ]);

  A('a4', 1, '1차시 마무리 · REFLECT', [
    I('<p>이 세 가지가 2차시 평가 재설계의 <b>입력값</b>이 됩니다.</p>'),
    T('a4.problem', '① 평가 고민', { rows: 2, fill: 'a1.hard' }),
    T('a4.question', '② 핵심 평가 질문', { rows: 2, fill: 'a2q.final' }),
    T('a4.keep', '③ AI 활용 범위에서 반드시 지킬 것', { rows: 2, ph: '예) 실제 수행평가의 핵심 단계는 학생이 독자적으로 수행한다' }),
    { t: 'choice', id: 'a4.reflect', label: 'REFLECT · 나는 다음 수행평가에서 무엇을 가장 먼저 명확히 해야 하는가?', opts: ['활용범위', '과정증거', '공정성', '안전', '교사판단'] }
  ]);

  /* ===================== 2차시 ===================== */
  A('b0', 2, 'STEP 0 · 생성형 AI에 넣기 전 5가지 준비', [
    I('<p>사용 도구: ChatGPT·Claude·Gemini 등 학교에서 접근 가능한 생성형 AI 중 하나를 선택합니다. AI가 초안을 돕되 <b>성취기준 해석, 평가요소, AI 허용 범위, 최종 판단은 교사가 결정</b>합니다.</p><p>성취기준은 AI에게 찾게 하지 말고 <b>본인이 사용하는 교육과정 원문</b>을 붙여 넣으세요.</p>'),
    T('b0.subject', '교과·학년', { rows: 1, ph: '예) 중학교 2학년 국어' }),
    T('b0.standard', '단원·성취기준', { rows: 2, ph: '교육과정 원문을 붙여 넣으세요 (예시: [9국02-03] 주장과 근거…)' }),
    T('b0.task', '현재 수행평가', { rows: 2, ph: '기존 과제명·과제 유형' }),
    T('b0.output', '현재 제출 결과물', { rows: 2, ph: '최종 제출 형태' }),
    T('b0.problem', '가장 고민되는 평가 문제 1가지', { rows: 2, fill: 'a1.hard' }),
    I(PRIVACY, 'warn')
  ]);

  A('p1', 2, 'PROMPT 1 · 기존 수행평가 진단', [
    { t: 'prompt', n: 1, title: '기존 수행평가 진단', base: '다음 수행평가의 교육적 목적은 유지하면서, AI 시대에 학생의 실제 배움이 가려질 수 있는 지점을 찾아줘. 성취기준과 과제에서 확인 가능한 내용만 분석하고, 강점 2개·위험지점 3개·교사가 확인할 질문 3개로 정리해줘.', ctx: STEP0_CTX, rid: 'p1.result', fid: 'p1.final', flabel: '내가 수정·정리한 결과 (강점 · 위험지점 · 확인할 질문 중 동의하는 것)', tip: 'AI에게 정답을 맡기는 게 아니라, 내가 놓친 설계 위험을 점검하는 용도로 사용합니다.' }
  ]);
  A('p2', 2, 'PROMPT 2 · 단계별 허용·제한·금지', [
    { t: 'prompt', n: 2, title: '단계별 허용·제한·금지', base: '다음 수행평가를 단계별로 나누고 AI 활용을 허용·제한·금지로 제안해줘. 각 결정의 이유를 성취기준·평가목표와 연결하고, 허용 시 학생이 남겨야 할 기록도 함께 제안해줘.', ctx: STEP0_CTX.concat([['1차시에 정한 AI 활용 범위 초안', 'a3.summary']]), rid: 'p2.result', fid: 'p2.final', flabel: '내가 확정한 단계별 허용·제한·금지와 이유', tip: '1차시 초안과 비교해 이유가 성취기준·평가목표와 연결되는지 확인하세요.' }
  ]);
  A('p3', 2, 'PROMPT 3 · AI가 답을 대신하기 어려운 과제로 바꾸기', [
    I('<p><b>재설계 방향</b> ① 개인·지역 맥락 반영 ② 비교·선택·근거 ③ 검토·수정 (AI 답변을 검토·수정하고 이유를 기록)</p>'),
    { t: 'prompt', n: 3, title: 'AI가 답을 대신하기 어려운 과제로 바꾸기', base: '기존 수행평가의 교육적 목적은 유지하되, 학생이 비교·선택·근거제시·검토·수정 과정을 보여주도록 과제를 재설계해줘. 학생 개인의 판단이 드러나는 산출물을 포함해줘.', ctx: STEP0_CTX, rid: 'p3.result', fid: 'p3.final', flabel: '내가 확정한 재설계 과제', tip: '학생 개인의 판단이 드러나는 산출물이 포함되었는지 확인하세요.' }
  ]);
  A('p4', 2, 'PROMPT 4 · 과정 증거', [
    I('<p>AI에게 증거 후보 6개를 요청한 뒤 <b>교사가 3~4개만 선택</b>합니다. 모든 것을 다 받으면 부담이 큽니다. 내 평가 목표를 보여주는 <b>최소 증거</b>만 고르세요.</p>'),
    { t: 'prompt', n: 4, title: '과정 증거', base: '이 수행평가에서 학생의 실제 배움을 확인할 수 있는 과정 증거 후보 6개를 제안해줘. 학생 기록, 교사 관찰을 함께 포함하고, 수업 운영 부담이 적은 순서로 정리해줘.', ctx: STEP0_CTX.concat([['재설계 과제', 'p3.final']]), rid: 'p4.result', fid: 'p4.final', flabel: '내가 선택한 과정 증거 3~4개 (수집 시점 포함)', tip: '실제 수업시간에 수집 가능한지 기준으로 3~4개만 남기세요.' }
  ]);
  A('rec', 2, '학생 AI 활용 기록 · 현장용 최소 양식', [
    I('<p>기록을 많이 받는 것이 목적이 아닙니다. 평가 판단에 꼭 필요한 <b>최소 증거</b>만 받습니다. 학생 이름·학번 입력은 금지합니다.</p><ul><li>사용한 AI 도구 / 사용 목적</li><li>입력한 주요 질문(프롬프트)</li><li>AI 결과 중 사용·수정·참고한 부분</li><li>채택·불채택한 이유</li><li>확인한 출처 / 최종 판단</li></ul><p><b>준수 체크와 점수 루브릭은 분리</b> 허용 범위·기록·출처·개인정보 준수는 체크하고, 점수는 교과 개념 이해·근거·판단·수정·성찰 등 실제 성취를 중심으로 부여합니다.</p>'),
    T('rec.custom', '내 수업에 맞게 줄이거나 고친 학생 기록 항목 (선택)', { rows: 4, opt: true, ph: '예) 1 처음 판단 / 2 검토 경로 / 3 핵심 질문과 자료 / 4 선택과 이유 / 5 다음 확인', fillText: '① 처음 판단: 자료를 보기 전 또는 활동 초반 내가 생각한 것은 무엇인가?\n② 검토 경로: 사용한 AI 도구와 목적 또는 AI 미사용 방법은 무엇인가?\n③ 핵심 질문과 자료: 확인한 주요 질문, 자료의 이름·위치, 핵심 내용은 무엇인가?\n④ 선택과 이유: 사용·수정·불채택·유지한 내용과 그 이유는 무엇인가?\n⑤ 다음 확인: 아직 부족한 근거와 다음에 확인할 방법은 무엇인가?', fillLabel: '보충자료 양식 예시 넣기' })
  ]);
  A('p5', 2, 'PROMPT 5 · 평가 요소', [
    { t: 'prompt', n: 5, title: '평가 요소', base: '성취기준과 과제에서 직접 확인 가능한 평가 요소를 제안해줘. AI 사용량 자체는 점수 요소로 두지 말고, 교과 내용 이해·근거·판단·수정·성찰 중 핵심 3~4개로 압축해줘.', ctx: STEP0_CTX.concat([['재설계 과제', 'p3.final']]), rid: 'p5.result', fid: 'p5.final', flabel: '내가 확정한 평가 요소 3~4개', tip: 'AI 사용 여부·사용량이 점수 요소로 들어가지 않았는지 확인하세요.' }
  ]);
  A('p6', 2, 'PROMPT 6 · 질문형 피드백', [
    I('<p><b>피해야 할 피드백</b> “틀렸다”, “수정하세요” 같은 단정형 표현 → <b>질문형 피드백</b> “왜 그렇게 판단했는가?” “어떤 근거를 추가하면 판단이 더 설득력 있을까?”</p><p>연습에는 가상의 증거를 사용하세요. 실제 학생 정보는 넣지 않습니다.</p>'),
    { t: 'prompt', n: 6, title: '질문형 피드백', base: '교사의 평가 결과와 비식별화된 학생 증거를 바탕으로, 정답을 대신 제시하지 않고 학생이 다시 생각할 수 있는 질문형 피드백 2문장을 작성해줘.', ctx: [], inputs: [{ id: 'p6.judge', label: '교사의 평가 결과 (가상)', rows: 2 }, { id: 'p6.evid', label: '비식별화된 학생 증거 (가상)', rows: 3 }], rid: 'p6.result', fid: 'p6.final', flabel: '내가 학생 맥락에 맞게 고친 질문형 피드백', tip: 'AI 초안을 그대로 쓰지 않고 학생 맥락에 맞게 교사가 수정합니다.' }
  ]);
  A('p7', 2, 'PROMPT 7 · 평가계획서 반영 문구', [
    I('<p>① AI 활용 가능 단계와 금지 단계 명시 ② AI 활용 시 기록해야 할 내용 명시 ③ 개인정보 입력 금지와 출처 확인 안내 ④ 평가는 교과 성취·판단·수정 과정 중심으로 실시</p><p class="small muted">※ 문구는 학교 학업성적관리규정과 교과 평가계획에 맞게 교사가 최종 수정합니다.</p>'),
    { t: 'prompt', n: 7, title: '평가계획서 반영 문구', base: 'AI 활용 가능 단계와 금지/제한 단계, 활용 시 기록할 내용, 개인정보 입력 금지와 출처 확인, 교과 성취·판단·수정 과정 중심 평가 원칙이 드러나는 평가계획서 문구 초안을 작성해줘.', ctx: [['교과·학년', 'b0.subject'], ['AI 허용·제한·금지 (내가 확정한 것)', 'p2.final'], ['과정 증거 (내가 확정한 것)', 'p4.final'], ['평가 요소 (내가 확정한 것)', 'p5.final']], rid: 'p7.result', fid: 'p7.final', flabel: '내가 최종 수정한 평가계획서 반영 문구', tip: '마지막 문장은 반드시 내가 직접 고칩니다.' }
  ]);
  A('safe', 2, '안전·접근성 체크 · 설계가 끝나기 전 마지막 점검', [
    I('<p>좋은 평가는 기술을 쓸 수 있는 학생뿐 아니라 모든 학생이 성취를 보여줄 수 있게 합니다.</p>'),
    { t: 'checks', items: [
      { id: 'safe.1', label: '사용 연령·동의 — 사용 연령과 보호자 동의 필요 여부를 확인했다' },
      { id: 'safe.2', label: '개인정보 — 개인정보·민감정보·파일 메타데이터에 주의했다' },
      { id: 'safe.3', label: '접근성 대안 — AI 사용이 어려운 학생을 위한 대체 방법이 있다' },
      { id: 'safe.4', label: 'AI 미사용 경로 — AI 없이도 같은 성취기준을 증명할 경로가 있다' }
    ] },
    T('safe.memo', '메모 (선택)', { rows: 2, opt: true })
  ]);
  A('six', 2, '내 수행평가 6칸 설계안', [
    I('<p>너무 자세한 새 평가계획서를 만드는 시간이 아닙니다. 학교에서 바로 바꿀 수 있는 <b>핵심 6가지</b>만 완성합니다. 각 칸의 <b>불러오기</b> 버튼으로 앞에서 정리한 내용을 가져올 수 있습니다.</p>'),
    { t: 'six', cells: [
      { id: 'six.1', no: '칸 01', title: '① 성취기준·평가목표', ph: '성취기준 원문과 이번 평가에서 확인할 배움', fill: 'b0.standard' },
      { id: 'six.2', no: '칸 02', title: '② 재설계 과제', fill: 'p3.final' },
      { id: 'six.3', no: '칸 03', title: '③ AI 허용·제한·금지', fill: 'p2.final' },
      { id: 'six.4', no: '칸 04', title: '④ 과정 증거 3~4개', fill: 'p4.final' },
      { id: 'six.5', no: '칸 05', title: '⑤ 평가 요소 3~4개', fill: 'p5.final' },
      { id: 'six.6', no: '칸 06', title: '⑥ 평가계획서 반영 문구', fill: 'p7.final', last: true }
    ] },
    { t: 'checks', items: [{ id: 'six.chk', label: '⑥ 평가계획서 반영 문구의 마지막 문장을 내가 직접 고쳤다 (AI가 만든 초안을 그대로 제출하지 않는다)' }] }
  ]);
  A('xcheck', 2, '설계안 자기 점검 (교차 검토를 개인 활동으로)', [
    I('<p>2인 교차 검토를 <b>개인 자기 점검</b>으로 바꿉니다. 6칸 설계안을 처음 보는 동료의 눈으로 읽어 보고, <b>좋은 점 1개 + 수정 제안 1개</b>만 남깁니다.</p>'),
    { t: 'recall', title: '내 6칸 설계안 보기', items: [['① 성취기준·평가목표', 'six.1'], ['② 재설계 과제', 'six.2'], ['③ AI 허용·제한·금지', 'six.3'], ['④ 과정 증거', 'six.4'], ['⑤ 평가 요소', 'six.5'], ['⑥ 평가계획서 문구', 'six.6']] },
    { t: 'checks', items: [
      { id: 'x.1', label: 'AI 범위의 이유가 평가목표와 연결되는가?', memo: 'x.1.m' },
      { id: 'x.2', label: '과정 증거가 실제 수업시간에 수집 가능한가?', memo: 'x.2.m' },
      { id: 'x.3', label: '평가 요소가 AI 사용량이 아니라 교과 성취를 보는가?', memo: 'x.3.m' },
      { id: 'x.4', label: '개인정보·접근성·AI 미사용 대안이 고려되었는가?', memo: 'x.4.m' }
    ] },
    T('x.good', '좋은 점 1개', { rows: 2 }),
    T('x.suggest', '수정 제안 1개', { rows: 2 }),
    T('x.fix', '2차시 최종 수정할 한 가지', { rows: 2 })
  ]);
  A('b9', 2, '2차시 마무리 · 산출물 체크리스트', [
    { t: 'checks', items: [
      { id: 'b9.1', label: '과제가 재설계되었다' },
      { id: 'b9.2', label: '단계별 AI 범위가 명시되었다' },
      { id: 'b9.3', label: '과정 증거가 구체화되었다' },
      { id: 'b9.4', label: '평가 요소가 선정되었다' },
      { id: 'b9.5', label: '평가계획서 문구가 작성되었다' }
    ] }
  ]);

  /* ===================== 3차시 ===================== */
  A('c1', 3, 'STEP 1 · 평가 요소를 3~4개로 압축', [
    I('<p>2차시 요소를 실제 채점 가능한 수준으로 압축합니다. 후보를 누르면 비어 있는 칸에 들어갑니다. (교과 개념 이해 / 근거의 타당성 / 정보 신뢰성 / 판단·수정 / 성찰 / 기타)</p>'),
    { t: 'recall', title: '2차시 ⑤ 평가 요소', items: [['평가 요소', 'six.5']] },
    { t: 'chips', items: ['교과 개념 이해', '근거의 타당성', '정보 신뢰성', '판단·수정', '성찰'], targets: ['c1.1', 'c1.2', 'c1.3', 'c1.4'] },
    { t: 'mx', head: ['최종 선택', '평가 요소'], rows: [
      { label: '①', cells: [{ id: 'c1.1', k: 'text' }] },
      { label: '②', cells: [{ id: 'c1.2', k: 'text' }] },
      { label: '③', cells: [{ id: 'c1.3', k: 'text' }] },
      { label: '④', cells: [{ id: 'c1.4', k: 'text' }], opt: true }
    ], noReq: 3 }
  ]);
  var lv = function (i) { return [{ id: 'c2.' + i + '.hi', k: 'area', rows: 3 }, { id: 'c2.' + i + '.mid', k: 'area', rows: 3 }, { id: 'c2.' + i + '.lo', k: 'area', rows: 3 }]; };
  A('c2', 3, 'STEP 2 · 상·중·하를 관찰 가능한 행동으로 쓰기', [
    I('<p>“잘함·보통·미흡”만 쓰면 채점자마다 의미가 달라집니다. 학생이 <b>어떤 행동을 하는지</b>로 씁니다. AI 사용 여부가 자동으로 가점·감점되지 않게 합니다.</p><p class="small muted">예) 상: 근거를 비교해 AI 결과를 비판적으로 검토하고 수정 이유를 설명함 / 중: 일부 수정했으나 근거 또는 설명이 충분하지 않음 / 하: AI 결과를 거의 그대로 사용하거나 수정 이유를 설명하지 못함</p>'),
    { t: 'mx', head: ['평가 요소', '상', '중', '하'], rows: [
      { labelFrom: 'c1.1', label: '평가 요소 ①', cells: lv(1) },
      { labelFrom: 'c1.2', label: '평가 요소 ②', cells: lv(2) },
      { labelFrom: 'c1.3', label: '평가 요소 ③', cells: lv(3) },
      { labelFrom: 'c1.4', label: '평가 요소 ④', cells: lv(4), opt: true }
    ], noReq: 6, scroll: true }
  ]);

  var scoreRows = function (s) {
    return C.elements.map(function (name, i) {
      return { label: name, cells: [
        { id: 'cs.' + s + '.' + i + '.lv', k: 'select', opts: ['상', '중', '하', '확인 보류'] },
        { id: 'cs.' + s + '.' + i + '.ev', k: 'text', ph: '예) A1, B2' },
        { id: 'cs.' + s + '.' + i + '.why', k: 'area', rows: 2, ph: '판단 근거 한 문장' }
      ] };
    });
  };
  A('cs', 3, '같은 학생 자료를 각자 채점해보기 (공통 사례)', [
    I('<p>같은 학생 자료를 <b>연습용 공통 루브릭</b>으로 판단합니다. 판단 근거는 증거 번호(A1, B2 …)로 남깁니다. 총점으로 합산하지 않습니다. 실제 학생 정보는 없는 가상 사례입니다.</p>'),
    { t: 'casehub' },
    I('<p><b>학생 A</b> — 지금 자료로 판단할 수 있는 요소와 확인이 필요한 요소를 나누세요.</p>'),
    T('cs.A.prod', '학생 산출물에서 확인한 핵심 증거', { rows: 2 }),
    T('cs.A.proc', '과정 증거에서 확인한 핵심 증거', { rows: 2 }),
    { t: 'mx', head: ['평가 요소', '수준', '증거 번호', '판단 근거 한 문장'], rows: scoreRows('A'), noReq: 3 },
    I('<p><b>학생 B</b></p>'),
    T('cs.B.prod', '학생 산출물에서 확인한 핵심 증거', { rows: 2 }),
    T('cs.B.proc', '과정 증거에서 확인한 핵심 증거', { rows: 2 }),
    { t: 'mx', head: ['평가 요소', '수준', '증거 번호', '판단 근거 한 문장'], rows: scoreRows('B'), noReq: 3 }
  ]);
  A('rc', 3, '판단 차이 살피기 · 루브릭 자기 재검토 (비교를 개인 활동으로)', [
    I('<p>판정이 다른 것은 실패가 아닙니다. <b>루브릭에서 고쳐야 할 지점을 찾는 데이터</b>입니다. (옆 사람과 비교 → <b>‘다른 교사가 다르게 판단한다면?’을 스스로 점검</b>)</p><p>학생 A 또는 B에서 “내가 ‘상’으로 본 요소를 다른 교사가 ‘중’으로 본다면?”을 하나 골라 다음 네 가지를 점검하세요.</p>'),
    { t: 'checks', items: [
      { id: 'rc.1', label: '기준 문장이 모호했는가?' },
      { id: 'rc.2', label: '어떤 증거를 볼지 합의되지 않았는가?' },
      { id: 'rc.3', label: 'AI 활용 준수와 교과 성취를 혼동했는가?' },
      { id: 'rc.4', label: '수준 간 경계가 너무 넓었는가?' }
    ] },
    T('rc.alt', '다른 교사가 다르게 판단할 수 있는 요소와 수준 (그 이유)', { rows: 3 }),
    T('rc.fix', '루브릭에서 수정할 부분', { rows: 2 }),
    I('<p><b>내 과제의 루브릭으로 돌아가기</b> 공동 채점에서 배운 점을 2차시에 설계한 내 수행평가(STEP 2 루브릭)에 적용합니다.</p>'),
    T('rc.before', '수정 전 문장', { rows: 2 }),
    T('rc.after', '수정 후 문장', { rows: 2 }),
    T('rc.why', '이렇게 수정한 이유', { rows: 2 })
  ]);
  A('obs', 3, '교사 직접 관찰 체크', [
    I('<p>관찰 체크는 감시가 아니라 학생의 실제 수행 과정을 확인하는 <b>별도 증거</b>입니다. 학생 B 사례(B4)를 관찰했다고 가정하거나, 내 수업의 학생을 떠올려 체크합니다.</p>'),
    { t: 'checks', items: [
      { id: 'obs.1', label: '과제를 자신의 말로 설명하고 시작하는가?', memo: 'obs.1.m' },
      { id: 'obs.2', label: 'AI 결과를 그대로 수용하지 않고 비교·질문하는가?', memo: 'obs.2.m' },
      { id: 'obs.3', label: '수정 이유를 말하거나 기록할 수 있는가?', memo: 'obs.3.m' },
      { id: 'obs.4', label: '동료와 근거를 주고받으며 판단을 조정하는가?', memo: 'obs.4.m' }
    ] }
  ]);
  A('oral', 3, '필요 시 짧은 구술 확인 1~2문항', [
    I('<p>구술 확인은 1~2문항이면 충분합니다. 학생을 추궁하지 않고, AI 사용을 잡아내기 위한 심문이 아니라 <b>제출 증거와 학생 이해가 연결되는지</b> 확인합니다.</p><p class="small muted">예) “이 부분을 왜 이렇게 수정했나요?” / “AI 답변 중 사용하지 않은 것은 무엇이고 왜 그랬나요?” / “이 결론을 어떤 교과 개념으로 설명할 수 있나요?”</p>'),
    T('oral.q1', '질문 1', { rows: 2 }),
    T('oral.q2', '질문 2', { rows: 2, opt: true })
  ]);
  A('fb', 3, '교사 판단 이후 · 질문형 피드백 초안 만들기', [
    I('<p>AI에게 먼저 채점시키지 않습니다. <b>교사가 평가한 뒤</b>, 필요한 증거만 비식별화해 표현을 지원받습니다. (① 교사가 루브릭으로 먼저 판단 → ② 근거 증거를 비식별화 → ③ AI에 초안 요청 → ④ 교사가 수정·확정)</p>'),
    { t: 'prompt', n: 8, label: '질문형 피드백 프롬프트', title: '질문형 피드백', base: '교사의 평가 결과 + 비식별화된 학생 증거 + 개선이 필요한 1가지를 바탕으로, 정답을 대신 제시하지 않고 학생이 다시 생각할 수 있는 질문형 피드백 2문장으로 작성해줘.', ctx: [], inputs: [
      { id: 'fb.judge', label: '교사의 평가 결과', rows: 2 }, { id: 'fb.evid', label: '비식별화된 학생 증거', rows: 3 }, { id: 'fb.improve', label: '개선이 필요한 1가지', rows: 2 }
    ], sample: { label: '학생 B 사례로 채우기', values: { 'fb.judge': 'sampleJudge', 'fb.evid': '(B2) 자료 1이 매점 제공량임을 확인하고 학교 전체로 결론을 넓히기 어렵다고 적음. (B3) 처음 쓴 ‘모든 학교에 효과’를 삭제한 이유를 자료 2와 연결해 적음. (B4) 50% 계산 방법을 말로 설명함.', 'fb.improve': '성찰(B5)의 다음 확인 계획이 “더 꼼꼼히 읽겠다”로 일반적임' } }, rid: 'fb.result', fid: 'fb.final', flabel: '내가 확정한 학생 피드백', tip: '학생 이름·학번·민감정보와 확인되지 않은 사실은 넣지 않습니다. 학생 기록을 통째로 넣지 않고 필요한 증거만 비식별화해 사용합니다.' }
  ]);
  A('rc3', 3, '평가 증거에서 기록 후보로 연결하기 (교과세특 후보 문장)', [
    I('<p>교과세특은 <b>‘자동 작성’이 아니라 ‘후보 문장’</b>입니다. 교사가 수업·평가 중 직접 관찰·확인한 사실만 사용하고, 학생 성향·역량을 추측하거나 없는 활동을 추가하지 않습니다. 이 활동은 연습이며 실제 학생부 입력 문장을 확정하는 작업이 아닙니다.</p>'),
    { t: 'prompt', n: 9, label: '관찰 증거 기반 기록 후보 프롬프트', title: '관찰 증거 기반 기록 후보', base: '제공된 증거만 사용해 교과 학습 과정과 성장을 드러내는 기록 후보 문장 2개를 작성해줘. 확인되지 않은 해석·성격 판단·과장은 추가하지 마. 각 후보 뒤에 근거 번호를 별도로 적어줘.', ctx: [], inputs: [{ id: 'rc3.evid', label: '학생A로 익명화한 활동 증거 3~4개', rows: 4 }], sample: { label: '연습용 증거로 채우기', values: { 'rc3.evid': '(1) 수업 중 관찰: 학생A가 표의 평균을 가리키며 50% 계산 방법을 설명함.\n(2) AI 결과 검토 메모: 학생A가 AI가 제안한 구매 인원 비교 질문을 참고해 자료 2와 대조함.\n(3) 수정 이유 메모: ‘모든 학교에 효과’라는 문장을 삭제하고 그 이유를 자료의 조사 범위와 연결해 적음.\n(4) 동료 활동 메모: 조사 범위에 대해 동료와 근거를 주고받으며 판단을 정리함.' } }, rid: 'rc3.result', fid: 'rc3.final', flabel: '내가 선택·수정한 기록 후보 문장', tip: '출력 후 한 문장을 골라 직접 수정하세요. 추측·성격 판단·과장이 없는지 확인합니다.' }
  ]);
  A('pkg', 3, '한 학생의 증거 패키지 완주', [
    I('<p>평가 → 피드백 → 기록이 하나의 증거 흐름으로 연결됩니다.</p>'),
    { t: 'checks', items: [
      { id: 'pkg.1', label: '① 산출물·과정 증거·관찰 기록 확인' },
      { id: 'pkg.2', label: '② 루브릭으로 교사가 직접 판단' },
      { id: 'pkg.3', label: '③ 필요 시 구술 확인 질문 작성' },
      { id: 'pkg.4', label: '④ 질문형 피드백 초안 생성 → 교사 수정' },
      { id: 'pkg.5', label: '⑤ 관찰 증거 기반 기록 후보 → 교사 수정' }
    ] }
  ]);
  A('plan', 3, '다음 수업에서 바로 바꿀 한 가지 · 실행 계획', [
    I('<p>자동화하려는 것은 교사의 전문성이 아니라 <b>반복 업무</b>입니다.</p>'),
    T('plan.task', '적용할 수행평가', { rows: 2, fill: 'a1.task' }),
    T('plan.change', '바꿀 한 가지', { rows: 2, ph: '예) 최종본과 함께 “수정 이유 한 문장”을 제출하게 한다' }),
    T('plan.when', '적용 시기/방법', { rows: 2 }),
    T('plan.learn', '확인할 배움 (선택)', { rows: 2, opt: true }),
    T('plan.alt', 'AI 미사용자의 대체 경로 (선택)', { rows: 2, opt: true }),
    { t: 'checks', title: '적용 전 점검 (선택)', items: [
      { id: 'plan.k1', label: '성취기준 원문과 평가 목표가 연결된다' },
      { id: 'plan.k2', label: 'AI 허용·제한·금지 단계와 조건을 학생이 이해할 수 있다' },
      { id: 'plan.k3', label: '핵심 수행과 증거를 수업 중 확인할 수 있다' },
      { id: 'plan.k4', label: '증거 3~4개로 필요한 배움을 확인할 수 있다' },
      { id: 'plan.k5', label: 'AI 미사용 경로에도 같은 성취 기준을 적용할 수 있다' },
      { id: 'plan.k6', label: '판단 근거가 부족한 경우의 추가 확인 방법이 있다' },
      { id: 'plan.k7', label: '피드백이 다음 학습 행동으로 이어진다' },
      { id: 'plan.k8', label: '기록 후보의 모든 표현이 관찰·확인한 증거와 연결된다' }
    ], opt: true }
  ]);
  A('exit', 3, '마지막 성찰 · 출구표', [
    T('exit.reflect', '내 평가의 전문성이 반드시 남아야 할 지점은 무엇인가?', { rows: 3 }),
    T('exit.sentence', '오늘 내가 수정한 가장 중요한 문장', { rows: 2, opt: true }),
    T('exit.why', '그 문장을 바꾼 이유', { rows: 2, opt: true }),
    T('exit.left', '아직 남은 질문', { rows: 2, opt: true }),
    T('exit.next', '다음에 더 다루고 싶은 내용', { rows: 2, opt: true })
  ]);

  /* ---------- 요약 문자열 (프롬프트 자동 조립용) ---------- */
  var computed = {
    'a3.summary': function (get) {
      var names = ['개념 이해·사전 학습', '아이디어·자료 탐색', '초안·개요 작성', '실제 수행평가 핵심 단계', '피드백·고쳐쓰기'];
      var out = [];
      for (var i = 1; i <= 5; i++) {
        var m = get('a3.' + i + '.m');
        if (m) out.push(names[i - 1] + ': ' + m + (get('a3.' + i + '.w') ? ' (' + get('a3.' + i + '.w') + ')' : ''));
      }
      return out.join('\n');
    },
    sampleJudge: function (get) {
      var parts = [];
      C.elements.forEach(function (n, i) { var v = get('cs.B.' + i + '.lv'); if (v) parts.push(n + ' ' + v); });
      return parts.length ? '학생 B: ' + parts.join(', ') : '학생 B: 근거와 한계 검토 상, 성찰과 다음 확인 계획 중';
    }
  };

  /* ---------- 블록 순회: 필수 항목·전체 필드 ---------- */
  function eachBlockField(block, cb) {
    var t = block.t;
    if (t === 'text') cb({ ids: [block.id], label: block.label, opt: block.opt });
    else if (t === 'mx') {
      block.rows.forEach(function (r) {
        r.cells.forEach(function (c, ci) {
          cb({ ids: [c.id], label: (r.label || '') + ' · ' + (block.head[ci + 1] || ''), opt: block.noReq ? true : (r.opt || c.opt) });
        });
      });
      if (block.noReq) {
        var all = [];
        block.rows.forEach(function (r) { if (!r.opt) r.cells.forEach(function (c) { all.push(c.id); }); });
        cb({ ids: all, label: '표의 내용 (최소 ' + block.noReq + '칸 작성)', opt: false, need: Math.min(block.noReq, all.length), synthetic: true });
      }
    } else if (t === 'checks') {
      if (!block.opt) cb({ ids: block.items.map(function (i) { return i.id; }), label: block.title || '체크 항목', opt: false, group: true });
      block.items.forEach(function (i) { if (i.memo) cb({ ids: [i.memo], label: i.label + ' (메모)', opt: true }); });
      if (block.opt) block.items.forEach(function (i) { cb({ ids: [i.id], label: i.label, opt: true }); });
    } else if (t === 'choice') cb({ ids: [block.id], label: block.label, opt: block.opt });
    else if (t === 'prompt') {
      (block.inputs || []).forEach(function (f) { cb({ ids: [f.id], label: f.label, opt: true }); });
      var pl = block.n <= 7 ? 'PROMPT ' + block.n : block.title;
      cb({ ids: [block.rid], label: pl + ' · AI 응답', opt: true });
      cb({ ids: [block.fid], label: pl + ' · ' + block.flabel, opt: false });
    } else if (t === 'formula') {
      block.fields.forEach(function (f) { cb({ ids: [block.id + '.' + f.k], label: f.label, opt: true }); });
      cb({ ids: [block.finalId], label: '핵심 평가 질문', opt: false });
    } else if (t === 'six') {
      block.cells.forEach(function (c) { cb({ ids: [c.id], label: c.title, opt: false }); });
    }
  }

  window.Worksheet = {
    acts: acts,
    order: order,
    computed: computed,
    sessions: [
      { no: 0, name: '오리엔테이션', short: '시작' },
      { no: 1, name: '1차시 · AI 시대, 무엇을 어떻게 평가할 것인가', short: '1차시' },
      { no: 2, name: '2차시 · 생성형 AI와 함께 내 수행평가 다시 설계하기', short: '2차시' },
      { no: 3, name: '3차시 · AI로 평가를 대신하지 않고 업무를 지원받기', short: '3차시' }
    ],
    eachField: function (act, cb) { act.blocks.forEach(function (b) { eachBlockField(b, cb); }); },
    /* 필수 항목 목록: [{ids,label,need}] */
    reqs: function (actId) {
      var out = [];
      this.eachField(acts[actId], function (f) { if (!f.opt) out.push(f); });
      return out;
    },
    allIds: function (actId) {
      var ids = [];
      this.eachField(acts[actId], function (f) { if (!f.synthetic) ids = ids.concat(f.ids); });
      return ids;
    },
    /* 상태: none | part | done */
    status: function (actId, get) {
      var reqs = this.reqs(actId), filled = 0, total = reqs.length;
      reqs.forEach(function (r) {
        var n = r.ids.filter(function (id) { return !!get(id); }).length;
        var need = r.need || 1;
        if (n >= need) filled++;
      });
      var any = this.allIds(actId).some(function (id) { return !!get(id); });
      var st = total && filled === total ? 'done' : (any || filled ? 'part' : 'none');
      return { state: st, filled: filled, total: total };
    },
    missing: function (actId, get) {
      return this.reqs(actId).filter(function (r) {
        var n = r.ids.filter(function (id) { return !!get(id); }).length;
        return n < (r.need || 1);
      });
    }
  };
})();
