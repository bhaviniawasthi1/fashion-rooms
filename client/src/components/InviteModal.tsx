import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Room } from '../types';

interface InviteModalProps {
  room: Room;
  inviteLink: string;
  onClose: () => void;
}

export default function InviteModal({ room, inviteLink, onClose }: InviteModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my Fashion Room: ${room.name}`,
          text: `Join my "${room.name}" fashion room on Fashion Rooms! Use code: ${room.invite_code}`,
          url: inviteLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      copyToClipboard(inviteLink, setCopiedLink);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Invite Friends</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-gray-600 text-center">
            Share with friends to invite them to <strong className="text-gray-900">{room.name}</strong>
          </p>

          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
              <QRCodeSVG value={inviteLink} size={120} />
            </div>
          </div>

          {/* Invite Code - prominent with copy button */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-pink-200">
            <p className="text-[10px] text-pink-600 font-medium mb-1.5 text-center">Invite Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-center text-xl font-bold tracking-[0.3em] text-pink-600 font-mono select-all">
                {room.invite_code}
              </code>
              <button
                onClick={() => copyToClipboard(room.invite_code, setCopiedCode)}
                className="shrink-0 px-2.5 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-medium hover:bg-pink-500-dark transition-colors"
              >
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Link */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
            <code className="flex-1 text-[10px] text-gray-600 truncate font-mono">
              {inviteLink}
            </code>
            <button
              onClick={() => copyToClipboard(inviteLink, setCopiedLink)}
              className="shrink-0 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-medium hover:bg-gray-100 transition-colors"
            >
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(inviteLink, setCopiedLink)}
              className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors"
            >
               Copy Link
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2 bg-pink-500 text-white rounded-xl text-xs font-medium hover:bg-pink-500-dark transition-colors"
            >
               Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
