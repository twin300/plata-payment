const form = document.querySelector("[data-payment-form]");
const error = document.querySelector("[data-error]");

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const name = form.customerName.value.trim();
    const agreed = form.agreed.checked;

    if (!validEmail(email)) {
      error.textContent = "Введите корректный email.";
      error.style.display = "block";
      return;
    }

    if (!agreed) {
      error.textContent = "Нужно принять оферту и политику обработки персональных данных.";
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    const text = [
      "Здравствуйте! Хочу оплатить разработку лендинга.",
      "Сумма: 4900 ₽",
      `Email: ${email}`,
      name ? `Имя: ${name}` : "",
    ].filter(Boolean).join("\n");

    window.location.href = `https://t.me/matveygeek?text=${encodeURIComponent(text)}`;
  });
}
