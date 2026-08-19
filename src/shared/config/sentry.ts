import type {
  Breadcrumb,
  ErrorEvent,
} from "@sentry/nextjs";

const FILTERED_VALUE = "[Filtered]";

const SENTRY_ENVIRONMENTS = ["preview", "production"] as const;

const SENSITIVE_KEY_PATTERN =
  /(?:authorization|cookie|access[_-]?token|refresh[_-]?token|id[_-]?token|token|password|passcode|secret|api[_-]?key|session(?:[_-]?id)?|email|e[_-]?mail|phone|address|resident|credit[_-]?card|card[_-]?number|cvv)/i;

const SENSITIVE_QUERY_PARAMETER_PATTERN =
  /([?&](?:access[_-]?token|refresh[_-]?token|id[_-]?token|token|authorization|password|passcode|secret|api[_-]?key|session(?:[_-]?id)?|email|e[_-]?mail|phone|address|credit[_-]?card|card[_-]?number|cvv)=)[^&#\s]*/gi;

const SENSITIVE_ASSIGNMENT_PATTERN =
  /((?:access[_-]?token|refresh[_-]?token|id[_-]?token|token|authorization|password|passcode|secret|api[_-]?key|cookie|session(?:[_-]?id)?|email|e[_-]?mail|phone|address|resident|credit[_-]?card|card[_-]?number|cvv)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^,\s;]+)/gi;

const BEARER_TOKEN_PATTERN = /(Bearer\s+)[A-Za-z0-9\-._~+/=]+/gi;
const JSON_WEB_TOKEN_PATTERN =
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_NUMBER_PATTERN =
  /(?<!\d)(?:\+?\d{1,3}[-.\s]?)?(?:\d{2,4}[-.\s]?){2,3}\d{3,4}(?!\d)/g;
const RESIDENT_REGISTRATION_NUMBER_PATTERN = /\b\d{6}-[1-4]\d{6}\b/g;
const CARD_NUMBER_PATTERN = /\b(?:\d[ -]?){13,19}\b/g;

export type SentryEnvironment = (typeof SENTRY_ENVIRONMENTS)[number];

type SentryOptionsInput = {
  deploymentEnvironment: string | undefined;
  dsn: string | undefined;
  release: string | undefined;
};

type SanitizableSentryEvent = {
  breadcrumbs?: Breadcrumb[];
  request?: unknown;
  user?: unknown;
};

const normalizeOptionalValue = (value: string | undefined) => {
  const normalizedValue = value?.trim();

  return normalizedValue || undefined;
};

export const getSentryEnvironment = (
  deploymentEnvironment: string | undefined,
): SentryEnvironment | undefined =>
  SENTRY_ENVIRONMENTS.find(
    (environment) => environment === deploymentEnvironment,
  );

export const isSentryEnabled = (deploymentEnvironment: string | undefined) =>
  getSentryEnvironment(deploymentEnvironment) !== undefined;

export const getSentryTraceSampleRate = (
  environment: SentryEnvironment | undefined,
) => {
  if (environment === "preview") {
    return 0.2;
  }

  if (environment === "production") {
    return 0.1;
  }

  return 0;
};

const sanitizeSentryString = (value: string) =>
  value
    .replace(SENSITIVE_QUERY_PARAMETER_PATTERN, `$1${FILTERED_VALUE}`)
    .replace(SENSITIVE_ASSIGNMENT_PATTERN, `$1${FILTERED_VALUE}`)
    .replace(BEARER_TOKEN_PATTERN, `$1${FILTERED_VALUE}`)
    .replace(JSON_WEB_TOKEN_PATTERN, FILTERED_VALUE)
    .replace(EMAIL_PATTERN, FILTERED_VALUE)
    .replace(RESIDENT_REGISTRATION_NUMBER_PATTERN, FILTERED_VALUE)
    .replace(CARD_NUMBER_PATTERN, FILTERED_VALUE)
    .replace(PHONE_NUMBER_PATTERN, FILTERED_VALUE);

const sanitizeSentryValue = (
  value: unknown,
  visited = new WeakSet<object>(),
): unknown => {
  if (typeof value === "string") {
    return sanitizeSentryString(value);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (visited.has(value)) {
    return "[Circular]";
  }

  visited.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSentryValue(item, visited));
  }

  const sanitizedValue: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    sanitizedValue[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? FILTERED_VALUE
      : sanitizeSentryValue(item, visited);
  }

  return sanitizedValue;
};

export const sanitizeSentryBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  const sanitizedBreadcrumb = sanitizeSentryValue(breadcrumb) as Breadcrumb;

  // breadcrumb의 메시지와 부가 데이터는 사용자 입력이나 요청 값을 포함할 수 있어 전송하지 않습니다.
  return {
    category: sanitizedBreadcrumb.category,
    level: sanitizedBreadcrumb.level,
    timestamp: sanitizedBreadcrumb.timestamp,
    type: sanitizedBreadcrumb.type,
  };
};

const sanitizeSentryEvent = <T extends SanitizableSentryEvent>(
  event: T,
): T => {
  const sanitizedEvent = sanitizeSentryValue(event) as T;

  // 요청·사용자 객체는 SDK가 자동 수집하지 않도록 막고, 수동 추가된 경우에도 제거합니다.
  delete sanitizedEvent.request;
  delete sanitizedEvent.user;

  if (sanitizedEvent.breadcrumbs) {
    sanitizedEvent.breadcrumbs = sanitizedEvent.breadcrumbs.map(
      sanitizeSentryBreadcrumb,
    );
  }

  return sanitizedEvent;
};

export const sanitizeSentryErrorEvent = (event: ErrorEvent): ErrorEvent =>
  sanitizeSentryEvent(event);

export const sanitizeSentryTransactionEvent = <T extends SanitizableSentryEvent>(
  event: T,
): T => sanitizeSentryEvent(event);

export const sanitizeSentrySpan = <T>(span: T): T =>
  sanitizeSentryValue(span) as T;

export const createSentryOptions = ({
  deploymentEnvironment,
  dsn,
  release,
}: SentryOptionsInput) => {
  const environment = getSentryEnvironment(deploymentEnvironment);
  const normalizedDsn = normalizeOptionalValue(dsn);
  const enabled = Boolean(environment && normalizedDsn);

  return {
    dsn: normalizedDsn,
    enabled,
    environment,
    release: enabled ? normalizeOptionalValue(release) : undefined,
    tracesSampleRate: getSentryTraceSampleRate(environment),
    maxBreadcrumbs: 20,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: false,
        response: false,
      },
      httpBodies: [],
      urlQueryParams: false,
      graphQL: {
        document: false,
        variables: false,
      },
      genAI: {
        inputs: false,
        outputs: false,
      },
      databaseQueryData: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeBreadcrumb: sanitizeSentryBreadcrumb,
    beforeSend: sanitizeSentryErrorEvent,
    beforeSendTransaction: sanitizeSentryTransactionEvent,
    beforeSendSpan: sanitizeSentrySpan,
  };
};
