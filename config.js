/**
 * Налаштування контактів і 3D-моделі авто.
 * Щоб додати свою 3D-модель, покладіть файл у site/assets/car.glb
 * та вкажіть carModel: "./assets/car.glb".
 */
const contactSettings = Object.freeze({
  telegram: "",
  whatsapp: "",
  carModel: "",
  carSpecs: Object.freeze({
    model: "",
    transmission: "",
    year: "",
    extra: "",
  }),
});
