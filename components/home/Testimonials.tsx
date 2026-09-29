'use client';

// Three columns of review cards, each scrolling vertically on an endless
// loop at its own speed. The loop is pure CSS (see .testimonials-track in
// styles/testimonials.css): every column's list is rendered twice
// back-to-back and the track slides up by exactly 50%, so the second copy
// lands where the first started and the jump is invisible.
//
// Text lives here (not in Supabase i18n) so the section works without a
// database migration. t() is still tried first, so the admin panel can
// override the heading keys later by adding them to site_data.i18n.
import { useI18n } from '@/components/providers/I18nProvider';
import SectionHeader from '@/components/layout/SectionHeader';
import Reveal from '@/components/motion/Reveal';
import type { Localized } from '@/lib/types';

const TESTIMONIALS_TEXT: Record<'eyebrow' | 'title' | 'subtitle', Localized> = {
  eyebrow: { en: 'Testimonials', ru: 'Отзывы', hy: 'Կարծիքներ' },
  title: { en: 'What Our Clients Say', ru: 'Что говорят наши клиенты', hy: 'Ինչ են ասում մեր հաճախորդները' },
  subtitle: {
    en: 'Impressions from those who have found their signature scent',
    ru: 'Впечатления тех, кто уже нашёл свой аромат',
    hy: 'Նրանց տպավորությունները, ովքեր արդեն գտել են իրենց բույրը',
  },
};

const TESTIMONIALS: { name: string; city: Localized; text: Localized }[] = [
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
const COLUMN_DURATIONS = [38, 52, 44];

export default function Testimonials() {
  const { t, pick } = useI18n();
  const heading = (key: keyof typeof TESTIMONIALS_TEXT) => t('testimonials_' + key, pick(TESTIMONIALS_TEXT[key]));

  return (
    <section id="testimonials" aria-labelledby="testimonials-title">
      <SectionHeader
        eyebrow={heading('eyebrow')}
        title={heading('title')}
        subtitle={heading('subtitle')}
        titleId="testimonials-title"
      />

      <Reveal className="testimonials-columns">
        {COLUMN_DURATIONS.map((duration, col) => {
          const items = TESTIMONIALS.filter((_, i) => i % COLUMN_DURATIONS.length === col);
          return (
            <div key={col} className="testimonials-column">
              <ul className="testimonials-track" style={{ animationDuration: duration + 's' }}>
                {/* Two identical copies for the seamless loop; the second is
                    hidden from screen readers so each review is read once. */}
                {[false, true].map((isDuplicate) =>
                  items.map((item) => (
                    <li key={item.name + isDuplicate} className="testimonial-card" aria-hidden={isDuplicate || undefined}>
                      <div className="testimonial-stars" aria-hidden="true">
                        ★★★★★
                      </div>
                      <blockquote className="testimonial-text">{pick(item.text)}</blockquote>
                      <div className="testimonial-author">
                        <span className="testimonial-avatar" aria-hidden="true">
                          {item.name.split(' ').map((part) => part[0]).join('')}
                        </span>
                        <div>
                          <p className="testimonial-name">{item.name}</p>
                          <p className="testimonial-city">{pick(item.city)}</p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
