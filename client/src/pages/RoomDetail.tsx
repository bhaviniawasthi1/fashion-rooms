import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import RoomInfo from '../components/room/RoomInfo';
import MembersList from '../components/room/MembersList';
import ActivityFeed from '../components/room/ActivityFeed';
import MessageBubble from '../components/room/MessageBubble';
import SystemMessage from '../components/room/SystemMessage';
import MessageInput from '../components/room/MessageInput';
import TypingIndicator from '../components/room/TypingIndicator';
import InviteModal from '../components/InviteModal';
import { ChatMessageSkeleton } from '../components/Skeleton';
import { useChatContext } from '../context/ChatContext';
import type { Room } from '../types';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { connected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [roomVersion, setRoomVersion] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const { minimized, toggleMinimize, setActiveRoom, clearChat } = useChatContext();
  const minimizedRef = useRef(minimized);
  minimizedRef.current = minimized;

  const { messages, loading: messagesLoading, sendMessage, messagesEndRef } = useChat(id!);
  const { typingUsers, startTyping, stopTyping } = useTyping(id!);
  const { isOnline } = usePresence(id!);

  useEffect(() => {
    api.get(`/rooms/${id}`).then((res) => {
      setRoom(res.data.room);
    }).catch(() => {
      navigate('/rooms');
    }).finally(() => setLoading(false));
  }, [id, navigate, roomVersion]);

  useEffect(() => {
    if (room) {
      setActiveRoom(room.id, room.name);
    }
    return () => {
      if (!minimizedRef.current) {
        clearChat();
      }
    };
  }, [room, setActiveRoom, clearChat]);

  if (loading || !room) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (room.status === 'expired') {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-gray-600 px-4">
        <span className="text-6xl mb-4">⏰</span>
        <p className="text-lg mb-2">This room is no longer valid</p>
        <button onClick={() => navigate('/rooms')} className="text-pink-600 hover:text-pink-600 font-medium">
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-3 py-2.5 border-b border-gray-200 flex items-center gap-2 shrink-0 shadow-sm">
        <button onClick={() => navigate('/rooms')} className="text-gray-500 hover:text-gray-700 p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 text-sm truncate">{room.name}</h1>
          <p className="text-[10px] text-gray-500 truncate">
            {room.member_count} members · {room.occasion}
            {room.expires_at && ` · Valid till ${new Date(room.expires_at).toLocaleDateString()}`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!connected && <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Disconnected" />}

          <button
            onClick={() => navigate(`/rooms/${id}/cart`)}
            className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            title="Room Cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>

          <button
            onClick={() => setShowInvite(true)}
            className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            title="Invite Friends"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button
            onClick={toggleMinimize}
            className={`p-1.5 rounded-lg transition-colors ${
              minimized ? 'text-pink-600 bg-pink-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={minimized ? 'Maximize Chat' : 'Minimize Chat'}
          >
            {minimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-lg transition-colors ${
              showInfo ? 'text-pink-600 bg-pink-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Room Info"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Chat area */}
        {minimized ? (
          <div className="flex-1 flex items-center justify-center text-gray-300">
            <div className="text-center">
              <span className="text-6xl block mb-2">💬</span>
              <p className="text-sm">Chat is minimized</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {messagesLoading ? (
                <div className="space-y-4 pt-4">
                  {[1, 2, 3, 4].map((i) => <ChatMessageSkeleton key={i} />)}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-4xl mb-2">💬</span>
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
                    Start the conversation! Try <span className="text-pink-500 font-medium">@Maya</span> for AI fashion assistance.
                  </p>
                </div>
              ) : (
                messages.map((msg) =>
                  msg.type === 'system' ? (
                    <SystemMessage key={msg.id} message={msg} />
                  ) : (
                    <MessageBubble key={msg.id} message={msg} />
                  )
                )
              )}
              <TypingIndicator typingUsers={typingUsers} />
              <div ref={messagesEndRef} />
            </div>
            <MessageInput onSend={sendMessage} onTypingStart={startTyping} onTypingStop={stopTyping} />
          </div>
        )}

        {/* Info drawer */}
        {showInfo && (
          <div className="hidden lg:block w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">Room Info</h2>
            </div>
            <RoomInfo room={room} onRoomUpdated={() => setRoomVersion(v => v + 1)} />
            <div className="border-t border-gray-100">
              <MembersList roomId={id!} isOnline={isOnline} />
            </div>
            <div className="border-t border-gray-100">
              <ActivityFeed roomId={id!} />
            </div>
          </div>
        )}
      </div>

      {/* Info drawer - Mobile overlay */}
      {showInfo && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowInfo(false)} />
          <div className="relative w-80 max-w-[85vw] bg-white flex flex-col ml-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">Room Info</h2>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RoomInfo room={room} onRoomUpdated={() => setRoomVersion(v => v + 1)} />
              <div className="border-t border-gray-100">
                <MembersList roomId={id!} isOnline={isOnline} />
              </div>
              <div className="border-t border-gray-100">
                <ActivityFeed roomId={id!} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <InviteModal
          room={room}
          inviteLink={`${window.location.origin}/join?code=${room.invite_code}`}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
