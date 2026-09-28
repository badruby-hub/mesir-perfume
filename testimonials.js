// =======================================================
// TESTIMONIALS (home page only)
// Three columns of review cards, each scrolling vertically on an
// endless loop at its own speed. The loop is pure CSS (see
// .testimonials-track in style.css): every column's list is rendered
// twice back-to-back and the track slides up by exactly 50%, so the
// second copy lands where the first started and the jump is invisible.
//
// Text lives here (not in Supabase i18n) so the section works without
// a database migration. t() is still tried first, so the admin panel
// can override any of these keys later by adding them to site_data.i18n.
// =======================================================
const TESTIMONIALS_TEXT = {
  en: {
    eyebrow: 'Testimonials',
    title: 'What Our Clients Say',
    subtitle: 'Impressions from those who have found their signature scent',
  },
  ru: {
    eyebrow: 'Отзывы',
    title: 'Что говорят наши клиенты',
    subtitle: 'Впечатления тех, кто уже нашёл свой аромат',
  },
  hy: {
    eyebrow: 'Կարծիքներ',
    title: 'Ինչ են ասում մեր հաճախորդները',
    subtitle: 'Նրանց տպավորությունները, ովքեր արդեն գտել են իրենց բույրը',
  },
};

const TESTIMONIALS = [
  {
    name: 'Anna M.', city: { en: 'Yerevan', ru: 'Ереван', hy: 'Երևան' },
    text: {
      en: 'Oud Royal lasts on my skin all day. Every time I wear it, someone asks what the scent is.',
      ru: 'Oud Royal держится на коже весь день. Каждый раз, когда я его ношу, меня спрашивают, что это за аромат.',
      hy: 'Oud Royal-ը մաշկիս վրա մնում է ամբողջ օրը։ Ամեն անգամ ինձ հարցնում են, թե ինչ բույր է։',
    },
  },
  {
    name: 'David K.', city: { en: 'Gyumri', ru: 'Гюмри', hy: 'Գյումրի' },
    text: {
      en: 'Fast delivery and beautiful packaging. The bottle looks even better than in the photos.',
      ru: 'Быстрая доставка и красивая упаковка. Флакон выглядит даже лучше, чем на фото.',
      hy: 'Արագ առաքում և գեղեցիկ փաթեթավորում։ Շիշը նկարներից էլ ավելի գեղեցիկ է։',
    },
  },
  {
    name: 'Elena S.', city: { en: 'Moscow', ru: 'Москва', hy: 'Մոսկվա' },
    text: {
      en: 'I was looking for a niche fragrance for months. The team helped me choose over Telegram in ten minutes.',
      ru: 'Несколько месяцев искала нишевый аромат. Команда помогла выбрать в Telegram за десять минут.',
      hy: 'Ամիսներ շարունակ նիշային բույր էի փնտրում։ Թիմը Telegram-ով տասը րոպեում օգնեց ընտրել։',
    },
  },
  {
    name: 'Aram H.', city: { en: 'Yerevan', ru: 'Ереван', hy: 'Երևան' },
    text: {
      en: 'Bought a gift for my wife. She says it is the best perfume she has ever had.',
      ru: 'Купил подарок жене. Она говорит, что это лучший парфюм в её жизни.',
      hy: 'Նվեր գնեցի կնոջս համար։ Նա ասում է, որ սա իր ունեցած լավագույն օծանելիքն է։',
    },
  },
  {
    name: 'Mariam T.', city: { en: 'Vanadzor', ru: 'Ванадзор', hy: 'Վանաձոր' },
    text: {
      en: 'The home fragrance fills the whole apartment. Guests always notice it.',
      ru: 'Аромат для дома наполняет всю квартиру. Гости всегда это замечают.',
      hy: 'Տան բույրը լցնում է ամբողջ բնակարանը։ Հյուրերը միշտ նկատում են։',
    },
  },
  {
    name: 'Sergey V.', city: { en: 'Saint Petersburg', ru: 'Санкт-Петербург', hy: 'Սանկտ Պետերբուրգ' },
    text: {
      en: 'Original products, honest prices. I have already ordered three times.',
      ru: 'Оригинальная продукция, честные цены. Заказываю уже третий раз.',
      hy: 'Օրիգինալ արտադրանք, ազնիվ գներ։ Արդեն երրորդ անգամ եմ պատվիրում։',
    },
  },
  {
    name: 'Lilit A.', city: { en: 'Yerevan', ru: 'Ереван', hy: 'Երևան' },
    text: {
      en: 'Warm amber and vanilla notes, exactly what I wanted for autumn evenings.',
      ru: 'Тёплые ноты амбры и ванили — именно то, что я хотела для осенних вечеров.',
      hy: 'Սաթի և վանիլի ջերմ նոտաներ՝ հենց այն, ինչ ուզում էի աշնան երեկոների համար։',
    },
  },
  {
    name: 'Karen P.', city: { en: 'Dilijan', ru: 'Дилижан', hy: 'Դիլիջան' },
    text: {
      en: 'Great consultation. They asked about my taste and suggested a scent I would never have tried myself.',
      ru: 'Отличная консультация. Спросили о моих вкусах и предложили аромат, который я сам бы не попробовал.',
      hy: 'Հիանալի խորհրդատվություն։ Հարցրին իմ ճաշակի մասին և առաջարկեցին բույր, որը ես ինքս չէի փորձի։',
    },
  },
  {
    name: 'Olga N.', city: { en: 'Yerevan', ru: 'Ереван', hy: 'Երևան' },
    text: {
      en: 'Elegant, deep and not too heavy. I get compliments every day.',
      ru: 'Элегантный, глубокий и не тяжёлый. Получаю комплименты каждый день.',
      hy: 'Նրբագեղ, խորը և ոչ ծանր։ Ամեն օր հաճոյախոսություններ եմ ստանում։',
    },
  },
];

