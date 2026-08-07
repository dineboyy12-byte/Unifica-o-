import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { getMyConversations, getMessages, sendMessage, markMessagesAsRead } from '@/services/chatService';
import type { Conversation, Message } from '@/types';
import { Send, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';

export function MessagesPage() {
  const { profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/auth');
      return;
    }
    if (profile) {
      getMyConversations(profile.id)
        .then(setConversations)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile, authLoading, navigate]);

  const loadMessages = useCallback(async (convId: string) => {
    const msgs = await getMessages(convId);
    setMessages(msgs);
    if (profile) {
      await markMessagesAsRead(convId, profile.id);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [profile]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedConv) return;
    const interval = setInterval(() => {
      loadMessages(selectedConv.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConv, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !profile) return;
    setSending(true);
    try {
      await sendMessage(selectedConv.id, profile.id, newMessage.trim());
      setNewMessage('');
      await loadMessages(selectedConv.id);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container-page py-20 flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-okapika-600 animate-spin mb-4" />
        <p className="text-baobab-500">A carregar mensagens...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container-page py-6 animate-fade-in">
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-baobab-100`}>
            <div className="px-4 py-3 border-b border-baobab-100">
              <h2 className="font-display text-lg font-semibold text-earth-800">Mensagens</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => { setSelectedConv(conv); loadMessages(conv.id); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-baobab-50 hover:bg-baobab-50 transition-colors text-left ${
                      selectedConv?.id === conv.id ? 'bg-okapika-50' : ''
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-medium shrink-0">
                      {conv.otherParticipant?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-earth-800 text-sm truncate">
                        {conv.otherParticipant?.full_name || 'Utilizador'}
                      </div>
                      <div className="text-xs text-baobab-500 truncate">
                        {conv.lastMessage?.content || 'Sem mensagens'}
                      </div>
                    </div>
                    {conv.property && (
                      <div className="text-xs text-okapika-600 truncate max-w-[80px]">{conv.property.title}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 text-baobab-300 mx-auto mb-3" />
                  <p className="text-baobab-500 text-sm">Ainda não tem conversas.</p>
                  <p className="text-baobab-400 text-xs mt-1">Contacte um anunciante para iniciar uma conversa.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          {selectedConv ? (
            <div className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-baobab-100 flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 rounded hover:bg-baobab-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-medium">
                  {selectedConv.otherParticipant?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-medium text-earth-800 text-sm">{selectedConv.otherParticipant?.full_name || 'Utilizador'}</div>
                  {selectedConv.property && (
                    <div className="text-xs text-okapika-600">{selectedConv.property.title}</div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-baobab-50">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === profile.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                          isOwn ? 'bg-okapika-600 text-white rounded-br-sm' : 'bg-white text-baobab-800 rounded-bl-sm border border-baobab-100'
                        }`}>
                          <p>{msg.content}</p>
                          <div className={`text-[10px] mt-1 ${isOwn ? 'text-okapika-200' : 'text-baobab-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-baobab-400 text-sm">Sem mensagens ainda. Envie a primeira mensagem!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-baobab-100 flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="input flex-1"
                />
                <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-baobab-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-baobab-300 mx-auto mb-4" />
                <p className="text-baobab-500">Selecione uma conversa para ver as mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
