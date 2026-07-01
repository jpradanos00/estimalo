import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Session, Participant, Task, Vote, UserStory } from '../types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SessionState {
  session: Session | null;
  participants: Participant[];
  tasks: Task[];
  userStories: UserStory[];
  currentTask: Task | null;
  votes: Vote[];
  myParticipant: Participant | null;
  isAdmin: boolean;
  error: string | null;
  loading: boolean;
  createSession: (adminName: string, sessionName?: string) => Promise<string>;
  joinSession: (code: string, name: string) => Promise<void>;
  leaveSession: () => void;
  addTask: (title: string, userStoryId?: string | null) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addUserStory: (title: string) => Promise<void>;
  deleteUserStory: (storyId: string) => Promise<void>;
  startVoting: (taskId: string) => Promise<void>;
  castVote: (value: number) => Promise<void>;
  revealVotes: () => Promise<void>;
  confirmEstimate: (estimate: number) => Promise<void>;
  resetRound: () => Promise<void>;
  updateWeight: (participantId: string, weight: number) => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  deleteSession: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getStoredParticipantId(sessionId: string): string | null {
  const key = `participant_${sessionId}`;
  return localStorage.getItem(key);
}

function storeParticipantId(sessionId: string, participantId: string) {
  localStorage.setItem(`participant_${sessionId}`, participantId);
}

function getStoredSessionCode(): string | null {
  return localStorage.getItem('current_session_code');
}

function storeSessionCode(code: string) {
  localStorage.setItem('current_session_code', code);
}