// Seconds for one full loop; different per column so they drift apart.
const TESTIMONIAL_COLUMN_DURATIONS = [38, 52, 44];

function testimonialsText(key) {
  const i18nKey = 'testimonials_' + key;
  const fromDb = typeof t === 'function' ? t(i18nKey) : i18nKey;
  if (fromDb !== i18nKey) return fromDb;
  return (TESTIMONIALS_TEXT[currentLang] || TESTIMONIALS_TEXT.en)[key];
}

function buildTestimonialCard(item) {
  const li = document.createElement('li');
  li.className = 'testimonial-card';

  const initials = item.name.split(' ').map(part => part[0]).join('');

  li.innerHTML = `
    <div class="testimonial-stars" aria-hidden="true">★★★★★</div>
    <blockquote class="testimonial-text"></blockquote>
    <div class="testimonial-author">
      <span class="testimonial-avatar" aria-hidden="true"></span>
      <div>
        <p class="testimonial-name"></p>
        <p class="testimonial-city"></p>
      </div>
    </div>
  `;
  li.querySelector('.testimonial-text').textContent = item.text[currentLang] || item.text.en;
  li.querySelector('.testimonial-avatar').textContent = initials;
  li.querySelector('.testimonial-name').textContent = item.name;
  li.querySelector('.testimonial-city').textContent = item.city[currentLang] || item.city.en;
  return li;
}

function renderTestimonials() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  section.querySelector('[data-testimonials="eyebrow"]').textContent = testimonialsText('eyebrow');
  section.querySelector('[data-testimonials="title"]').textContent = testimonialsText('title');
  section.querySelector('[data-testimonials="subtitle"]').textContent = testimonialsText('subtitle');

  const columnsEl = section.querySelector('.testimonials-columns');
  columnsEl.innerHTML = '';

  const columnCount = TESTIMONIAL_COLUMN_DURATIONS.length;
  for (let col = 0; col < columnCount; col++) {
    const items = TESTIMONIALS.filter((_, i) => i % columnCount === col);

    const column = document.createElement('div');
    column.className = 'testimonials-column';

    const track = document.createElement('ul');
    track.className = 'testimonials-track';
    track.style.animationDuration = TESTIMONIAL_COLUMN_DURATIONS[col] + 's';

    // Two identical copies for the seamless loop; the second copy is
    // hidden from screen readers so each review is announced once.
    [false, true].forEach(isDuplicate => {
      items.forEach(item => {
        const card = buildTestimonialCard(item);
        if (isDuplicate) card.setAttribute('aria-hidden', 'true');
        track.appendChild(card);
      });
    });

    column.appendChild(track);
    columnsEl.appendChild(column);
  }
}

renderTestimonials();
(async () => {
  await window.i18nReady;
  renderTestimonials();
})();
