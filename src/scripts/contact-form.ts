type ContactStatusState = "success" | "error" | "pending";

const forms = document.querySelectorAll<HTMLFormElement>(".contact-form");

const setStatus = (form: HTMLFormElement, state: ContactStatusState, message: string) => {
  const statusEl = form.querySelector<HTMLParagraphElement>("[data-contact-status]");
  if (!statusEl) {
    return;
  }
  statusEl.hidden = false;
  statusEl.dataset.state = state;
  statusEl.textContent = message;
};

const getField = (form: HTMLFormElement, name: string) =>
  form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);

const clearErrors = (form: HTMLFormElement) => {
  form.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
};

const markError = (field?: HTMLInputElement | HTMLTextAreaElement | null) => {
  field?.classList.add("error");
};

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    clearErrors(form);
    const name = getField(form, "name");
    const email = getField(form, "email");
    const message = getField(form, "message");

    const messageValue = message?.value.trim() ?? "";
    if (!name?.value.trim() || !email?.value.trim() || messageValue.length < 10) {
      event.preventDefault();
      if (!name?.value.trim()) {
        markError(name);
      }
      if (!email?.value.trim()) {
        markError(email);
      }
      if (messageValue.length < 10) {
        markError(message);
      }
      setStatus(form, "error", "Please fill in all fields (message min 10 characters).");
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      markError(name);
      markError(email);
      markError(message);
      setStatus(form, "error", "Please check the form fields and try again.");
      return;
    }

    event.preventDefault();
    setStatus(form, "pending", "Sending...");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "text/plain",
        },
      });

      const finalUrl = response.url || "";
      const isSuccess = finalUrl.includes("sent=1");
      const isError = finalUrl.includes("error=1") || !response.ok;

      if (isSuccess) {
        setStatus(form, "success", "Thanks! Your message has been sent.");
        form.reset();
        return;
      }

      if (isError) {
        setStatus(form, "error", "Sorry, something went wrong. Please try again.");
        return;
      }

      setStatus(form, "error", "Unexpected response. Please try again.");
    } catch {
      setStatus(form, "error", "Network error. Please try again.");
    }
  });
});
