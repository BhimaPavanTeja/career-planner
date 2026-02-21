const STOP_WORDS = new Set([
  'a','an','the','and','or','in','on','at','for','with','to','of','from','by','is','are','was','were','be','been','has','have','had','i','you','he','she','it','we','they','my','your','their','our'
])

function preprocess(text) {
  if (!text) return ''
  const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, ' ')
  const tokens = cleaned.split(/\s+/).filter(Boolean).map(t => t.trim())
  const kept = tokens.filter(t => !STOP_WORDS.has(t))
  return kept.join(' ')
}

function buildVocab(docsTokens) {
  const vocab = {}
  let idx = 0
  docsTokens.forEach(tokens => {
    tokens.forEach(t => {
      if (!(t in vocab)) vocab[t] = idx++
    })
  })
  return vocab
}

function tf(tokens, vocab) {
  const vec = new Array(Object.keys(vocab).length).fill(0)
  tokens.forEach(t => {
    if (t in vocab) vec[vocab[t]] += 1
  })
  const n = tokens.length || 1
  return vec.map(c => c / n)
}

function idf(docsTokens, vocab) {
  const N = docsTokens.length
  const df = new Array(Object.keys(vocab).length).fill(0)
  docsTokens.forEach(tokens => {
    const seen = new Set()
    tokens.forEach(t => {
      const id = vocab[t]
      if (id !== undefined && !seen.has(id)) { df[id] += 1; seen.add(id) }
    })
  })
  return df.map(d => Math.log((N + 1) / (d + 1)) + 1)
}

function multiply(tfVec, idfVec) {
  return tfVec.map((v, i) => v * (idfVec[i] || 0))
}

function dot(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] || 0) * (b[i] || 0)
  return s
}

function norm(a) {
  return Math.sqrt(a.reduce((s, v) => s + (v || 0) * (v || 0), 0))
}

function cosineSim(a, b) {
  const na = norm(a)
  const nb = norm(b)
  if (na === 0 || nb === 0) return 0
  return dot(a, b) / (na * nb)
}

export function getMatches(jobData, resumeText, topN = 3) {
  // jobData: [{job_title, skills}]
  const jobs = jobData.map(j => ({
    job_title: j.job_title,
    skills: j.skills,
    processed: preprocess(j.skills)
  }))
  const processedResume = preprocess(resumeText)

  const docs = jobs.map(j => j.processed)
  if (!processedResume.trim()) return { top: [], missing: [] }
  const allDocs = docs.concat([processedResume])
  const docsTokens = allDocs.map(d => d.split(/\s+/).filter(Boolean))
  const vocab = buildVocab(docsTokens)
  const idfVec = idf(docsTokens, vocab)

  const tfidfDocs = docsTokens.slice(0, docsTokens.length - 1).map(tokens => multiply(tf(tokens, vocab), idfVec))
  const resumeVec = multiply(tf(docsTokens[docsTokens.length - 1], vocab), idfVec)

  const similarities = tfidfDocs.map(v => cosineSim(resumeVec, v))
  const results = jobs.map((j, i) => ({
    job_title: j.job_title,
    skills: j.skills,
    score: similarities[i]
  }))
  results.sort((a, b) => b.score - a.score)

  // missing skills for top match
  const top = results.slice(0, topN)
  const resumeSet = new Set(processedResume.split(/\s+/).filter(Boolean))
  const missing = top.length ? [...new Set(top[0].skills.toLowerCase().split(/\s+/))].filter(s => s && !resumeSet.has(s)) : []

  return { top, missing }
}
