
const data = {
  menu: [
    { name: "Эспрессо", cat: "Кофе", price: 800, desc: "Классический, 30 мл" },
    { name: "Капучино", cat: "Кофе", price: 1300, desc: "Эспрессо, молоко, плотная пенка" },
    { name: "Раф с лавандой", cat: "Кофе", price: 1700, desc: "Сливки, ванильный сахар, лаванда" },
    { name: "Чай облепиховый", cat: "Чай", price: 1200, desc: "Облепиха, мёд, имбирь" },
    { name: "Круассан с миндалём", cat: "Выпечка", price: 1100, desc: "Свежий, с миндальным кремом" },
    { name: "Чизкейк карамельный", cat: "Десерты", price: 1900, desc: "Сливочный сыр, солёная карамель" },
    { name: "Сэндвич с индейкой", cat: "Закуски", price: 2400, desc: "Ржаной хлеб, индейка, овощи" },
    { name: "Сырники", cat: "Завтраки", price: 2100, desc: "Три штуки со сметаной и вареньем" }
  ],
  promo: [
    { title: "Завтрак до 11:00", text: "Любой кофе и сырники за 2 600 ₸ вместо 3 400 ₸." },
    { title: "Студентам скидка 10%", text: "При предъявлении студенческого билета, с понедельника по пятницу." },
    { title: "Десятый кофе в подарок", text: "Берите карту гостя на кассе — штамп за каждый напиток." }
  ],
  address: [
    ["Адрес", "г. Алматы, ул. Абая, 52"],
    ["Часы работы", "ежедневно с 8:00 до 22:00"],
    ["Телефон", "+7 (727) 000-00-00"],
    ["Почта", "hello@karamel.example"]
  ]
};

const content = document.querySelector("#content");
const tabs = document.querySelectorAll("[data-page]");


function el(tag, text, cls) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}

const views = {
  menu() {
    const box = el("div");
    box.append(el("h2", "Меню"));
    const grid = el("div", undefined, "grid");
    if (data.menu.length === 0) {
      box.append(el("p", "Меню пока пустое."));
      return box;
    }
    data.menu.forEach(item => {
      const card = el("article", undefined, "dish");
      card.append(
        el("span", item.cat, "tag"),
        el("h3", item.name),
        el("p", item.desc, "desc"),
        el("span", item.price.toLocaleString("ru-RU") + " ₸", "price")
      );
      grid.append(card);
    });
    box.append(grid);
    return box;
  },

  promo() {
    const box = el("div");
    box.append(el("h2", "Акции"));
    data.promo.forEach(p => {
      const block = el("div", undefined, "promo");
      block.append(el("h3", p.title), el("p", p.text));
      box.append(block);
    });
    return box;
  },

  address() {
    const box = el("div");
    box.append(el("h2", "Как нас найти"));
    const list = el("dl", undefined, "info");
    data.address.forEach(([k, v]) => {
      list.append(el("dt", k), el("dd", v));
    });
    box.append(list);
    return box;
  }
};

function show(name) {
  if (!views[name]) name = "menu";   
  content.replaceChildren(views[name]());
  tabs.forEach(btn => {
    const isActive = btn.dataset.page === name;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive);
    btn.tabIndex = isActive ? 0 : -1;
  });
  try { localStorage.setItem("cafe_tab", name); } catch (e) { /* без хранилища тоже работает */ }
}

tabs.forEach((btn, i) => {
  btn.addEventListener("click", () => show(btn.dataset.page));

  
  btn.addEventListener("keydown", e => {
    let next = null;
    if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (next) {
      e.preventDefault();
      next.focus();
      show(next.dataset.page);
    }
  });
});

let start = "menu";
try { start = localStorage.getItem("cafe_tab") || "menu"; } catch (e) {}
show(start);
