// PROTOTYPE, throwaway: "What should the Voice Inbox indicator above the Dock look like?"
// Three variants, switchable with ?voiceInbox=A|B|C on any page with the Dock. Notes are fake:
// use the "Record" buttons in the switcher (the real mic still records one note at a time).
import { useLocation, useSearchParams } from 'react-router-dom';
import { defaultTargetFor } from '../../VoiceNote';
import { PrototypeSwitcher } from '../../PrototypeSwitcher';
import { INBOX_LIMIT, inbox, summary, useInbox, type Outcome } from './store';
import { ReviewStub } from './shared';
import { VARIANTS } from './variants';

const PARAM = 'voiceInbox';

export function VoiceInboxPrototype() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const { notes, readMs } = useInbox();
  const key = params.get(PARAM);
  if (import.meta.env.PROD || !key) return null;
  const variant = VARIANTS.find((v) => v.key === key) ?? VARIANTS[0];
  const record = (outcome: Outcome) => {
    if (!inbox.record(defaultTargetFor(pathname), outcome))
      alert('Review your notes first (Voice Inbox holds 5)');
  };
  const chip = {
    background: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: 8,
    padding: '3px 8px',
    font: 'inherit',
    cursor: 'pointer',
  };
  return (
    <>
      <variant.Component />
      <ReviewStub />
      <PrototypeSwitcher param={PARAM} variants={VARIANTS}>
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button style={chip} onClick={() => record('ready')}>
            + Record
          </button>
          <button style={chip} onClick={() => record('answers')}>
            + Question
          </button>
          <button style={chip} onClick={() => record('failed')}>
            + Will fail
          </button>
          <button
            style={chip}
            onClick={() => inbox.setReadMs(readMs === 4000 ? 12000 : 4000)}
          >
            read {readMs / 1000}s
          </button>
          <button style={chip} onClick={inbox.reset}>
            reset
          </button>
        </div>
        <div style={{ opacity: 0.75 }}>
          {notes.length}/{INBOX_LIMIT} · {summary(notes) || 'empty'}
        </div>
      </PrototypeSwitcher>
    </>
  );
}
