/* Karmi HR backend loader.
   - firebase-config.js পূর্ণ করা থাকলে: Firebase Auth (login) + Firestore (সবার জন্য এক ডেটা)।
   - না থাকলে: Local mode (ডেটা শুধু এই browser-এ থাকে)। */
(function(){
  var cfg=window.KARMI_FIREBASE;
  var configured=!!(cfg&&cfg.apiKey&&cfg.projectId&&String(cfg.apiKey).indexOf('PASTE')<0&&String(cfg.projectId).indexOf('PASTE')<0);

  var css=document.createElement('style');
  css.textContent=
   '#kb-login{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:var(--bg,#f2f5f3);font-family:var(--f-body,system-ui,sans-serif);color:var(--ink,#10201a)}'+
   '#kb-login form{width:100%;max-width:360px;background:var(--surface,#fff);border:1px solid var(--line,#e0e7e3);border-radius:14px;padding:26px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08))}'+
   '#kb-login h1{margin:0 0 4px;font:800 22px var(--f-head,system-ui,sans-serif)}'+
   '#kb-login p{margin:0 0 18px;color:var(--ink-2,#4a5b54);font-size:14px}'+
   '#kb-login label{display:block;font-size:13px;font-weight:600;margin:12px 0 5px}'+
   '#kb-login input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--track-strong,#c9d3ce);border-radius:9px;background:var(--surface-2,#f6f8f7);color:inherit;font:inherit}'+
   '#kb-login button.kb-go{width:100%;margin-top:18px;padding:11px;border:0;border-radius:9px;background:var(--accent,#0e5a4a);color:var(--accent-ink,#fff);font:700 15px var(--f-head,system-ui,sans-serif);cursor:pointer}'+
   '#kb-login button.kb-go[disabled]{opacity:.6;cursor:wait}'+
   '#kb-login .kb-link{background:none;border:0;color:var(--accent,#0e5a4a);font:inherit;font-size:13px;margin-top:12px;cursor:pointer;padding:0}'+
   '#kb-login .kb-msg{margin-top:12px;font-size:13px;min-height:18px}'+
   '#kb-login .kb-err{color:var(--crit-ink,#a32828)}#kb-login .kb-ok{color:var(--good-ink,#006300)}'+
   '.kb-pill{position:fixed;right:12px;bottom:12px;z-index:9000;display:flex;gap:8px;align-items:center;background:var(--surface,#fff);color:var(--ink-2,#4a5b54);border:1px solid var(--line,#e0e7e3);border-radius:999px;padding:6px 8px 6px 12px;font:12px var(--f-body,system-ui,sans-serif);box-shadow:var(--shadow,0 2px 8px rgba(0,0,0,.1))}'+
   '.kb-pill button{border:0;border-radius:999px;padding:5px 11px;background:var(--accent-soft,#e0efe9);color:var(--accent-soft-ink,#0b4a3d);font:600 12px var(--f-body,system-ui,sans-serif);cursor:pointer}'+
   '.kb-local{left:12px;right:auto;padding:6px 12px}';
  document.head.appendChild(css);

  function pill(html,cls){var d=document.createElement('div');d.className='kb-pill '+(cls||'');d.innerHTML=html;document.body.appendChild(d);return d}

  /* ---------------- Local mode (fallback) ---------------- */
  function localMode(){
    var KEY='karmi_hr_data_v1',subs=[],mem={};
    function load(){try{mem=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){mem={}}}
    function save(){try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){var er=new Error('quota');er.code='quota_exceeded';throw er}}
    function notify(){subs.slice().forEach(function(f){try{f()}catch(e){}})}
    function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
    function clone(x){return JSON.parse(JSON.stringify(x))}
    function sub(f){subs.push(f);setTimeout(f,0);return function(){subs=subs.filter(function(g){return g!==f})}}
    function docRef(col,id){return{id:id,
      set:function(d){mem[col]=mem[col]||{};mem[col][id]=clone(d);save();notify();return Promise.resolve()},
      update:function(d){mem[col]=mem[col]||{};mem[col][id]=Object.assign({},mem[col][id]||{},clone(d));save();notify();return Promise.resolve()},
      delete:function(){if(mem[col])delete mem[col][id];save();notify();return Promise.resolve()},
      onSnapshot:function(ok){return sub(function(){var has=!!(mem[col]&&mem[col][id]!==undefined);ok({exists:has,id:id,data:function(){return has?clone(mem[col][id]):undefined}})})}}}
    function query(col,o){return{
      orderBy:function(f,dir){return query(col,Object.assign({},o,{f:f,dir:dir||'asc'}))},
      limit:function(n){return query(col,Object.assign({},o,{n:n}))},
      onSnapshot:function(ok){return sub(function(){
        var rows=Object.keys(mem[col]||{}).map(function(id){return{id:id,d:mem[col][id]}});
        if(o.f)rows.sort(function(a,b){var x=a.d[o.f],y=b.d[o.f];var r=x>y?1:x<y?-1:0;return o.dir==='desc'?-r:r});
        if(o.n)rows=rows.slice(0,o.n);
        ok({docs:rows.map(function(r){return{id:r.id,exists:true,data:function(){return clone(r.d)}}})})})}}}
    var db={
      collection:function(col){var q=query(col,{});return{
        doc:function(id){return docRef(col,id||uid())},
        add:function(d){var id=uid();return docRef(col,id).set(d).then(function(){return docRef(col,id)})},
        orderBy:q.orderBy,limit:q.limit,onSnapshot:q.onSnapshot}},
      doc:function(path){var i=path.indexOf('/');return docRef(path.slice(0,i),path.slice(i+1))}};
    load();
    window.addEventListener('storage',function(e){if(e.key===KEY){load();notify()}});
    window.claude={use:function(){return Promise.resolve(db)}};
    document.addEventListener('DOMContentLoaded',function(){pill('Local mode · data stays in this browser','kb-local')});
  }

  /* ---------------- Firebase mode ---------------- */
  function firebaseMode(){
    var login=null;
    function showLogin(){
      if(login)return;
      login=document.createElement('div');login.id='kb-login';
      login.innerHTML=
       '<form autocomplete="on"><h1>Karmi HR</h1><p>Sign in to continue</p>'+
       '<label for="kb-email">Email</label><input id="kb-email" type="email" autocomplete="username" required>'+
       '<label for="kb-pass">Password</label><input id="kb-pass" type="password" autocomplete="current-password" required>'+
       '<button class="kb-go" type="submit">Sign in</button>'+
       '<button class="kb-link" type="button" id="kb-reset">Forgot password?</button>'+
       '<div class="kb-msg" id="kb-msg" role="alert"></div></form>';
      document.body.appendChild(login);
      var f=login.querySelector('form'),em=login.querySelector('#kb-email'),pw=login.querySelector('#kb-pass'),msg=login.querySelector('#kb-msg'),btn=login.querySelector('.kb-go');
      function say(t,ok){msg.textContent=t;msg.className='kb-msg '+(ok?'kb-ok':'kb-err')}
      function why(e){var c=e&&e.code||'';
        if(c==='auth/invalid-credential'||c==='auth/wrong-password'||c==='auth/user-not-found'||c==='auth/invalid-email')return 'Wrong email or password.';
        if(c==='auth/too-many-requests')return 'Too many attempts. Please wait a bit and try again.';
        if(c==='auth/network-request-failed')return 'No internet connection.';
        if(c==='auth/unauthorized-domain')return 'This domain is not authorized in Firebase (Authentication → Settings → Authorized domains).';
        return 'Could not sign in ('+(c||'unknown error')+').'}
      f.addEventListener('submit',function(ev){ev.preventDefault();say('');btn.disabled=true;
        firebase.auth().signInWithEmailAndPassword(em.value.trim(),pw.value).catch(function(e){say(why(e))}).then(function(){btn.disabled=false})});
      login.querySelector('#kb-reset').addEventListener('click',function(){
        if(!em.value.trim()){say('Type your email first.');return}
        firebase.auth().sendPasswordResetEmail(em.value.trim()).then(function(){say('Password reset email sent (check spam too).',true)},function(e){say(why(e))})});
    }
    function hideLogin(){if(login){login.remove();login=null}}
    function addPill(u){
      var p=pill('<span></span><button type="button">Sign out</button>');
      p.firstChild.textContent=u.email||'';
      p.querySelector('button').addEventListener('click',function(){firebase.auth().signOut()});
    }
    try{firebase.initializeApp(cfg)}catch(e){}
    window.claude={use:function(){return new Promise(function(resolve){
      var done=false;
      firebase.auth().onAuthStateChanged(function(u){
        if(u){hideLogin();if(!done){done=true;addPill(u);resolve(firebase.firestore())}}
        else{if(done){location.reload();return}
          if(document.body)showLogin();else document.addEventListener('DOMContentLoaded',showLogin)}
      })})}};
  }

  if(!configured){localMode();return}
  if(typeof firebase==='undefined'){
    window.claude={use:function(){return Promise.reject(new Error('Firebase SDK failed to load'))}};
    document.addEventListener('DOMContentLoaded',function(){pill('Firebase failed to load. Check your internet connection and reload.','kb-local')});
    return;
  }
  firebaseMode();
})();
