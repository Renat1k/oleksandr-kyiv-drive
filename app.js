(() => {
  const settings = typeof contactSettings === "object" && contactSettings ? contactSettings : null;

  if (settings) {
    const handle = typeof settings.telegram === "string" ? settings.telegram.trim().replace(/^@/, "") : "";
    const phone = typeof settings.whatsapp === "string" ? settings.whatsapp.trim().replace(/[\s()-]/g, "").replace(/^\+/, "") : "";
    /** @type {{ telegram: string | null; whatsapp: string | null }} */
    const links = {
      telegram: /^[a-z][a-z\d_]{4,31}$/i.test(handle) ? `https://t.me/${handle}` : null,
      whatsapp: /^[1-9]\d{7,14}$/.test(phone) ? `https://wa.me/${phone}` : null,
    };

    if (links.telegram || links.whatsapp) {
      const title = document.getElementById("contact-title");
      const intro = document.getElementById("contact-intro");
      if (title) title.textContent = "Домовитися про час";
      if (intro) intro.textContent = "У першому повідомленні достатньо написати, що хочете відпрацювати і коли вам зручно.";
    }

    for (const group of document.querySelectorAll("[data-contact-set]")) {
      for (const control of group.querySelectorAll("button")) {
        const channel = control.dataset.channel;
        if (channel !== "telegram" && channel !== "whatsapp") continue;
        const url = links[channel];
        if (!url) continue;

        const link = document.createElement("a");
        link.href = url;
        link.className = control.className;
        link.dataset.channel = channel;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Написати у ${channel === "telegram" ? "Telegram" : "WhatsApp"}`);
        link.append(...control.childNodes);
        control.replaceWith(link);
      }

      const note = group.querySelector("[data-contact-note]");
      if (!note || !(links.telegram || links.whatsapp)) continue;
      if (links.telegram && links.whatsapp) note.textContent = "Час зустрічі узгодимо особисто в переписці.";
      else note.textContent = links.telegram ? "WhatsApp ще не додано." : "Telegram ще не додано.";
    }

    if (settings.carSpecs && typeof settings.carSpecs === "object") {
      /** @type {Record<string, unknown>} */
      const specs = settings.carSpecs;
      for (const el of document.querySelectorAll("[data-car-spec]")) {
        const key = el.getAttribute("data-car-spec");
        if (!key) continue;
        const value = specs[key];
        if (typeof value === "string" && value.trim()) {
          el.textContent = value.trim();
          el.classList.remove("is-placeholder");
        }
      }
    }
  }

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById("site-nav");
  if (menuToggle instanceof HTMLButtonElement && nav instanceof HTMLElement) {
    /** @param {boolean} open */
    const setOpen = (open) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };

    menuToggle.addEventListener("click", () => {
      const next = menuToggle.getAttribute("aria-expanded") !== "true";
      setOpen(next);
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }
})();
