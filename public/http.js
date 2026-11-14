
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithResilience(url, options = {}) {
  const {
    retries = 2,
    timeoutMs = 1000,
    baseDelayMs = 300,
    idempotencyKey,
    ...fetchOptions
  } = options;

  const headers = new Headers(fetchOptions.headers || {});

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();

    // Кожна спроба має обмеження часу
    const timer = setTimeout(
      () => controller.abort(),
      timeoutMs
    );

    let response;
    let failure;

    try {
      headers.set("X-Request-Id", crypto.randomUUID());

      response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });
    } catch (error) {
      failure = error;
    } finally {
      clearTimeout(timer);
    }

    if (response) {
      // Успішна відповідь або помилка без повтору
      if (
        attempt === retries ||
        (response.status !== 429 && response.status < 500)
      ) {
        return response;
      }
    } else if (attempt === retries) {
      throw failure;
    }

    // Експоненційна затримка з випадковою добавкою
    let delay =
      baseDelayMs * (2 ** attempt) +
      Math.floor(Math.random() * 150);

    // Для 429 використовуємо Retry-After
    if (response?.status === 429) {
      const seconds = Number(
        response.headers.get("Retry-After")
      );

      if (Number.isFinite(seconds) && seconds >= 0) {
        delay = seconds * 1000;
      }
    }

    console.log(
      `Повторна спроба ${attempt + 1} через ${delay} мс`
    );

    await sleep(delay);
  }
}

window.fetchWithResilience = fetchWithResilience;
