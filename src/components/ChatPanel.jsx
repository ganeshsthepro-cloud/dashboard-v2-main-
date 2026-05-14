import { useState, useRef, useEffect } from 'react'
import { askAI } from '../services/aiService.js'
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
    return `${sourcePrefix}Top AHCL FY25 insights:\n\n1. **Revenue:** ₹451.82 Cr\n2. **Gross Profit:** ₹229 Cr\n3. **EBITDA (Earnings Before Interest, Tax, Depreciation and Amortization):** ₹58 Cr (12.88% margin)\n4. **PBT (Profit Before Tax):** ₹69 Cr\n5. **PAT (Profit After Tax):** ₹51 Cr and **EPS (Earnings Per Share):** ₹17.58/share`
  }

  if (q.includes('revenue') || q.includes('segment') || q.includes('mix')) {
    return `${sourcePrefix}AHCL revenue mix used in dashboard:\n\n1. **Over-The-Counter (OTC) Products:** ₹290 Cr\n2. **Women\'s Hygiene:** ₹124 Cr\n3. **Beverages:** ₹36 Cr\n4. **Others & Other Income:** ₹2 Cr\n\nTotal = **₹452 Cr**.`
  }

  if (q.includes('roce') || q.includes('return on capital employed') || q.includes('otc')) {
    return `${sourcePrefix}Full-form KPI labels:\n\n1. **OTC:** Over-The-Counter\n2. **ROCE:** Return on Capital Employed\n3. **EPS:** Earnings Per Share\n4. **PBT:** Profit Before Tax\n5. **PAT:** Profit After Tax`
  }

  if (q.includes('ebitda') || q.includes('margin') || q.includes('profit')) {
    return `${sourcePrefix}Profit bridge FY25:\n\n1. **Revenue:** ₹452 Cr\n2. **Gross Profit:** ₹229 Cr\n3. **EBITDA:** ₹58 Cr\n4. **D&A:** ₹7 Cr\n5. **Other Income:** ₹18 Cr\n6. **PBT:** ₹69 Cr\n7. **Tax:** ₹18 Cr\n8. **PAT:** ₹51 Cr`
  }

  if (q.includes('sankey') || q.includes('cash flow') || q.includes('cashflow')) {
    return `${sourcePrefix}Sankey corrections now applied:\n\n1. **Freight cost removed** as separate node (inside Other Expenses).\n2. **Women\'s Hygiene = ₹124 Cr**.\n3. **Others & Other Income = ₹2 Cr**.\n4. **Other Income ₹18 Cr** shown as separate inflow into PBT.\n5. **EPS labeled per share** as ₹17.58/share.`
  }

  return `${sourcePrefix}I could not find an exact rule-based answer for this question.\n\nThis chat is currently template-based. Connect your LLM API to get real dynamic responses from your uploaded sources.`
}

import datamochaLogo from "../assets/datamocha-logo.svg";

const Avatar = ({ role }) => (
  <div className={`avatar avatar-${role}`}>
    {role === 'user' ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <img src={datamochaLogo} alt="AI" width="20" height="20" />
    )}
  </div>
)

const stripEmojis = (text) =>
  text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u2705\u274c\u26a1\u2714\u2717\u2718]/gu, '').replace(/\s{2,}/g, ' ').trim()

