import { useState, useCallback, useRef, useMemo } from 'react'

const EXAMPLE_TEXT = `   Hello   World!

This   text   has   extra    spaces.


It also has    empty lines above.

   And some lines have leading/trailing spaces.

SOME TEXT IS IN ALL CAPS
some text is in all lowercase
some Text has Mixed Case   `

export default function App() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  const [options, setOptions] = useState({
    trimLines: true,
    removeExtraSpaces: true,
    removeEmptyLines: false,
    removeLineBreaks: false,
    caseTransform: 'none',
  })

  const updateOption = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const cleanText = useCallback((input) => {
    if (!input) return ''

    let result = input

    if (options.trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n')
    }

    if (options.removeExtraSpaces) {
      result = result.replace(/[ \t]+/g, ' ')
    }

    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n')
    }

    if (options.removeLineBreaks) {
      result = result.replace(/\n+/g, ' ').trim()
    }

    switch (options.caseTransform) {
      case 'lower':
        result = result.toLowerCase()
        break
      case 'upper':
        result = result.toUpperCase()
        break
      case 'title':
        result = result.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      case 'sentence':
        result = result.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        break
      default:
        break
    }

    return result
  }, [options])

  const cleanedText = useMemo(() => cleanText(text), [text, cleanText])

  const inputStats = useMemo(() => ({
    characters: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split('\n').length : 0,
  }), [text])

  const outputStats = useMemo(() => ({
    characters: cleanedText.length,
    words: cleanedText.trim() ? cleanedText.trim().split(/\s+/).length : 0,
    lines: cleanedText ? cleanedText.split('\n').length : 0,
  }), [cleanedText])

  const handleCopy = async () => {
    if (!cleanedText) return
    try {
      await navigator.clipboard.writeText(cleanedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const clearAll = () => {
    setText('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const loadExample = () => {
    setText(EXAMPLE_TEXT)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Text Cleaner</h1>
        <p className="subtitle">Clean messy text instantly</p>
      </header>

      <main className="main">
        <div className="panel input-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>Input</span>
              <div className="stats">
                <span>{inputStats.characters} chars</span>
                <span>{inputStats.words} words</span>
                <span>{inputStats.lines} lines</span>
              </div>
            </div>
            <div className="panel-actions">
              <button
                className="btn-ghost"
                onClick={loadExample}
                aria-label="Load example text"
              >
                Example
              </button>
              {text && (
                <button
                  className="btn-ghost"
                  onClick={clearAll}
                  aria-label="Clear all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your messy text here..."
            spellCheck={false}
            aria-label="Input text"
          />
        </div>

        <div className="options-panel">
          <h2 className="section-title">Cleaning Options</h2>

          <div className="options-grid">
            <label className="option-row">
              <input
                type="checkbox"
                checked={options.trimLines}
                onChange={(e) => updateOption('trimLines', e.target.checked)}
              />
              <div className="option-content">
                <span className="option-label">Trim lines</span>
                <span className="option-desc">Remove spaces at start/end of each line</span>
              </div>
            </label>

            <label className="option-row">
              <input
                type="checkbox"
                checked={options.removeExtraSpaces}
                onChange={(e) => updateOption('removeExtraSpaces', e.target.checked)}
              />
              <div className="option-content">
                <span className="option-label">Remove extra spaces</span>
                <span className="option-desc">Replace multiple spaces with single space</span>
              </div>
            </label>

            <label className="option-row">
              <input
                type="checkbox"
                checked={options.removeEmptyLines}
                onChange={(e) => updateOption('removeEmptyLines', e.target.checked)}
              />
              <div className="option-content">
                <span className="option-label">Remove empty lines</span>
                <span className="option-desc">Delete blank lines from text</span>
              </div>
            </label>

            <label className="option-row">
              <input
                type="checkbox"
                checked={options.removeLineBreaks}
                onChange={(e) => updateOption('removeLineBreaks', e.target.checked)}
              />
              <div className="option-content">
                <span className="option-label">Remove line breaks</span>
                <span className="option-desc">Join all lines into one paragraph</span>
              </div>
            </label>
          </div>

          <div className="case-section">
            <span className="setting-label">Case Transform</span>
            <div className="case-options">
              {[
                { value: 'none', label: 'None' },
                { value: 'lower', label: 'lowercase' },
                { value: 'upper', label: 'UPPERCASE' },
                { value: 'title', label: 'Title Case' },
                { value: 'sentence', label: 'Sentence case' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`case-btn ${options.caseTransform === opt.value ? 'active' : ''}`}
                  onClick={() => updateOption('caseTransform', opt.value)}
                  aria-label={`Transform to ${opt.label}`}
                  aria-pressed={options.caseTransform === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel output-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>Output</span>
              <div className="stats">
                <span>{outputStats.characters} chars</span>
                <span>{outputStats.words} words</span>
                <span>{outputStats.lines} lines</span>
              </div>
            </div>
            <div className="panel-actions">
              <button
                className={`btn-primary ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                disabled={!cleanedText}
                aria-label="Copy cleaned text"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={cleanedText}
            readOnly
            placeholder="Cleaned text will appear here..."
            aria-label="Output text"
          />
        </div>
      </main>

      <footer className="footer">
        <a
          target="_blank"
          rel="noopener noreferrer"
        >
          Coded by @sks
        </a>
      </footer>
    </div>
  )
}
