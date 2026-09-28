/* 입력값 저장소: localStorage 자동 저장 + 백업(.json) 내보내기/불러오기 */
(function () {
  var KEY = (window.CONFIG && CONFIG.storageKey) || 'aidx-training-v1';
  var memoryOnly = false;
  var listeners = [];
  var timer = null;

  function blank() { return { v: 1, profile: { name: '', org: '' }, data: {}, pos: 1, updated: 0 }; }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.data) { s.profile = s.profile || { name: '', org: '' }; return s; }
      }
    } catch (e) { memoryOnly = true; }
    return blank();
  }

  var state = load();

  function persist() {
    state.updated = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); memoryOnly = false; }
    catch (e) { memoryOnly = true; }
    emit('saved');
  }
  function schedule() {
    emit('saving');
    clearTimeout(timer);
    timer = setTimeout(persist, 350);
  }
  function emit(type) { listeners.forEach(function (fn) { try { fn(type); } catch (e) { console.error(e); } }); }

  window.addEventListener('beforeunload', function () { if (timer) { clearTimeout(timer); persist(); } });
  window.addEventListener('pagehide', function () { if (timer) { clearTimeout(timer); persist(); } });

  window.Store = {
    get: function (id) { var v = state.data[id]; return v === undefined ? '' : v; },
    set: function (id, v) {
      if (v === '' || v === false || v == null) delete state.data[id]; else state.data[id] = v;
      schedule();
    },
    profile: function () { return state.profile; },
    setProfile: function (p) { state.profile = { name: (p.name || '').trim(), org: (p.org || '').trim() }; schedule(); },
    hasProfile: function () { return !!state.profile.name; },
    pos: function () { return state.pos || 1; },
    setPos: function (n) { state.pos = n; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { memoryOnly = true; } },
    isMemoryOnly: function () { return memoryOnly; },
    hasAnyData: function () { return Object.keys(state.data).length > 0; },
    onChange: function (fn) { listeners.push(fn); },
    flush: function () { if (timer) { clearTimeout(timer); timer = null; persist(); } },
    exportJSON: function () {
      return JSON.stringify({ app: 'aidx-training', v: 1, exportedAt: new Date().toISOString(), profile: state.profile, data: state.data }, null, 2);
    },
    importJSON: function (text) {
      var o = JSON.parse(text);
      if (!o || o.app !== 'aidx-training' || typeof o.data !== 'object') throw new Error('연수 웹앱의 백업 파일이 아닙니다.');
      state = { v: 1, profile: o.profile || { name: '', org: '' }, data: o.data, pos: state.pos || 1, updated: Date.now() };
      persist();
    },
    clearAll: function () { state = blank(); try { localStorage.removeItem(KEY); } catch (e) {} emit('saved'); }
  };
})();
