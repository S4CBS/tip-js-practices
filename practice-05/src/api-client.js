export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(cleanPath, base);

  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null || val === "") continue;
    url.searchParams.set(key, String(val));
  }

  return url.toString();
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  if (typeof baseUrl !== "string") {
    throw new TypeError("baseUrl должен быть строкой.");
  }

  let parsedBase;
  try {
    parsedBase = new URL(baseUrl);
  } catch (err) {
    throw new TypeError(`Некорректный baseUrl: ${err.message}`);
  }

  if (parsedBase.protocol !== "http:" && parsedBase.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать протокол http: или https:.");
  }
  if (parsedBase.search || parsedBase.hash) {
    throw new TypeError("baseUrl не должен содержать query-параметры или hash.");
  }

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией.");
  }

  if (typeof timeoutMs !== "number" || !Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом.");
  }

  return {
    async requestJson(path, { query, signal, timeoutMs: requestTimeout } = {}) {
      const fullUrl = buildUrl(baseUrl, path, query);
      const effectiveTimeout = requestTimeout ?? timeoutMs;

      const controller = new AbortController();
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort(new Error("Timeout"));
      }, effectiveTimeout);

      let externalAbortHandler = null;
      if (signal) {
        if (signal.aborted) {
          clearTimeout(timer);
          controller.abort(signal.reason);
        } else {
          externalAbortHandler = () => {
            clearTimeout(timer);
            controller.abort(signal.reason);
          };
          signal.addEventListener("abort", externalAbortHandler, { once: true });
        }
      }

      try {
        let response;
        try {
          response = await fetchFn(fullUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
          if (signal && externalAbortHandler) {
            signal.removeEventListener("abort", externalAbortHandler);
          }
        }

        if (!response || typeof response !== "object" || !(response instanceof Response)) {
          throw new ApiError("Некорректный объект ответа сервера.", {
            kind: "invalid-response",
            url: fullUrl,
          });
        }

        if (response.status === 204) {
          return null;
        }

        if (!response.ok) {
          let errorPayload = null;
          try {
            errorPayload = await response.json();
          } catch {
            // Игнорируем ошибку парсинга ошибки
          }

          const message = errorPayload?.error?.message ?? `HTTP error ${response.status}`;
          const code = errorPayload?.error?.code ?? null;
          const details = errorPayload?.error?.details ?? null;

          throw new ApiError(message, {
            kind: "http",
            status: response.status,
            code,
            details,
            url: fullUrl,
          });
        }

        const contentType = response.headers?.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new ApiError(`Неверный Content-Type: ${contentType}`, {
            kind: "invalid-response",
            status: response.status,
            url: fullUrl,
          });
        }

        try {
          return await response.json();
        } catch (jsonErr) {
          throw new ApiError("Не удалось разобрать JSON ответа.", {
            kind: "invalid-response",
            status: response.status,
            url: fullUrl,
            cause: jsonErr,
          });
        }
      } catch (err) {
        if (err instanceof ApiError) {
          throw err;
        }

        if (timedOut) {
          throw new ApiError("Превышено время ожидания ответа сервера.", {
            kind: "timeout",
            url: fullUrl,
            cause: err,
          });
        }

        if (signal?.aborted) {
          throw new ApiError("Запрос был отменен пользователем.", {
            kind: "aborted",
            url: fullUrl,
            cause: err,
          });
        }

        throw new ApiError(err.message, {
          kind: "network",
          url: fullUrl,
          cause: err,
        });
      }
    },
  };
}