function clearStoredSession(sessionId?: string) {
  localStorage.removeItem('current_session_code');
  if (sessionId) {
    localStorage.removeItem(`participant_${sessionId}`);
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const voteChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const isAdmin = myParticipant?.is_admin ?? false;

  const currentTask = tasks.find(
    (t) => t.id === session?.current_task_id
  ) ?? null;

  const cleanup = useCallback(() => {
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current = [];
    if (voteChannelRef.current) {
      supabase.removeChannel(voteChannelRef.current);
      voteChannelRef.current = null;
    }
  }, []);

  const loadSessionData = useCallback(async (sessionId: string) => {
    const [partRes, taskRes, storyRes] = await Promise.all([
      supabase.from('participants').select('*').eq('session_id', sessionId),
      supabase.from('tasks').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
      supabase.from('user_stories').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
    ]);

    if (partRes.data) {
      setParticipants(partRes.data);
      const storedId = getStoredParticipantId(sessionId);
      const me = partRes.data.find((p) => p.id === storedId) ?? null;
      setMyParticipant(me);
    }
    if (taskRes.data) setTasks(taskRes.data);
    if (storyRes.data) setUserStories(storyRes.data);
  }, []);

  const subscribeToSession = useCallback(
    (sessionId: string) => {
      cleanup();

      const ch1 = supabase
        .channel(`sessions:${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setSession(payload.new as unknown as Session);
            }
          }
        )
        .subscribe();

      const ch2 = supabase
        .channel(`participants:${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
          () => {
            supabase
              .from('participants')
              .select('*')
              .eq('session_id', sessionId)
              .then((res) => {
                if (res.data) {
                  setParticipants(res.data);
                  const storedId = getStoredParticipantId(sessionId);
                  const me = res.data.find((p) => p.id === storedId) ?? null;
                  setMyParticipant(me);
                }
              });
          }
        )
        .subscribe();

      const ch3 = supabase
        .channel(`tasks:${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `session_id=eq.${sessionId}` },
          () => {
            supabase
              .from('tasks')
              .select('*')
              .eq('session_id', sessionId)
              .order('created_at', { ascending: true })
              .then((res) => {
                if (res.data) setTasks(res.data);
              });
          }
        )
        .subscribe();

      const ch4 = supabase
        .channel(`user_stories:${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_stories', filter: `session_id=eq.${sessionId}` },
          () => {
            supabase
              .from('user_stories')
              .select('*')
              .eq('session_id', sessionId)
              .order('created_at', { ascending: true })
              .then((res) => {
                if (res.data) setUserStories(res.data);
              });
          }
        )
        .subscribe();

      channelsRef.current = [ch1, ch2, ch3, ch4];
    },
    [cleanup]
  );

  const subscribeToVotes = useCallback((taskId: string) => {
    if (voteChannelRef.current) {
      supabase.removeChannel(voteChannelRef.current);
      channelsRef.current = channelsRef.current.filter((c) => c !== voteChannelRef.current);
      voteChannelRef.current = null;
    }

    setVotes([]);

    const ch = supabase
      .channel(`votes:${taskId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `task_id=eq.${taskId}` },
        () => {
          supabase
            .from('votes')
            .select('*')
            .eq('task_id', taskId)
            .then((res) => {
              if (res.data) setVotes(res.data);
            });
        }
      )
      .subscribe();

    voteChannelRef.current = ch;
    channelsRef.current.push(ch);
  }, []);

  // Reconnect on mount if there's a stored session
  useEffect(() => {
    const storedCode = getStoredSessionCode();
    if (storedCode) {
      setLoading(true);
      supabase
        .from('sessions')
        .select('*')
        .eq('code', storedCode.toUpperCase())
        .single()
        .then(({ data, error: err }) => {
          if (data && !err) {
            setSession(data);
            loadSessionData(data.id);
            subscribeToSession(data.id);
          }
          setLoading(false);
        });
    }
  }, [loadSessionData, subscribeToSession]);

  // Subscribe to votes on current task when status is voting/revealed
  useEffect(() => {
    if (session?.current_task_id && (session.status === 'voting' || session.status === 'revealed')) {
      subscribeToVotes(session.current_task_id);
    }
  }, [session?.current_task_id, session?.status, subscribeToVotes]);

  // Auto-reset session to lobby if current task is stale (completed only — not missing)
  useEffect(() => {
    if (
      session &&
      (session.status === 'voting' || session.status === 'revealed') &&
      session.current_task_id
    ) {
      const task = tasks.find((t) => t.id === session.current_task_id);
      if (task && task.status === 'completed') {
        supabase
          .from('sessions')
          .update({ status: 'lobby', current_task_id: null })
          .eq('id', session.id)
          .then(() => {});
      }
    }
  }, [session?.current_task_id, session?.status, tasks]);

  const prevParticipantRef = useRef<string | null>(null);
  useEffect(() => {
    const currentId = myParticipant?.id ?? null;
    if (prevParticipantRef.current && !currentId && participants.length > 0) {
      clearStoredSession(session?.id);
      setSession(null);
      setParticipants([]);
      setTasks([]);
      setUserStories([]);
      setVotes([]);
      setMyParticipant(null);
      cleanup();
      window.history.replaceState(null, '', window.location.pathname);
    }
    prevParticipantRef.current = currentId;
  }, [myParticipant, participants, session, cleanup]);

  const createSession = useCallback(
    async (adminName: string, sessionName?: string): Promise<string> => {
      setLoading(true);
      setError(null);

      let code: string;
      let attempts = 0;
      do {
        code = generateCode();
        attempts++;
        if (attempts > 5) {
          setError('Could not generate unique code');
          setLoading(false);
          return '';
        }
        const { data: existing } = await supabase
          .from('sessions')
          .select('id')
          .eq('code', code)
          .maybeSingle();
        if (!existing) break;
      } while (true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Debes iniciar sesión para crear una sala.');
        setLoading(false);
        return '';
      }

      const { data: newSession, error: sessionErr } = await supabase
        .from('sessions')
        .insert({ code, name: sessionName || null, status: 'lobby', admin_id: user.id })
        .select()
        .single();

      if (sessionErr || !newSession) {
        setError(sessionErr?.message ?? 'Failed to create session');
        setLoading(false);
        return '';
      }

      const { data: adminPart, error: partErr } = await supabase
        .from('participants')
        .insert({
          session_id: newSession.id,
          name: adminName,
          weight: 1,
          is_admin: true,
        })
        .select()
        .single();

      if (partErr || !adminPart) {
        setError(partErr?.message ?? 'Failed to create participant');
        setLoading(false);
        return '';
      }

      await supabase
        .from('sessions')
        .update({ admin_participant_id: adminPart.id })
        .eq('id', newSession.id);

      newSession.admin_participant_id = adminPart.id;

      setSession(newSession);
      setParticipants([adminPart]);
      setMyParticipant(adminPart);
      setTasks([]);
      setUserStories([]);
      setVotes([]);
      storeParticipantId(newSession.id, adminPart.id);
      storeSessionCode(code);
      subscribeToSession(newSession.id);
      setLoading(false);
      return code;
    },
    [subscribeToSession]
  );

  const joinSession = useCallback(
    async (code: string, name: string) => {
      setLoading(true);
      setError(null);

      const { data: found, error: findErr } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (findErr || !found) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      const storedId = getStoredParticipantId(found.id);
      if (storedId) {
        const { data: existing } = await supabase
          .from('participants')
          .select('*')
          .eq('id', storedId)
          .eq('session_id', found.id)
          .single();

        if (existing) {
          setSession(found);
          setMyParticipant(existing);
          storeSessionCode(found.code);
          loadSessionData(found.id);
          subscribeToSession(found.id);
          setLoading(false);
          return;
        }

        localStorage.removeItem(`participant_${found.id}`);
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser && found.admin_id === authUser.id) {
        const { data: adminPart } = await supabase
          .from('participants')
          .select('*')
          .eq('session_id', found.id)
          .eq('is_admin', true)
          .single();

        if (adminPart) {
          setSession(found);
          setMyParticipant(adminPart);
          storeParticipantId(found.id, adminPart.id);
          storeSessionCode(found.code);
          loadSessionData(found.id);
          subscribeToSession(found.id);
          setLoading(false);
          return;
        }
      }

      const { data: sameName } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', found.id)
        .eq('name', name)
        .maybeSingle();

      if (sameName) {
        setSession(found);
        setMyParticipant(sameName);
        storeParticipantId(found.id, sameName.id);
        storeSessionCode(found.code);
        loadSessionData(found.id);
        subscribeToSession(found.id);
        setLoading(false);
        return;
      }

      const { data: newPart, error: partErr } = await supabase
        .from('participants')
        .insert({
          session_id: found.id,
          name,
          weight: 1,
          is_admin: false,
        })
        .select()
        .single();

      if (partErr || !newPart) {
        setError(partErr?.message ?? 'Failed to join');
        setLoading(false);
        return;
      }

      setSession(found);
      setMyParticipant(newPart);
      storeParticipantId(found.id, newPart.id);
      storeSessionCode(found.code);
      loadSessionData(found.id);
      subscribeToSession(found.id);
      setLoading(false);
    },
    [loadSessionData, subscribeToSession]
  );

  const leaveSession = useCallback(() => {
    cleanup();
    window.history.replaceState(null, '', window.location.pathname);
    if (session) clearStoredSession(session.id);
    else clearStoredSession();
    setSession(null);
    setParticipants([]);
    setTasks([]);
    setUserStories([]);
    setVotes([]);
    setMyParticipant(null);
  }, [cleanup, session]);

  const addTask = useCallback(async (title: string, userStoryId: string | null = null) => {
    if (!session) return;
    await supabase.from('tasks').insert({
      session_id: session.id,
      title,
      user_story_id: userStoryId,
    });
  }, [session]);

  const deleteTask = useCallback(async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
  }, []);

  const addUserStory = useCallback(async (title: string) => {
    if (!session) return;
    await supabase.from('user_stories').insert({
      session_id: session.id,
      title,
    });
  }, [session]);

  const deleteUserStory = useCallback(async (storyId: string) => {
    await supabase.from('user_stories').delete().eq('id', storyId);
  }, []);

  const startVoting = useCallback(
    async (taskId: string) => {
      if (!session) return;
      await supabase
        .from('tasks')
        .update({ status: 'active' })
        .eq('id', taskId);
      await supabase
        .from('sessions')
        .update({ status: 'voting', current_task_id: taskId })
        .eq('id', session.id);
    },
    [session]
  );

  const castVote = useCallback(
    async (value: number) => {
      if (!session?.current_task_id || !myParticipant) return;
      await supabase.from('votes').upsert({
        task_id: session.current_task_id,
        participant_id: myParticipant.id,
        value,
      });
      setVotes((prev) => {
        const idx = prev.findIndex((v) => v.participant_id === myParticipant.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], value };
          return next;
        }
        return [...prev, {
          id: `temp-${Date.now()}`,
          task_id: session.current_task_id!,
          participant_id: myParticipant.id,
          value,
          created_at: new Date().toISOString(),
        }];
      });
    },
    [session?.current_task_id, myParticipant]
  );

  const revealVotes = useCallback(async () => {
    if (!session?.current_task_id) return;
    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('task_id', session.current_task_id);
    if (data) setVotes(data);
    await supabase
      .from('sessions')
      .update({ status: 'revealed' })
      .eq('id', session.id);
  }, [session]);

  const confirmEstimate = useCallback(
    async (estimate: number) => {
      if (!session?.current_task_id) return;
      await supabase
        .from('tasks')
        .update({ status: 'completed', final_estimate: estimate })
        .eq('id', session.current_task_id);
      await supabase
        .from('sessions')
        .update({ status: 'lobby', current_task_id: null })
        .eq('id', session.id);
      setVotes([]);
    },
    [session]
  );

  const resetRound = useCallback(async () => {
    if (!session?.current_task_id) return;
    await supabase
      .from('votes')
      .delete()
      .eq('task_id', session.current_task_id);
    await supabase
      .from('sessions')
      .update({ status: 'voting' })
      .eq('id', session.id);
    setVotes([]);
  }, [session]);

  const updateWeight = useCallback(
    async (participantId: string, weight: number) => {
      await supabase
        .from('participants')
        .update({ weight })
        .eq('id', participantId);
    },
    []
  );

  const removeParticipant = useCallback(
    async (participantId: string) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      await supabase.from('participants').delete().eq('id', participantId);
    },
    []
  );

  const deleteSession = useCallback(async () => {
    if (!session) return;
    cleanup();
    clearStoredSession(session.id);
    window.history.replaceState(null, '', window.location.pathname);
    await supabase.from('sessions').delete().eq('id', session.id);
    setSession(null);
    setParticipants([]);
    setTasks([]);
    setUserStories([]);
    setVotes([]);
    setMyParticipant(null);
  }, [session, cleanup]);

  const value = useMemo(() => ({
    session,
    participants,
    tasks,
    userStories,
    currentTask,
    votes,
    myParticipant,
    isAdmin,
    error,
    loading,
    createSession,
    joinSession,
    leaveSession,
    addTask,
    deleteTask,
    addUserStory,
    deleteUserStory,
    startVoting,
    castVote,
    revealVotes,
    confirmEstimate,
    resetRound,
    updateWeight,
    removeParticipant,
    deleteSession,
  }), [
    session,
    participants,
    tasks,
    userStories,
    currentTask,
    votes,
    myParticipant,
    isAdmin,
    error,
    loading,
    createSession,
    joinSession,
    leaveSession,
    addTask,
    deleteTask,
    addUserStory,
    deleteUserStory,
    startVoting,
    castVote,
    revealVotes,
    confirmEstimate,
    resetRound,
    updateWeight,
    removeParticipant,
    deleteSession,
  ]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
