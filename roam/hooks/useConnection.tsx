import { TokenSource, TokenSourceResponseObject } from 'livekit-client';
import { createContext, useContext, useMemo, useState } from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';

// LiveKit Sandbox ID
const sandboxID = 'geminilivehackathon-stu3sh';

// The name of the agent to dispatch
const agentName = 'roam-guide';

// Fallback for manual token usage
const hardcodedUrl = 'wss://gemini-live-hackathon-vu3h5m6a.livekit.cloud';
const hardcodedToken = '';

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: () => void;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
  disconnect: () => {},
});

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return ctx;
}

interface ConnectionProviderProps {
  children: React.ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);

  const tokenSource = useMemo(() => {
    if (sandboxID) {
      return TokenSource.sandboxTokenServer(sandboxID);
    } else {
      return TokenSource.literal({
        serverUrl: hardcodedUrl,
        participantToken: hardcodedToken,
      } satisfies TokenSourceResponseObject);
    }
  }, []);

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: () => {
        console.log('[Connection] connect() called, starting session...');
        setIsConnectionActive(true);
        try {
          startSession();
          console.log('[Connection] startSession() completed');
        } catch (e) {
          console.error('[Connection] startSession() error:', e);
        }
      },
      disconnect: () => {
        console.log('[Connection] disconnect() called');
        setIsConnectionActive(false);
        endSession();
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>
        {children}
      </ConnectionContext.Provider>
    </SessionProvider>
  );
}
