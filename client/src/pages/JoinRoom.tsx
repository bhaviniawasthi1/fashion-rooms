import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function JoinRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'joining' | 'error'>('loading');
  const [error, setError] = useState('');

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      setError('No invite code provided');
      setStatus('error');
      return;
    }

    if (!user) {
      navigate(`/login?redirect=/join?code=${code}`);
      return;
    }

    setStatus('joining');

    api.post('/rooms/join', { invite_code: code })
      .then((res) => {
        navigate(`/rooms/${res.data.room.id}`);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to join room');
        setStatus('error');
      });
  }, [code, user, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        {status === 'loading' || status === 'joining' ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
            <p className="text-gray-600">Joining room...</p>
          </>
        ) : (
          <>
            <span className="text-5xl mb-4 block">❌</span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Couldn't join room</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/rooms')}
              className="text-pink-600 hover:text-pink-600 font-medium"
            >
              Go to Rooms 
            </button>
          </>
        )}
      </div>
    </div>
  );
}

