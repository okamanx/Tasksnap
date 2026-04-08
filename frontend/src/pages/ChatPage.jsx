import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ChatPage() {
  const { taskId, applicantId } = useParams();
  const roomId = `${taskId}_${applicantId}`;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [task, setTask] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  // Workflow states
  const [otpInput, setOtpInput] = useState('');
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    fetchData();
    fetchMessages();
    checkIfRated();

    // Realtime subscriptions
    const msgSub = supabase.channel(`chat-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();

    const taskSub = supabase.channel(`task-${taskId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` }, payload => {
        setTask(prev => ({ ...prev, ...payload.new }));
      }).subscribe();

    return () => {
      supabase.removeChannel(msgSub);
      supabase.removeChannel(taskSub);
    };
  }, [taskId, applicantId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, task]);

  async function fetchData() {
    if (!taskId) return;
    const { data: tData } = await supabase.from('tasks').select('*, profiles:created_by(name)').eq('id', taskId).single();
    if (tData) {
      setTask(tData);
      if (user?.id === tData.created_by) {
        const { data: aData } = await supabase.from('profiles').select('*').eq('id', applicantId).single();
        if (aData) setOtherUser({ name: aData.name });
      } else {
        setOtherUser({ name: tData.profiles?.name });
      }
    }
  }

  async function fetchMessages() {
    if (!taskId) return;
    const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at');
    if (data?.length > 0) setMessages(data);
  }

  async function checkIfRated() {
    if (!taskId || !user?.id) return;
    const { data } = await supabase.from('ratings').select('*').eq('task_id', taskId).eq('reviewer_id', user.id).single();
    if (data) setHasRated(true);
  }

  async function sendMessage(e) {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const msg = { id: Date.now().toString(), sender_id: 'me', message: text.trim(), created_at: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setText('');
    try {
      await supabase.from('messages').insert({ task_id: taskId, room_id: roomId, sender_id: user?.id, message: msg.message });
    } catch {}
    setSending(false);
  }

  // ============== WORKFLOW FUNCTIONS ==============
  const isCreator = task?.created_by === user?.id;

  async function generateAIPricing() {
    // Simulated Gemini Call
    const aiPrice = Math.round(task.price * (0.8 + Math.random() * 0.4));
    setText(`AI Suggestion based on task details: I can do this fully for ₹${aiPrice}. Let me know if you accept!`);
  }

  async function handleAccept() {
    const sOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const eOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    await supabase.from('tasks').update({
      status: 'assigned',
      accepted_by: applicantId,
      start_otp: sOtp,
      end_otp: eOtp
    }).eq('id', taskId);
  }

  async function handleStartOTP() {
    if (otpInput === task.start_otp) {
      await supabase.from('tasks').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', taskId);
      setOtpInput('');
    } else {
      alert("Invalid Start OTP!");
    }
  }

  async function handleCompleteOTP() {
    if (otpInput === task.end_otp) {
      await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', taskId);
      setOtpInput('');
    } else {
      alert("Invalid Completion OTP!");
    }
  }

  async function submitRating() {
    if (rating === 0) return alert('Select a star rating!');
    const revieweeId = isCreator ? applicantId : task.created_by;
    await supabase.from('ratings').insert({
      task_id: taskId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      score: rating
    });
    setHasRated(true);
  }

  // ============== RENDERING ==============
  const isMine = (msg) => msg.sender_id === user?.id || msg.sender_id === 'me';
  const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-dvh bg-surface text-on-surface flex flex-col">
      <header className="fixed top-0 w-full z-50 glass-nav shadow-[0_12px_30px_0_rgba(0,0,0,0.06)] px-4 h-16 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-200/50 rounded-full transition-colors active:scale-90">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-headline font-bold text-base">{otherUser?.name || 'Chat'}</h1>
          <span className="text-[10px] font-bold text-tertiary uppercase">Online</span>
        </div>
        <button className="p-2 opacity-0 cursor-default"><span className="material-symbols-outlined">more_vert</span></button>
      </header>

      {/* Dynamic Workflow Action Strip */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-surface-container-lowest border-b border-surface-container-highest shadow-sm">
        {task && (
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant truncate"><span className="material-symbols-outlined text-[14px] align-middle mr-1">handyman</span>{task.title}</span>
              <span className="text-xs font-bold text-primary">₹{task.price}</span>
            </div>

            {/* STATUS: OPEN */}
            {task.status === 'open' && (
              <div className="flex gap-2">
                {isCreator ? (
                  <button onClick={handleAccept} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded shadow-md text-xs uppercase tracking-wide active:scale-95 transition-all">
                    Accept Applicant
                  </button>
                ) : (
                  <button onClick={generateAIPricing} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-2 rounded shadow-md text-xs uppercase tracking-wide active:scale-95 transition-all flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span> AI Price Offer
                  </button>
                )}
              </div>
            )}

            {/* STATUS: ASSIGNED */}
            {task.status === 'assigned' && (
              <div className="flex flex-col gap-2 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <span className="text-[11px] font-bold uppercase text-blue-600">Task Assigned & Locked</span>
                {isCreator ? (
                  <div className="font-mono text-sm">Provide Start OTP to worker: <strong className="text-lg bg-blue-100 px-1 rounded">{task.start_otp}</strong></div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter Start OTP" value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-white border border-blue-200 rounded px-3 py-1 font-mono text-sm" />
                    <button onClick={handleStartOTP} className="bg-blue-600 text-white px-4 font-bold text-xs rounded shadow active:scale-95">Start</button>
                  </div>
                )}
              </div>
            )}

            {/* STATUS: IN PROGRESS */}
            {task.status === 'in_progress' && (
              <div className="flex flex-col gap-2 p-3 bg-orange-500/10 rounded border border-orange-500/20">
                <span className="text-[11px] font-bold uppercase text-orange-600">Work In Progress</span>
                {isCreator ? (
                  <div className="font-mono text-sm">When finished, provide End OTP: <strong className="text-lg bg-orange-100 px-1 rounded">{task.end_otp}</strong></div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter Finish OTP" value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-white border border-orange-200 rounded px-3 py-1 font-mono text-sm" />
                    <button onClick={handleCompleteOTP} className="bg-orange-600 text-white px-4 font-bold text-xs rounded shadow active:scale-95">Complete</button>
                  </div>
                )}
              </div>
            )}

            {/* STATUS: COMPLETED */}
            {task.status === 'completed' && !hasRated && (
              <div className="flex flex-col items-center gap-2 p-3 bg-green-500/10 rounded border border-green-500/20">
                <span className="text-[11px] font-bold uppercase text-green-700">Task Completed! Rate your experience:</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className={`material-symbols-outlined text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`} style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}>star</button>
                  ))}
                </div>
                <button onClick={submitRating} className="bg-green-600 text-white px-4 py-1.5 font-bold text-xs rounded shadow active:scale-95 mt-1">Submit Blind Rating</button>
              </div>
            )}
            {task.status === 'completed' && hasRated && (
              <div className="text-center text-[11px] font-bold uppercase text-green-700 bg-green-500/10 py-2 rounded">
                Task Completed & Rated
              </div>
            )}
          </div>
        )}
      </div>

      <main className="flex-1 pt-[180px] pb-28 px-4 md:px-8 max-w-3xl mx-auto w-full overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${isMine(msg) ? 'flex-col items-end' : 'items-end gap-2'}`}>
              {!isMine(msg) && <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold shadow-sm">{(otherUser?.name || 'U')[0]}</div>}
              <div className={`flex flex-col max-w-[80%] ${isMine(msg) ? 'items-end' : ''}`}>
                <div className={`p-3 text-sm ${isMine(msg) ? 'bg-gradient-to-br from-primary-container to-secondary-container text-white rounded-2xl rounded-br-none' : 'bg-surface-container-lowest rounded-2xl rounded-bl-none shadow-sm'}`}>
                  {msg.message}
                </div>
                <span className={`text-[9px] font-medium text-on-surface-variant flex gap-1 ${isMine(msg) ? 'mt-1 mr-1' : 'mt-1 ml-1'}`}>
                  {formatTime(msg.created_at)}
                  {isMine(msg) && <span className="material-symbols-outlined text-[12px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {task?.status !== 'completed' && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 glass-nav">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-center gap-2">
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="w-full bg-surface-container-highest border-none rounded-full px-5 py-3 text-sm" />
            <button type="submit" disabled={!text.trim() || sending} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-container to-secondary-container rounded-full text-white shadow-lg disabled:opacity-50 active:scale-95">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </form>
        </footer>
      )}
    </div>
  );
}
