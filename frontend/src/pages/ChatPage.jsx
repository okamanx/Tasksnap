import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MOCK_MESSAGES = [
  { id: '1', sender_id: 'other', message: "Hi! I've just seen your request for the furniture assembly. I have all the tools required and can be there by 2 PM. Does that work for you?", created_at: '2024-10-14T10:14:00Z' },
  { id: '2', sender_id: 'me', message: "That sounds perfect. I have two large bookshelves and a desk. Do you think it'll take more than 2 hours?", created_at: '2024-10-14T10:16:00Z' },
  { id: '3', sender_id: 'other', message: 'Based on those items, it usually takes about 2.5 hours to ensure everything is perfectly level and secure.', created_at: '2024-10-14T10:18:00Z' },
];

export default function ChatPage() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [task, setTask] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    fetchTask();
    fetchMessages();
    // Realtime subscription
    const channel = supabase
      .channel(`task-chat-${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `task_id=eq.${taskId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchTask() {
    if (!taskId || taskId.length < 10) return;
    const { data } = await supabase.from('tasks').select('*, profiles:created_by(name)').eq('id', taskId).single();
    if (data) setTask(data);
  }

  async function fetchMessages() {
    if (!taskId || taskId.length < 10) return;
    const { data } = await supabase.from('messages').select('*').eq('task_id', taskId).order('created_at');
    if (data?.length > 0) setMessages(data);
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const msg = { id: Date.now().toString(), sender_id: 'me', message: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setText('');
    try {
      await supabase.from('messages').insert({
        task_id: taskId,
        sender_id: user?.id,
        message: msg.message,
      });
    } catch { /* optimistic already rendered */ }
    setSending(false);
  }

  const isMine = (msg) => msg.sender_id === user?.id || msg.sender_id === 'me';

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-dvh bg-surface text-on-surface flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-nav shadow-[0_12px_30px_0_rgba(0,0,0,0.06)] px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-200/50 rounded-full transition-colors active:scale-90">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-headline font-bold tracking-tight text-on-surface text-base leading-tight">
            {task?.profiles?.name || 'Chat'}
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-tertiary rounded-full" />
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">Online</span>
          </div>
        </div>
        <button className="p-2 hover:bg-stone-200/50 rounded-full transition-colors active:scale-90">
          <span className="material-symbols-outlined text-on-surface">more_vert</span>
        </button>
      </header>

      {/* Task context strip */}
      <div className="fixed top-16 left-0 right-0 z-40 px-6 py-2 bg-surface-container-low/90 backdrop-blur-sm border-b border-surface-container-highest/20 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="material-symbols-outlined text-primary text-sm">handyman</span>
          <span className="text-xs font-bold text-on-surface-variant truncate">
            {task?.title || 'Task Chat'}
          </span>
        </div>
        <span className="text-xs font-bold text-tertiary flex-shrink-0">
          ₹{task?.price?.toLocaleString('en-IN') || '—'}
        </span>
      </div>

      {/* Messages */}
      <main className="flex-1 pt-28 pb-28 px-4 md:px-8 max-w-3xl mx-auto w-full overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Date separator */}
          <div className="flex justify-center my-2">
            <span className="px-4 py-1 bg-surface-container-low text-on-surface-variant text-[11px] font-bold tracking-widest uppercase rounded-full">
              Today
            </span>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${isMine(msg) ? 'flex-col items-end' : 'items-end gap-3'} group`}>
              {/* Avatar for incoming */}
              {!isMine(msg) && (
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-sm font-bold text-on-surface-variant shadow-sm border-2 border-surface-container-highest">
                  {(task?.profiles?.name || 'T')[0]}
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${isMine(msg) ? 'items-end' : ''}`}>
                <div className={`p-4 ${isMine(msg)
                  ? 'bg-gradient-to-br from-primary-container to-secondary-container text-white rounded-[2rem] rounded-br-none shadow-[0_8px_20px_rgba(255,138,0,0.15)]'
                  : 'bg-surface-container-lowest text-on-surface rounded-[2rem] rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-surface-container-highest/30'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
                <div className={`flex items-center gap-1.5 ${isMine(msg) ? 'mr-2' : 'ml-2'}`}>
                  <span className="text-[10px] font-medium text-on-surface-variant">{formatTime(msg.created_at)}</span>
                  {isMine(msg) && (
                    <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 glass-nav">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-center gap-3">
          <button type="button" className="w-12 h-12 flex items-center justify-center bg-surface-container-high rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors active:scale-90">
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-surface-container-low border-none rounded-full px-6 py-3.5 text-sm placeholder:text-on-surface-variant/50 pr-12"
            />
            <button type="button" className="absolute right-3 p-1 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">mood</span>
            </button>
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary-container to-secondary-container rounded-full text-white shadow-lg shadow-primary-container/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
