import CircularProgress from '@mui/material/CircularProgress';

export function Spinner({ label }: { label: string }) {
  return <CircularProgress aria-label={label} />;
}
