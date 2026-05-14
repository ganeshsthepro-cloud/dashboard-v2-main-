import { useEffect, useRef, useState } from 'react'
import './SourcePanel.css'

const ACCEPTED_TYPES = ['.pdf', '.txt', '.csv', '.json', '.md', '.docx', '.xlsx', '.xls']
const STORAGE_KEY = 'datamocha-source-files'

const FileIcon = ({ type }) => {
  const colors = { pdf: '#fc5252', csv: '#22c55e', json: '#E5A800', txt: '#60a5fa', md: '#a78bfa', docx: '#3b82f6', xlsx: '#217346', xls: '#217346' }
  const textColors = { xlsx: '#ffffff', xls: '#ffffff' }
  const color = colors[type] || '#9999aa'
  const textColor = textColors[type] || color
  return (
    <div className="file-icon" style={{ '--icon-color': color, '--icon-text': textColor }}>
      {type.toUpperCase().slice(0, 3)}
    </div>
  )
}

const DEFAULT_FILES = [
  { id: 1, name: 'sales_data_2024.csv', type: 'csv', size: '142 KB' },
  { id: 2, name: 'product_overview.pdf', type: 'pdf', size: '2.3 MB' },
  { id: 3, name: 'notes.md', type: 'md', size: '8 KB' },
  { id: 4, name: 'Trial_Balance_FY25.xlsx', type: 'xlsx', size: '86 KB' },
  { id: 5, name: 'P&L_Statement_FY25.xlsx', type: 'xlsx', size: '74 KB' },
]

export default function SourcePanel({ onClose }) {
  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const names = parsed.map(f => f.name)
          const missing = DEFAULT_FILES.filter(d => !names.includes(d.name))
          return missing.length ? [...parsed, ...missing] : parsed
        }
      }
    } catch {
      // Ignore storage parsing errors and fall back to defaults.
    }

    return DEFAULT_FILES
  })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  }, [files])

  const getExt = (name) => name.split('.').pop().toLowerCase()

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      type: getExt(f.name),
      size: formatSize(f.size),
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleRemove = (id) => setFiles(prev => prev.filter(f => f.id !== id))

  return (
    <aside className="source-panel">
      <div className="panel-header">
        <h2 className="panel-title">Sources</h2>
        <div className="panel-header-actions">
          <span className="source-count">{files.length}</span>
          {onClose && (
            <button className="panel-close-btn" onClick={onClose} title="Close Sources">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="drop-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="drop-title">Drop files here</p>
        <p className="drop-hint">.pdf, .txt, .csv, .json, .md, .docx, .xlsx</p>
      </div>

      <div className="file-list">
        {files.map(f => (
          <div key={f.id} className="file-item">
            <FileIcon type={f.type} />
            <div className="file-info">
              <span className="file-name">{f.name}</span>
              <span className="file-size">{f.size}</span>
            </div>
            <button className="file-remove" onClick={() => handleRemove(f.id)} title="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <p className="empty-hint">No sources added yet</p>
      )}
    </aside>
  )
}
