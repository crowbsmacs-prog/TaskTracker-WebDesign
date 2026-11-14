
let failures = 0;
let unlockTimer = null;

// Повідомлення про проблеми із сервером
const banner = document.createElement("div");
banner.textContent = "Сервер перевантажений. Спробуйте пізніше.";
banner.hidden = true;

banner.style.cssText = `
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff3cd;
  color: #664d03;
  padding: 14px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px #0002;
  z-index: 9999;
  font-family: Arial, sans-serif;
  max-width: 90%;
  text-align: center;
`;

document.body.appendChild(banner);

let blockedButtons = [];

function registerFailure() {
  failures++;

  if (failures < 3) return;

  banner.hidden = false;

  if (unlockTimer) return;

  // Запам'ятовуємо лише активні кнопки
  blockedButtons = [
    ...document.querySelectorAll("button:not(:disabled)")
  ];

  blockedButtons.forEach(button => button.disabled = true);

  // Через 5 секунд дозволяємо спробувати знову
  unlockTimer = setTimeout(() => {
    blockedButtons.forEach(button => button.disabled = false);
    blockedButtons = [];

    banner.hidden = true;
    failures = 0;
    unlockTimer = null;
  }, 5000);
}

// Обгортка навколо HTTP-помічника
async function fetchWithUi(url, options = {}) {
  try {
    const response = await fetchWithResilience(url, options);

    if (response.status === 429 || response.status >= 500) {
      registerFailure();
    } else if (response.ok && !unlockTimer) {
      failures = 0;
    }

    return response;
  } catch (error) {
    registerFailure();
    throw error;
  }
}

window.fetchWithUi = fetchWithUi;
