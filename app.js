(() => {
  if (typeof contactSettings !== "object" || !contactSettings) return;
  const handle = typeof contactSettings.telegram === "string" ? contactSettings.telegram.trim().replace(/^@/, "") : "";
  const phone = typeof contactSettings.whatsapp === "string" ? contactSettings.whatsapp.trim().replace(/[\s()-]/g, "").replace(/^\+/, "") : "";
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
      link.setAttribute("aria-label", `Написати у ${channel === "telegram" ? "Telegram" : "WhatsApp"}`);
      link.append(...control.childNodes);
      control.replaceWith(link);
    }

    const note = group.querySelector("[data-contact-note]");
    if (!note || !(links.telegram || links.whatsapp)) continue;
    if (links.telegram && links.whatsapp) note.textContent = "Час узгодимо в переписці.";
    else note.textContent = links.telegram ? "WhatsApp ще не додано." : "Telegram ще не додано.";
  }
})();