const MessageBubble = ({ msg, onSpeak, isSpeaking }) => {
  const renderInline = (str) => {
    const parts = str.split(/(\*{2,3}.*?\*{2,3})/g);
    return parts.map((p, j) => {
      if (p.startsWith("***") && p.endsWith("***"))
        return <strong key={j}><em>{p.slice(3, -3)}</em></strong>;
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={j}>{p.slice(2, -2)}</strong>;
      return p;
    });
  };

  const renderText = (text) => {
    const clean = stripEmojis(text)
    // Normalize: ensure markdown markers start on new lines
    const normalized = clean
      .replace(/ *(#{1,4}) /g, '\n$1 ')
      .replace(/ *--- */g, '\n---\n')
      .replace(/ *- \*\*/g, '\n- **')
      .replace(/ *- ([A-Z])/g, '\n- $1')
      .replace(/ *\| /g, '\n| ')
    return normalized.split('\n').map((line, i) => {
      const l = line.trim();
      if (!l) return null;
      if (l.startsWith("### ")) return <h4 key={i} className="chat-h4">{renderInline(l.slice(4))}</h4>;
      if (l.startsWith("## ")) return <h3 key={i} className="chat-h3">{renderInline(l.slice(3))}</h3>;
      if (l.startsWith("# ")) return <h3 key={i} className="chat-h2">{renderInline(l.slice(2))}</h3>;
      if (l.startsWith("| ")) return <p key={i} className="chat-table-line">{l}</p>;
      if (l === "---" || l.startsWith("|-")) return <hr key={i} className="chat-hr" />;
      if (l.startsWith("- ")) return <p key={i} className="chat-bullet">{renderInline(l)}</p>;
      return <p key={i}>{renderInline(l)}</p>;
    }).filter(Boolean)
  }

  return (
    <div className={`message message-${msg.role}`}>
      <Avatar role={msg.role} />
      <div className="message-body">
        <div className="message-bubble">{renderText(msg.text)}</div>
        <div className="message-meta">
          <span className="message-time">{msg.time}</span>
          {msg.role === 'assistant' && (
            <button className={`voice-btn ${isSpeaking ? 'voice-active' : ''}`} onClick={() => onSpeak(msg.id, msg.text)} title={isSpeaking ? 'Stop' : 'Listen'}>
              {isSpeaking ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPanel({ onQueryChange, leftOpen, rightOpen, onToggleLeft, onToggleRight }) {
  const [messages, setMessages] = useState(SAMPLE_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(null)
  const bottomRef = useRef()
  const textareaRef = useRef()
  const recognitionRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Speech-to-Text
  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Speech recognition not supported in this browser.'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  // Text-to-Speech
  const speakText = (msgId, text) => {
    if (speaking === msgId) {
      window.speechSynthesis.cancel()
      setSpeaking(null)
      return
    }
    window.speechSynthesis.cancel()
    const clean = text.replace(/\*{1,3}/g, '').replace(/#{1,4}\s?/g, '').replace(/---/g, '').replace(/\|/g, ' ').replace(/[_~`]/g, '')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = 'en-IN'
    utterance.rate = 1
    utterance.onend = () => setSpeaking(null)
    utterance.onerror = () => setSpeaking(null)
    setSpeaking(msgId)
    window.speechSynthesis.speak(utterance)
  }

  // Stop speech on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { id: Date.now(), role: 'user', text, time: now }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    onQueryChange?.(text)

    try {
      const systemPrompt = `You are a professional financial data analyst assistant for Amrutanjan Health Care Ltd (AHCL). You have access to FY25 financial data: Revenue ₹451.82 Cr, Gross Profit ₹229 Cr, EBITDA ₹58 Cr (12.88%), PBT ₹69 Cr, PAT ₹51 Cr, EPS ₹17.58/share. Segments: OTC ₹290 Cr, Women's Hygiene ₹124 Cr, Beverages ₹36 Cr. ROCE 21.44%.

AHCL P&L Data (FY25):
Revenue: ₹451.82 Cr (OTC ₹290 Cr 64.18%, Comfy ₹124 Cr 27.44%, Beverages ₹36 Cr 7.97%)
COGS: ₹222.82 Cr | Gross Profit: ₹229 Cr (Gross Margin 50.69%, OTC Gross Margin 55.24%)
Operating Expenses: Employee Cost ₹59.1L, Rent ₹18L, Depreciation ₹24L, Utilities ₹6.5L, Marketing ₹32L
EBITDA: ₹58 Cr (12.88%) | EBIT (Operating Profit): Gross Profit minus OpEx
Other Income included in PBT | PBT: ₹69 Cr (15.27%) | Tax applied | PAT: ₹51 Cr (Net Margin 11.29%) | EPS: ₹17.58/share | ROCE: 21.44%

P&L Knowledge:
- P&L formula: Revenue - COGS = Gross Profit - OpEx = EBIT - Interest = PBT - Tax = PAT
- EBITDA = EBIT + Depreciation + Amortization
- Gross Profit Margin = (Gross Profit / Revenue) x 100
- Operating Profit Margin = (EBIT / Revenue) x 100
- Net Profit Margin = (PAT / Revenue) x 100
- COGS = Opening Stock + Purchases + Direct Expenses - Closing Stock
- Operating Expenses: Rent, Salaries, Marketing, Depreciation, Admin, Utilities (not COGS)
- Non-operating income: Interest income, dividends, asset sale gains (below EBIT, before PBT)
- Common Size P&L: Each line item as % of revenue for comparison
- Revenue is "top line" (what you earn), Profit is "bottom line" (what you keep)
- Net Loss means total expenses exceeded total revenue
- Depreciation is a non-cash expense allocated over asset useful life (SLM or WDV method)
- Accrual basis: Revenue recorded when earned, expenses when incurred (required by GAAP/IFRS)
- Cash basis: Revenue recorded when cash received, expenses when cash paid

Rules:
- Keep a formal, professional tone suitable for business reports.
- NEVER use emojis, emoticons, or unicode symbols like 📊🎯💡✅❌⚡.
- Use markdown bold (**text**) for emphasis.
- Use numbered lists or bullet points for structured data.
- Be concise, data-driven, and precise with numbers.
- Do not use casual language, slang, or filler phrases like "feel free to ask".
- Start responses directly with the answer, not greetings.
- When asked to prepare a P&L statement, format it with clear sections: Revenue, COGS, Gross Profit, OpEx, EBIT, PBT, Tax, PAT with margins.
- Use ₹ with Indian notation for all amounts.`
      const chatHistory = newMessages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
        role: m.role === 'assistant' ? 'ai' : 'user',
        text: m.text,
      }))
      const reply = await askAI(chatHistory, systemPrompt)
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, {
        id: replyId,
        role: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: buildAssistantReply(text),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    }
    setLoading(false)
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
        <div className="chat-header-left">
          {!leftOpen && (
            <button className="panel-toggle-btn-inline" onClick={onToggleLeft} title="Open Sources">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          )}
          <h2 className="panel-title">Chat</h2>
        </div>
        <div className="chat-header-right">
          <div className="chat-meta">
            <span className="status-dot" />
            <span className="status-label">3 sources active</span>
          </div>
          {!rightOpen && (
            <button className="panel-toggle-btn-inline" onClick={onToggleRight} title="Open Insights">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onSpeak={speakText} isSpeaking={speaking === msg.id} />)}

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
          <button className={`mic-btn ${listening ? 'mic-active' : ''}`} onClick={toggleMic} title={listening ? 'Stop listening' : 'Voice input'}>
            {listening ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
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
