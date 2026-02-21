import React, { useState } from 'react'

export default function App() {
  const [resume, setResume] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  async function handleMatch() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://career-planner.onrender.com/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, top_n: 3 })
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setFileName(f.name)
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', f)
      form.append('top_n', '3')
      const res = await fetch('https://career-planner.onrender.com/match-file', {
        method: 'POST',
        body: form
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Server error')
      }
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-root">
      <div className="topbar">
        <div className="brand">
          <div className="logo">CP</div>
          <div>
            <div className="title">Career Planner</div>
            <div className="subtitle">Paste your resume or skills — get role matches</div>
          </div>
        </div>
        <div className="actions">
          <button className="btn-ghost" onClick={() => { setResume(''); setResults(null); setError(null) }}>Reset</button>
          <button className="btn-primary" onClick={handleMatch} disabled={loading}>{loading ? 'Matching…' : 'Find Matches'}</button>
        </div>
      </div>

      <div className="main">
        <div className="left">
          <div className="card">
            <div className="input-area">
              <label style={{ display: 'block', marginBottom: 8, color: 'var(--muted)' }}>Upload PDF resume</label>
              <div className="file-row">
                <label className="file-input">
                  Choose file
                  <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <div className="file-name">{fileName || 'No file selected'}</div>
              </div>

              <label style={{ display: 'block', marginTop: 14, marginBottom: 8, color: 'var(--muted)' }}>Or paste resume / skills</label>
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste resume text or list skills here"
              />

              <div className="controls">
                <button className="btn-primary" onClick={handleMatch} disabled={loading}>{loading ? 'Matching…' : 'Find Matches'}</button>
                <button className="btn-ghost" onClick={() => { setResume(''); setResults(null); setError(null) }}>Clear</button>
              </div>
              {error && <div style={{ color: '#ff6b6b', marginTop: 10 }}>Error: {error}</div>}
            </div>
          </div>
        </div>

        <div className="right">
          <div className="card">
            <h2 style={{ margin: 0 }}>Top Matches</h2>
            {!results && <div className="summary">No results yet — submit your resume or skills to see matches.</div>}

            {results && (
              <div className="results">
                <div className="results-grid">
                  {results.top.map((r, i) => (
                    <div className="match-card" key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="job-title">{r.job_title}</div>
                          <div className="skills">{r.skills}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="score"> <span className="score-badge">{(r.score*100).toFixed(0)}%</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Best Match:</strong> {results.top.length ? results.top[0].job_title : '—'}
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>Missing skills:</strong> {results.missing.length ? results.missing.join(', ') : 'None detected'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
