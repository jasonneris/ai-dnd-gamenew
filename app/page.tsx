'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*')
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!text) return

    await supabase.from('messages').insert({
      user_name: 'Player',
      message: text,
      is_dm: false
    })

    setText('')
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>AI DND Chat</h1>

      <div>
        {messages.map((m:any, i) => (
          <p key={i}>
            <strong>{m.is_dm ? 'DM' : m.user_name}:</strong> {m.message}
          </p>
        ))}
      </div>

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </main>
  )
}