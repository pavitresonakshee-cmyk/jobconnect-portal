const API = '/api', $ = s => document.querySelector(s), app = $('#app');
const S = { get token() { return localStorage.getItem('jc_token') }, get user() { return JSON.parse(localStorage.getItem('jc_user') || 'null') } };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = d => new Date(d).toLocaleDateString();
function toast(m) { const t = $('#toast'); t.textContent = m; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2800) }
async function api(path, method = 'GET', body, isForm) {
  const h = {}; if (S.token) h.Authorization = 'Bearer ' + S.token; if (body && !isForm) h['Content-Type'] = 'application/json';
  const r = await fetch(API + path, { method, headers: h, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.message || 'Request failed'); return d;
}
const form = e => Object.fromEntries(new FormData(e.target));
function logout() { localStorage.clear(); location.hash = '#/'; render() }
function nav() {
  const u = S.user;
  $('#nav').innerHTML = `<a href="#/">Jobs</a><a href="#/validation">Validation Practical</a>` + (u ? `<a href="#/dashboard">Dashboard</a><span class="meta"> ${esc(u.name)} (${u.role})</span><button onclick="logout()">Logout</button>`
    : `<a href="#/login">Login</a><a class="cta" href="#/register">Register</a>`);
}
// ---------- Pages ----------
const jobCard = j => `<div class="card"><h3>${esc(j.title)}</h3><div class="meta">${esc(j.company)} • ${esc(j.location)}</div>
 <div class="meta">${esc(j.salary || 'Salary not disclosed')} • Posted ${fmt(j.createdAt)}</div><span class="tag">${esc(j.type)}</span>
 <div class="row"><a class="btn sm" href="#/job/${j._id}">View details</a></div></div>`;
async function home() {
  app.innerHTML = `<section class="hero"><h1>Find your dream job</h1><p>Search thousands of vacancies and apply in minutes</p>
  <form class="search" id="sf"><input name="q" placeholder="Job title or company"><input name="location" placeholder="Location">
  <select name="type"><option value="">All types</option>${['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'].map(t => `<option>${t}</option>`).join('')}</select>
  <button class="btn">Search</button></form></section><h2>Latest jobs</h2><div class="grid" id="jobs">Loading…</div>`;
  const load = async (qs = '') => { const jobs = await api('/jobs' + qs); $('#jobs').innerHTML = jobs.map(jobCard).join('') || '<p>No jobs found.</p>' };
  $('#sf').onsubmit = e => { e.preventDefault(); load('?' + new URLSearchParams(form(e))) }; load();
}
async function jobDetail(id) {
  try {
    const j = await api('/jobs/' + id), u = S.user;
    app.innerHTML = `<div class="card"><h2>${esc(j.title)}</h2><div class="meta">${esc(j.company)} • ${esc(j.location)} • ${esc(j.type)} • ${esc(j.salary || '')}</div>
    <p style="margin:16px 0;white-space:pre-wrap">${esc(j.description)}</p>
    ${u && u.role === 'seeker' ? `<form id="af"><label>Cover letter</label><textarea name="coverLetter"></textarea><label>Resume (PDF/DOC, max 2MB)</label>
    <input type="file" name="resume" accept=".pdf,.doc,.docx" required><br><br><button class="btn">Apply now</button></form>`
        : !u ? '<a class="btn" href="#/login">Login to apply</a>' : ''}</div>`;
    const f = $('#af'); if (f) f.onsubmit = async e => { e.preventDefault(); try { await api('/applications/' + id, 'POST', new FormData(e.target), true); toast('Application submitted'); location.hash = '#/dashboard' } catch (x) { toast(x.message) } };
  } catch (x) { app.innerHTML = `<p>${esc(x.message)}</p>` }
}
function authPage(mode) {
  const reg = mode === 'register';
  app.innerHTML = `<form class="card box" id="f"><h2>${reg ? 'Create account' : 'Welcome back'}</h2>
  ${reg ? `<label>Full name</label><input name="name" required><label>I am a</label><select name="role"><option value="seeker">Job Seeker</option><option value="employer">Employer</option></select><label>Company (employers)</label><input name="company">` : ''}
  <label>Email</label><input type="email" name="email" required><label>Password</label><input type="password" name="password" minlength="6" required><br><br><button class="btn">${reg ? 'Register' : 'Login'}</button></form>`;
  $('#f').onsubmit = async e => { e.preventDefault(); try { const d = await api('/auth/' + mode, 'POST', form(e)); localStorage.setItem('jc_token', d.token); localStorage.setItem('jc_user', JSON.stringify(d.user)); location.hash = '#/dashboard'; render() } catch (x) { toast(x.message) } };
}
async function dashboard() {
  const u = S.user; if (!u) return location.hash = '#/login';
  if (u.role === 'seeker') {
    const a = await api('/applications/mine');
    app.innerHTML = `<h2>My Applications</h2><div class="stats"><div class="card stat"><b>${a.length}</b>Total applied</div><div class="card stat"><b>${a.filter(x => x.status === 'Accepted').length}</b>Accepted</div><div class="card stat"><b>${a.filter(x => x.status === 'Pending').length}</b>Pending</div></div>
    <div class="table-wrap"><table><tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr>${a.map(x => `<tr><td>${esc(x.job?.title || 'Removed')}</td><td>${esc(x.job?.company || '')}</td><td>${fmt(x.createdAt)}</td><td><span class="st ${x.status}">${x.status}</span></td></tr>`).join('')}</table></div>`;
  } else if (u.role === 'employer') employer();
  else admin();
}
async function employer(editing) {
  const [jobs, apps] = await Promise.all([api('/jobs/mine'), api('/applications/employer')]), e = editing || {};
  app.innerHTML = `<h2>Employer Dashboard</h2><div class="stats"><div class="card stat"><b>${jobs.length}</b>Active jobs</div><div class="card stat"><b>${apps.length}</b>Applications</div></div>
  <form class="card wide" id="jf" style="margin:0 0 20px"><h3>${e._id ? 'Update' : 'Add'} job</h3><label>Title</label><input name="title" value="${esc(e.title)}" required>
  <label>Company</label><input name="company" value="${esc(e.company || S.user.company)}" required><label>Location</label><input name="location" value="${esc(e.location)}" required>
  <label>Type</label><select name="type">${['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'].map(t => `<option ${e.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
  <label>Salary</label><input name="salary" value="${esc(e.salary)}"><label>Description</label><textarea name="description" required>${esc(e.description)}</textarea><br><br>
  <button class="btn">${e._id ? 'Save changes' : 'Post job'}</button> ${e._id ? '<button type="button" class="btn sec" id="cx">Cancel</button>' : ''}</form>
  <h2>My vacancies</h2><div class="table-wrap"><table><tr><th>Title</th><th>Location</th><th>Type</th><th>Posted</th><th>Actions</th></tr>${jobs.map(j => `<tr><td>${esc(j.title)}</td><td>${esc(j.location)}</td><td>${esc(j.type)}</td><td>${fmt(j.createdAt)}</td>
  <td><button class="btn sm" data-edit="${j._id}">Edit</button> <button class="btn sm red" data-del="${j._id}">Delete</button></td></tr>`).join('')}</table></div>
  <h2>Applications received</h2><div class="table-wrap"><table><tr><th>Applicant</th><th>Job</th><th>Resume</th><th>Status</th></tr>${apps.map(a => `<tr><td>${esc(a.seeker?.name)}<br><small>${esc(a.seeker?.email)}</small></td><td>${esc(a.job?.title)}</td><td>${a.resume ? `<a href="${a.resume}" target="_blank">Download</a>` : '-'}</td>
  <td><select data-st="${a._id}">${['Pending', 'Shortlisted', 'Accepted', 'Rejected'].map(s => `<option ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table></div>`;
  $('#jf').onsubmit = async ev => { ev.preventDefault(); try { e._id ? await api('/jobs/' + e._id, 'PUT', form(ev)) : await api('/jobs', 'POST', form(ev)); toast(e._id ? 'Job updated' : 'Job posted'); employer() } catch (x) { toast(x.message) } };
  if ($('#cx')) $('#cx').onclick = () => employer();
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => { employer(jobs.find(j => j._id === b.dataset.edit)); scrollTo(0, 0) });
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (confirm('Delete this job?')) { await api('/jobs/' + b.dataset.del, 'DELETE'); toast('Job deleted'); employer() } });
  document.querySelectorAll('[data-st]').forEach(s => s.onchange = async () => { await api(`/applications/${s.dataset.st}/status`, 'PUT', { status: s.value }); toast('Status updated') });
}
async function admin() {
  const [s, users, jobs] = await Promise.all([api('/admin/stats'), api('/admin/users'), api('/jobs')]);
  app.innerHTML = `<h2>Admin Dashboard</h2><div class="stats">${[['Job seekers', s.users], ['Employers', s.employers], ['Jobs', s.jobs], ['Applications', s.applications]].map(([l, n]) => `<div class="card stat"><b>${n}</b>${l}</div>`).join('')}</div>
  <h2>Recent activity</h2><div class="card"><p class="meta">Latest jobs: ${s.recentJobs.map(j => esc(j.title)).join(', ') || '-'}</p><p class="meta">New users: ${s.recentUsers.map(u => esc(u.name) + ' (' + u.role + ')').join(', ') || '-'}</p></div>
  <h2>Users</h2><div class="table-wrap"><table><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>${users.map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td><td>${u.role !== 'admin' ? `<button class="btn sm red" data-u="${u._id}">Delete</button>` : ''}</td></tr>`).join('')}</table></div>
  <h2>All jobs</h2><div class="table-wrap"><table><tr><th>Title</th><th>Company</th><th></th></tr>${jobs.map(j => `<tr><td>${esc(j.title)}</td><td>${esc(j.company)}</td><td><button class="btn sm red" data-j="${j._id}">Delete</button></td></tr>`).join('')}</table></div>`;
  document.querySelectorAll('[data-u]').forEach(b => b.onclick = async () => { if (confirm('Delete user?')) { await api('/admin/users/' + b.dataset.u, 'DELETE'); admin() } });
  document.querySelectorAll('[data-j]').forEach(b => b.onclick = async () => { if (confirm('Delete job?')) { await api('/jobs/' + b.dataset.j, 'DELETE'); admin() } });
}

async function validationPractical() {
  app.innerHTML = `<section class="hero"><h1>Server-Side Validation</h1></section>
    <div class="card wide" style="margin:0 auto 22px;max-width:760px">
      <h2 style="margin-top:0">Job Application Form</h2>
      <p class="meta">Enter the details below. Validation is performed on the Node.js server, not only in the browser.</p>
      <form id="validationForm" novalidate>
        <div class="validation-grid">
          <div><label for="vFullName">Full Name</label><input id="vFullName" name="fullName" placeholder="Enter your full name"><small class="field-error" data-error="fullName"></small></div>
          <div><label for="vEmail">Email Address</label><input id="vEmail" name="email" placeholder="name@example.com"><small class="field-error" data-error="email"></small></div>
          <div><label for="vPhone">Phone Number</label><input id="vPhone" name="phone" placeholder="10-digit mobile number"><small class="field-error" data-error="phone"></small></div>
          <div><label for="vRole">Job Role</label><input id="vRole" name="jobRole" placeholder="e.g. Node.js Developer"><small class="field-error" data-error="jobRole"></small></div>
          <div><label for="vExperience">Experience (years)</label><input id="vExperience" name="experience" type="number" min="0" max="50" step="0.5" placeholder="e.g. 1"><small class="field-error" data-error="experience"></small></div>
          <div><label for="vSkills">Skills</label><input id="vSkills" name="skills" placeholder="JavaScript, Node.js, MongoDB"><small class="field-error" data-error="skills"></small></div>
        </div>
        <label for="vCover">Cover Letter</label><textarea id="vCover" name="coverLetter" placeholder="Write at least 20 characters about your interest in this role."></textarea><small class="field-error" data-error="coverLetter"></small>
        <div id="validationResult" aria-live="polite"></div>
        <div class="row"><button class="btn" type="submit">Validate & Submit</button><button class="btn sec" type="reset" id="validationReset">Clear Form</button></div>
      </form>
    </div>
    <section class="card wide" style="max-width:900px;margin:0 auto"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Saved Valid Applications</h2><button class="btn sm sec" id="refreshValidation">Refresh Records</button></div><p class="meta">Only records that pass server-side validation are stored in the MongoDB collection <b>validationsubmissions</b>.</p><div class="table-wrap" id="validationRecords">Loading records…</div></section>`;

  const formEl = $('#validationForm');
  const clearErrors = () => document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  const loadRecords = async () => {
    try {
      const records = await api('/validation/applications');
      $('#validationRecords').innerHTML = records.length ? `<table><tr><th>Name</th><th>Email</th><th>Job Role</th><th>Experience</th><th>Submitted</th></tr>${records.map(r => `<tr><td>${esc(r.fullName)}</td><td>${esc(r.email)}</td><td>${esc(r.jobRole)}</td><td>${esc(r.experience)} years</td><td>${fmt(r.createdAt)}</td></tr>`).join('')}</table>` : '<p class="meta">No valid applications saved yet.</p>';
    } catch (e) { $('#validationRecords').textContent = e.message; }
  };
  formEl.onsubmit = async e => {
    e.preventDefault(); clearErrors(); $('#validationResult').innerHTML = '';
    const payload = form(e);
    try {
      const response = await fetch(API + '/validation/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) {
        Object.entries(result.errors || {}).forEach(([field, message]) => {
          const target = document.querySelector(`[data-error="${field}"]`);
          if (target) target.textContent = message;
        });
        $('#validationResult').innerHTML = `<p class="validation-error">${esc(result.message || 'Validation failed. Please check your details.')}</p>`;
        return;
      }
      $('#validationResult').innerHTML = `<p class="validation-success">${esc(result.message)} Application ID: ${esc(result.application.id)}</p>`;
      formEl.reset(); await loadRecords();
    } catch (error) {
      $('#validationResult').innerHTML = `<p class="validation-error">${esc(error.message || 'Unable to connect to the server.')}</p>`;
    }
  };
  $('#validationReset').onclick = () => { clearErrors(); $('#validationResult').innerHTML = ''; };
  $('#refreshValidation').onclick = loadRecords;
  loadRecords();
}

function render() {
  nav(); const [, p, id] = location.hash.slice(1).split('/'); window.scrollTo(0, 0);
  ({ '': home, undefined: home, login: () => authPage('login'), register: () => authPage('register'), dashboard, job: () => jobDetail(id), validation: validationPractical }[p] || home)()
}
addEventListener('hashchange', render); render();
