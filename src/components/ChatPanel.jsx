import { useState, useRef, useEffect } from 'react'
import './ChatPanel.css'

const STORAGE_KEY = 'datamocha-source-files'

const SAMPLE_MESSAGES = [
  {
    id: 1, role: 'assistant',
    text: 'Hello! I\'ve analyzed your sources. Ask me anything about your data — I can summarize, compare, extract insights, or answer specific questions.',
    time: '10:32 AM',
  },
  {
    id: 2, role: 'user',
    text: 'Give me top FY25 insights for AHCL.',
    time: '10:33 AM',
  },
  {
    id: 3, role: 'assistant',
    text: 'Here are the top AHCL FY25 highlights:\n\n1. **Revenue:** ₹451.82 Cr\n2. **Gross Profit:** ₹229 Cr\n3. **EBITDA:** ₹58 Cr (12.88% margin)\n4. **PBT:** ₹69 Cr\n5. **PAT:** ₹51 Cr and **EPS:** ₹17.58/share\n\nI can break this down by segment or cash flow if you want.',
    time: '10:33 AM',
  },
]

const getSavedSources = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const buildAssistantReply = (question) => {
  const q = question.toLowerCase()
  const sources = getSavedSources()
  const sourceNames = sources.slice(0, 3).map((s) => s.name)
  const sourcePrefix = sources.length
    ? `I checked ${sources.length} source${sources.length > 1 ? 's' : ''}${sourceNames.length ? ` (e.g. **${sourceNames.join(', ')}**)` : ''}.\n\n`
    : ''

  if (q.includes('top') || q.includes('insight') || q.includes('summary')) {
    return `${sourcePrefix}Top AHCL FY25 insights:\n\n1. **Revenue:** ₹451.82 Cr\n2. **Gross Profit:** ₹229 Cr\n3. **EBITDA:** ₹58 Cr (12.88% margin)\n4. **PBT:** ₹69 Cr\n5. **PAT:** ₹51 Cr and **EPS:** ₹17.58/share`
  }

  if (q.includes('revenue') || q.includes('segment') || q.includes('mix')) {
    return `${sourcePrefix}AHCL revenue mix used in dashboard:\n\n1. **OTC Products:** ₹290 Cr\n2. **Women\'s Hygiene:** ₹124 Cr\n3. **Beverages:** ₹36 Cr\n4. **Others & Other Income:** ₹2 Cr\n\nTotal = **₹452 Cr**.`
  }

  if (q.includes('ebitda') || q.includes('margin') || q.includes('profit')) {
    return `${sourcePrefix}Profit bridge FY25:\n\n1. **Revenue:** ₹452 Cr\n2. **Gross Profit:** ₹229 Cr\n3. **EBITDA:** ₹58 Cr\n4. **D&A:** ₹7 Cr\n5. **Other Income:** ₹18 Cr\n6. **PBT:** ₹69 Cr\n7. **Tax:** ₹18 Cr\n8. **PAT:** ₹51 Cr`
  }

  if (q.includes('sankey') || q.includes('cash flow') || q.includes('cashflow')) {
    return `${sourcePrefix}Sankey corrections now applied:\n\n1. **Freight cost removed** as separate node (inside Other Expenses).\n2. **Women\'s Hygiene = ₹124 Cr**.\n3. **Others & Other Income = ₹2 Cr**.\n4. **Other Income ₹18 Cr** shown as separate inflow into PBT.\n5. **EPS labeled per share** as ₹17.58/share.`
  }

  return `${sourcePrefix}I can answer AHCL FY25 questions on revenue mix, EBITDA/PAT bridge, Sankey flow, vision gap, and KPI trends. Try:\n\n1. **Explain PBT bridge**\n2. **Show margin drivers**\n3. **Summarize segment performance**`
}

const Avatar = ({ role }) => (
  <div className={`avatar avatar-${role}`}>
    {role === 'user' ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
)

const MessageBubble = ({ msg }) => {
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />
    })
  }

  return (
    <div className={`message message-${msg.role}`}>
      <Avatar role={msg.role} />
      <div className="message-body">
        <div className="message-bubble">{renderText(msg.text)}</div>
        <span className="message-time">{msg.time}</span>
      </div>
    </div>
  )
}

export default function ChatPanel() {
  const [messages, setMessages] = useState(SAMPLE_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const textareaRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = () => {
    const text = input.trim()
    if (!text || loading) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: now }])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: buildAssistantReply(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
      setLoading(false)
    }, 1200)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <section className="chat-panel">
      <div className="panel-header chat-header">
        <h2 className="panel-title">Chat</h2>
        <div className="chat-meta">
          <span className="status-dot" />
          <span className="status-label">3 sources active</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

        {loading && (
          <div className="message message-assistant">
            <Avatar role="assistant" />
            <div className="message-body">
              <div className="message-bubble thinking">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything about your sources…"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className={`send-btn ${input.trim() ? 'active' : ''}`} onClick={send} disabled={!input.trim() || loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </section>
  )
}
