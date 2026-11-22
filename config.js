/**
 * Налаштування сайту: контакти, інформація про водія та 3D-модель авто.
 * Заповніть порожні поля у блоці driver, коли будете готові додати текст про Олександра.
 */
const contactSettings = Object.freeze({
  telegram: "",
  whatsapp: "",
  driver: Object.freeze({
    photo: "",       // Наприклад: "./assets/oleksandr.jpg"
    headline: "",    // Короткий заголовок про інструктора
    bio: "",         // Основна розповідь про Олександра
    experience: "",  // Стаж водіння / викладання (після узгодження)
    districts: "",   // Зручні райони Києва
    languages: "",   // Мови спілкування
  }),
  carModel: "./assets/car.glb",
  carSpecs: Object.freeze({
    model: "Škoda Octavia A5 GreenLine",
    engine: "1.6 TDI · 105 к.с. / 250 Н·м",
    transmission: "Механіка (5-ст. МКПП)",
    economy: "Start-Stop · ~3,8–4,0 л/100 км",
  }),
});
