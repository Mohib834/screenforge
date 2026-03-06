import log from 'electron-log/main';

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
} as const;

const LEVEL_COLOR: Record<string, string> = {
  error: ANSI.red,
  warn: ANSI.yellow,
  info: ANSI.cyan,
  verbose: ANSI.magenta,
  debug: ANSI.gray,
  silly: ANSI.gray,
};

const serialize = (value: unknown): string => {
  if (value instanceof Error) return value.stack ?? value.message;
  if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2);
  return String(value);
};

log.transports.file.level = 'info';
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

log.transports.console.level = 'debug';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
log.transports.console.format = (message: any) => {
  const color = LEVEL_COLOR[message.level] ?? '';
  const time = `${ANSI.dim}[${new Date().toLocaleTimeString('en-US', { hour12: false })}]${ANSI.reset}`;
  const level = `${color}${message.level.toUpperCase()}${ANSI.reset}`;
  const text = (message.data ?? []).map(serialize).join(' ');
  return [`${time} ${level} › ${text}`];
};

export default log;
