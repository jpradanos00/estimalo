import { useSession } from '../hooks/useSession';
import { SessionHeader } from '../components/SessionHeader';
import { ParticipantList } from '../components/ParticipantList';
import { TaskBoard } from '../components/TaskBoard';
import { VotingRound } from '../components/VotingRound';

export function SessionRoom() {
  const { session } = useSession();

  if (!session) return null;

  const isVoting = session.status === 'voting' || session.status === 'revealed';

  return (
    <div className="flex-1">
      <SessionHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isVoting ? (
          <VotingRound />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskBoard />
            </div>
            <div>
              <ParticipantList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
