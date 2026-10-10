import {
  Alert,
  Box,
  Button,
  CloseIcon,
  Link,
  Spinner,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { readScans } from '../../lib/scanReads';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateApiError } from '../../i18n/translateApiError';
import { AppScreenHeader } from '../../components/AppScreenHeader';
import { PlateChoice, cardId } from './components/PlateChoice';
import {
  ReceiptCropper,
  type ReceiptCrop,
} from '../../components/ReceiptCropper';
import { cropToReceiptArea } from '../../lib/image';
import type { ProposedLine } from '../../lib/scan';
import { useSaveScan } from '../../lib/saveScan';
import {
  canRetry,
  canMerge,
  dispatchScanSession,
  getScanSession,
  pendingCount,
  resetScanSession,
  useScanSession,
  type SessionScan,
} from '../../lib/scanSession';

const MAX_CHIPS = 8;

const linkButton = {
  mr: 1.5,
  p: 0,
  border: 0,
  background: 'none',
  color: tokens.color.accent,
  font: 'inherit',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const nameOf = (line: ProposedLine) => line.match?.name ?? line.name;

/**
 * The overview a Member lands on from Done: one card per Scan of the Scan Session, in the order
 * the Scans were taken. A card opens the line editor for that Scan alone, at /scan/review/:scanId.
 */
export function ReviewOverviewPage() {
  const { t } = useTranslation('review');
  const { t: tScan } = useTranslation('scan');
  const { t: tAll, i18n } = useTranslation();
  const saveScan = useSaveScan(i18n.language);
  const [saving, setSaving] = useState(false);
  // Why each card's last save failed; the card stays until a later Add saves it.
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const navigate = useNavigate();
  const session = useScanSession();
  const reading = pendingCount(session);
  /** The gallery receipt being cropped. */
  const [cropping, setCropping] = useState<SessionScan | null>(null);
  const [cropFailed, setCropFailed] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  // The Crop button is gone once the card is read: keep the focus on the card.
  useEffect(() => {
    if (!focusId) return;
    document.querySelector<HTMLElement>(`[data-scan-id="${focusId}"]`)?.focus();
    setFocusId(null);
  }, [focusId]);

  const crop = async ({ area, rotation }: ReceiptCrop) => {
    const scan = cropping;
    setCropping(null);
    if (!scan?.source) return;
    try {
      const image = await cropToReceiptArea(scan.source, area, rotation);
      setCropFailed(null);
      dispatchScanSession({ type: 'crop', id: scan.id, image });
      setFocusId(scan.id);
      readScans(i18n.language);
    } catch {
      setCropFailed(scan.id);
    }
  };

  // A Plate Scan still showing its dish guesses has nothing to save yet.
  const savable = (scan: SessionScan) => scan.status === 'read' && !scan.dishes;
  const anyRead = session.scans.some(savable);
  // Photos saved over every press of Add, for the toast.
  const added = useRef(0);

  /** Saves each read card in turn, trying all of them; the cards that fail stay with their error. */
  const addAll = async () => {
    setSaving(true);
    setErrors({});
    for (const scan of getScanSession().scans) {
      // Opened and saved in the editor, or removed, since Add started.
      if (!getScanSession().scans.some((s) => s.id === scan.id)) continue;
      if (!savable(scan)) continue;
      try {
        await saveScan(scan);
        dispatchScanSession({ type: 'remove', id: scan.id });
        added.current += 1;
      } catch (error) {
        setErrors((was) => ({ ...was, [scan.id]: error }));
      }
    }
    setSaving(false);
    // Failed reads are dropped with the rest; only a card whose save failed keeps the Member here.
    if (getScanSession().scans.some((scan) => scan.status === 'read')) return;
    resetScanSession();
    navigate('/scan', { state: { added: added.current } });
  };
  const discardAll = () => {
    resetScanSession();
    navigate('/scan', { state: { discarded: true } });
  };

  const card = (scan: SessionScan) => {
    const isFailed = scan.status === 'failed';
    const isReading = scan.status === 'queued' || scan.status === 'reading';
    // Lines Receipt Scan left out are not saved, so they are not counted or shown.
    const lines = (scan.lines ?? []).filter((line) => !line.excluded);
    const check = lines.filter(
      (line) => line.lowConfidence || line.match === null,
    ).length;
    const mergeable = canMerge(session, scan.id);
    const result =
      scan.mode === 'product' && lines.length > 0
        ? nameOf(lines[0])
        : t('overview.items', { count: lines.length });
    return (
      <Box
        component="li"
        key={scan.id}
        data-testid="review-card"
        id={cardId(scan.id)}
        data-scan-id={scan.id}
        tabIndex={-1}
        sx={{
          '&:focus-visible': {
            outline: `2px solid ${tokens.color.accentMid}`,
            outlineOffset: 2,
          },
          position: 'relative',
          display: 'flex',
          gap: 1.5,
          p: 1.5,
          borderRadius: `${tokens.radius.card}px`,
          border: `1px solid ${tokens.color.line}`,
          backgroundColor: tokens.color.surface,
        }}
      >
        <Box
          component="img"
          src={scan.thumbnail}
          alt=""
          sx={{
            flex: 'none',
            width: 56,
            height: 72,
            borderRadius: '10px',
            objectFit: 'cover',
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: tokens.color.accent,
            }}
          >
            {tScan(`mode.${scan.mode}`)}
          </Typography>
          {isReading ? (
            <Box
              role="status"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  '& .MuiCircularProgress-root': {
                    width: '18px !important',
                    height: '18px !important',
                  },
                }}
              >
                <Spinner label={t('overview.reading')} />
              </Box>
              <Typography>{t('overview.reading')}</Typography>
            </Box>
          ) : scan.dishes ? (
            <PlateChoice scan={scan} />
          ) : isFailed ? (
            <>
              <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                {t('overview.failed')}
              </Typography>
              {scan.errorCode && !canRetry(scan) ? (
                <Typography sx={{ fontSize: 13 }}>
                  {tScan(`errors:${scan.errorCode}`, scan.errorParams)}
                </Typography>
              ) : null}
            </>
          ) : scan.status === 'uncropped' ? (
            <>
              <Box
                component="button"
                type="button"
                onClick={() => setCropping(scan)}
                sx={{
                  display: 'block',
                  p: 0,
                  mt: 0.5,
                  border: 0,
                  background: 'none',
                  color: tokens.color.accent,
                  font: 'inherit',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t('overview.crop')}
              </Box>
              {cropFailed === scan.id ? (
                <Alert>{t('errors:scan.image_invalid')}</Alert>
              ) : null}
            </>
          ) : (
            <>
              <Box
                component="button"
                type="button"
                data-testid="card-result"
                disabled={saving}
                onClick={() => navigate(`/scan/review/${scan.id}`)}
                sx={{
                  display: 'block',
                  p: 0,
                  mt: 0.5,
                  border: 0,
                  background: 'none',
                  color: 'inherit',
                  font: 'inherit',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer',
                  // Stretch the button over the whole card.
                  '&::after': { content: '""', position: 'absolute', inset: 0 },
                }}
              >
                {result}
              </Box>
              <Box
                component="ul"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  m: 0,
                  mt: 0.75,
                  p: 0,
                  listStyle: 'none',
                }}
              >
                {lines.slice(0, MAX_CHIPS).map((line, index) => (
                  <Box
                    component="li"
                    key={index}
                    data-testid="card-chip"
                    sx={{
                      px: '10px',
                      py: '2px',
                      borderRadius: `${tokens.radius.chip}px`,
                      fontSize: 12,
                      backgroundColor: tokens.color.accentTint,
                      color: tokens.color.accent,
                    }}
                  >
                    {nameOf(line)}
                  </Box>
                ))}
                {lines.length > MAX_CHIPS ? (
                  <Box component="li" sx={{ fontSize: 12 }}>
                    {t('overview.more', { count: lines.length - MAX_CHIPS })}
                  </Box>
                ) : null}
              </Box>
              {scan.sections || mergeable ? (
                <Box sx={{ position: 'relative', zIndex: 1, mt: 0.75 }}>
                  {mergeable ? (
                    <Box
                      component="button"
                      type="button"
                      onClick={() =>
                        dispatchScanSession({ type: 'merge', id: scan.id })
                      }
                      sx={linkButton}
                    >
                      {t('overview.merge')}
                    </Box>
                  ) : null}
                  {scan.sections ? (
                    <Box
                      component="button"
                      type="button"
                      onClick={() =>
                        dispatchScanSession({ type: 'split', id: scan.id })
                      }
                      sx={linkButton}
                    >
                      {t('overview.split')}
                    </Box>
                  ) : null}
                </Box>
              ) : null}
              {check > 0 ? (
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 13,
                    fontWeight: 700,
                    color: tokens.color.urgentFg,
                  }}
                >
                  {t('overview.check', { count: check })}
                </Typography>
              ) : null}
              {errors[scan.id] ? (
                <Box sx={{ mt: 1 }}>
                  <Alert>{translateApiError(tAll, errors[scan.id])}</Alert>
                </Box>
              ) : null}
            </>
          )}
        </Box>
        {isReading ? null : (
          <Box
            component="button"
            type="button"
            aria-label={t('overview.remove')}
            disabled={saving}
            onClick={() => {
              dispatchScanSession({ type: 'remove', id: scan.id });
              // Scans held back by the Scan Cap can go on now.
              readScans(i18n.language);
            }}
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: 'none',
              alignSelf: 'flex-start',
              p: 0.5,
              border: 0,
              background: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <CloseIcon size={18} />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <div data-testid="review-overview">
      <AppScreenHeader
        title={t('title')}
        subtitle={[
          t('overview.photos', { count: session.scans.length }),
          reading > 0
            ? t('overview.stillReading', { count: reading })
            : t('overview.allRead'),
        ].join(' · ')}
        trailing={<Link href="/scan">{t('overview.camera')}</Link>}
      />
      {session.scans.length === 0 ? (
        <Typography color="text.secondary">{t('overview.empty')}</Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {session.scans.map(card)}
        </Box>
      )}
      {session.scans.length > 0 ? (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          <Button
            onClick={() => void addAll()}
            disabled={reading > 0 || saving || !anyRead}
          >
            {reading > 0
              ? t('overview.addWaiting', { count: reading })
              : t('overview.add')}
          </Button>
          <Button variant="secondary" onClick={discardAll} disabled={saving}>
            {t('overview.discardAll')}
          </Button>
        </Box>
      ) : null}
      {cropping?.source ? (
        <ReceiptCropper
          photo={cropping.source}
          onConfirm={(value) => void crop(value)}
          onCancel={() => setCropping(null)}
        />
      ) : null}
    </div>
  );
}
