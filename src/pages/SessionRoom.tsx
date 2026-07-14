import { useSession } from '../hooks/useSession';
import { SessionHeader } from '../components/SessionHeader';
import { ParticipantList } from '../components/ParticipantList';
import { TaskBoard } from '../components/TaskBoard';
import { VotingRound } from '../components/VotingRound';
import { NudgeNotification } from '../components/NudgeNotification';

export function SessionRoom() {
  const { session } = useSession();

  if (!session) return null;

  const isVoting = session.status === 'voting' || session.status === 'revealed';

  return (
    <div className="flex-1">
      <SessionHeader />
      <NudgeNotification />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isVoting ? (
          <VotingRound />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <TaskBoard />
            </div>
            <div className="lg:min-w-[260px] lg:max-w-xs lg:shrink-0">
              <ParticipantList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
