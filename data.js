// ==================== PRODUCT DATA ====================
// brand / name / size / price / country / availability / image stay
// as-is in both languages (proper nouns & units are conventionally
// kept in Latin script on Russian retail sites too).
// description & notes are localized.
const products = [
  {
    id: 1,
    brand: 'Tom Ford',
    name: 'Oud Wood',
    size: '50 ml',
    price: 380,
    country: 'USA',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1774682060997-f8959850a7d4?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'Rare oud wood blended with rosewood, cardamom and Chinese pepper.',
      ru: 'Редкое дерево уда в сочетании с розовым деревом, кардамоном и китайским перцем.',
    },
    notes: {
      en: 'Oud · Rosewood · Amber',
      ru: 'Уд · Розовое дерево · Амбра',
    },
  },
  {
    id: 2,
    brand: 'Creed',
    name: 'Aventus',
    size: '100 ml',
    price: 520,
    country: 'France',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1780943004195-3bd30f748872?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'Fruity pineapple opening over birch, musk and ambergris — the fragrance of kings.',
      ru: 'Фруктовое открытие с ананасом на фоне берёзы, мускуса и амбры — аромат королей.',
    },
    notes: {
      en: 'Pineapple · Birch · Musk',
      ru: 'Ананас · Берёза · Мускус',
    },
  },
  {
    id: 3,
    brand: 'Amouage',
    name: 'Interlude Man',
    size: '100 ml',
    price: 340,
    country: 'UAE',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1771762013405-ad64577dfc55?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'A complex odyssey of oregano, frankincense and oud — intensity meets sophistication.',
      ru: 'Сложная одиссея из орегано, ладана и уда — интенсивность встречается с изысканностью.',
    },
    notes: {
      en: 'Oregano · Frankincense · Oud',
      ru: 'Орегано · Ладан · Уд',
    },
  },
  {
    id: 4,
    brand: 'Chanel',
    name: "N°5 L'Eau",
    size: '50 ml',
    price: 185,
    country: 'France',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1774682060992-46c7e9f2e50b?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'A luminous reinvention of the iconic N°5, lighter and more vibrant than ever before.',
      ru: 'Светлое переосмысление культового N°5 — легче и ярче, чем когда-либо.',
    },
    notes: {
      en: 'Aldehydes · Rose · Sandalwood',
      ru: 'Альдегиды · Роза · Сандал',
    },
  },
  {
    id: 5,
    brand: 'Maison Francis Kurkdjian',
    name: 'Baccarat Rouge 540',
    size: '70 ml',
    price: 340,
    country: 'France',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1778058505479-447c46d800a0?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'Jasmine petals and woody notes infused with luminous amberwood and fir resin.',
      ru: 'Лепестки жасмина и древесные ноты в сочетании со светящимся амбровым деревом и смолой пихты.',
    },
    notes: {
      en: 'Jasmine · Amberwood · Fir',
      ru: 'Жасмин · Амбровое дерево · Пихта',
    },
  },
  {
    id: 6,
    brand: 'Dior',
    name: 'Sauvage Elixir',
    size: '60 ml',
    price: 210,
    country: 'France',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1774682060959-efe13b7a12b9?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'An ambery fougère of hyper-concentrated spices, woods and warm musk.',
      ru: 'Янтарный фужер из концентрированных специй, дерева и тёплого мускуса.',
    },
    notes: {
      en: 'Spices · Elemi · Amber',
      ru: 'Специи · Элеми · Амбра',
    },
  },
  {
    id: 7,
    brand: 'Tom Ford',
    name: 'Black Orchid',
    size: '100 ml',
    price: 290,
    country: 'USA',
    availability: 'made-to-order',
    image: 'https://images.unsplash.com/photo-1774682060922-c395859148c9?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'Rich and dark — black orchid and spice layered over patchouli and black truffle.',
      ru: 'Насыщенный и тёмный — чёрная орхидея и специи на фоне пачули и чёрного трюфеля.',
    },
    notes: {
      en: 'Black Orchid · Truffle · Patchouli',
      ru: 'Чёрная орхидея · Трюфель · Пачули',
    },
  },
  {
    id: 8,
    brand: 'Creed',
    name: 'Silver Mountain Water',
    size: '100 ml',
    price: 460,
    country: 'France',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1737920459846-2d0318700658?w=500&h=600&fit=crop&auto=format',
    description: {
      en: 'Fresh green tea and bergamot over sandalwood — crisp alpine air in a bottle.',
      ru: 'Свежий зелёный чай и бергамот на фоне сандала — чистый горный воздух во флаконе.',
    },
    notes: {
      en: 'Green Tea · Bergamot · Sandalwood',
      ru: 'Зелёный чай · Бергамот · Сандал',
    },
  },
  {
    id: 9,
    brand: 'Amouage',
    name: 'Reflection Woman',
    size: '100 ml',
    price: 320,
    country: 'UAE',
    availability: 'in-stock',
    image: 'https://images.unsplash.com/photo-1774682060997-f8959850a7d4?w=500&h=600&fit=crop&auto=format&crop=right',
    description: {
      en: 'White florals with mandarin, neroli and ylang-ylang — radiant and luminous.',
      ru: 'Белые цветы с мандарином, нероли и иланг-илангом — лучезарный и светящийся аромат.',
    },
    notes: {
      en: 'Neroli · Ylang-ylang · Iris',
      ru: 'Нероли · Иланг-иланг · Ирис',
    },
  },
];

const brands = ['Dior', 'Chanel', 'Tom Ford', 'Creed', 'Maison Francis Kurkdjian', 'Amouage'];
const sizes = ['30 ml', '50 ml', '70 ml', '75 ml', '100 ml', '150 ml'];
const countries = ['France', 'Italy', 'UAE', 'UK', 'USA', 'Spain'];

// ==================== HERO SLIDES ====================
// name (the perfume's own name) is kept in Latin script for both
// languages — tagline/description/notes are localized.
const slides = [
  {
    id: 1,
    name: 'OUD ROYAL',
    brand: 'MESIR',
    price: '$380',
    image: 'https://images.unsplash.com/photo-1774682060997-f8959850a7d4?w=700&h=900&fit=crop&auto=format',
    accent: '#c9901a',
    tagline: { en: 'An Ode to Ancient Luxury', ru: 'Ода древней роскоши' },
    description: {
      en: 'An elegant composition built around rich oud, warm amber and subtle oriental spices. A fragrance that commands presence.',
      ru: 'Элегантная композиция на основе насыщенного уда, тёплой амбры и тонких восточных специй. Аромат, требующий присутствия.',
    },
    notes: {
      en: ['Top: Saffron, Cardamom', 'Heart: Oud, Rose', 'Base: Amber, Musk'],
      ru: ['Верхние: шафран, кардамон', 'Средние: уд, роза', 'Базовые: амбра, мускус'],
    },
  },
  {
    id: 2,
    name: 'NUIT DE SOIE',
    brand: 'MESIR',
    price: '$290',
    image: 'https://images.unsplash.com/photo-1780943004195-3bd30f748872?w=700&h=900&fit=crop&auto=format',
    accent: '#b8860b',
    tagline: { en: 'The Fragrance of Evening Silk', ru: 'Аромат вечернего шёлка' },
    description: {
      en: 'A velvet night composition — jasmine petals drifting over sandalwood, finished with a whisper of white musk.',
      ru: 'Бархатная ночная композиция — лепестки жасмина парят над сандалом, завершаясь шёпотом белого мускуса.',
    },
    notes: {
      en: ['Top: Bergamot, Neroli', 'Heart: Jasmine, Iris', 'Base: Sandalwood, Musk'],
      ru: ['Верхние: бергамот, нероли', 'Средние: жасмин, ирис', 'Базовые: сандал, мускус'],
    },
  },
  {
    id: 3,
    name: 'ENCENS MYSTIC',
    brand: 'MESIR',
    price: '$420',
    image: 'https://images.unsplash.com/photo-1771762013405-ad64577dfc55?w=700&h=900&fit=crop&auto=format',
    accent: '#d4a017',
    tagline: { en: 'Sacred Smoke & Rare Resins', ru: 'Священный дым и редкие смолы' },
    description: {
      en: 'Ancient incense trails blended with rare frankincense and cedarwood — a spiritual journey captured in crystal.',
      ru: 'Древние тропы благовоний в сочетании с редким ладаном и кедром — духовное путешествие, застывшее в хрустале.',
    },
    notes: {
      en: ['Top: Black Pepper, Incense', 'Heart: Frankincense, Myrrh', 'Base: Cedar, Vetiver'],
      ru: ['Верхние: чёрный перец, ладан', 'Средние: франкинцес, мирра', 'Базовые: кедр, ветивер'],
    },
  },
  {
    id: 4,
    name: 'ROSE IMPÉRIALE',
    brand: 'MESIR',
    price: '$340',
    image: 'https://images.unsplash.com/photo-1774682060992-46c7e9f2e50b?w=700&h=900&fit=crop&auto=format',
    accent: '#c68a20',
    tagline: { en: 'The Queen of All Roses', ru: 'Королева всех роз' },
    description: {
      en: 'Bulgarian rose at its most imperial — layered over warm patchouli and precious woods for timeless elegance.',
      ru: 'Болгарская роза в своём самом царственном обличии — на фоне тёплой пачули и драгоценных пород дерева ради вневременной элегантности.',
    },
    notes: {
      en: ['Top: Pink Pepper, Lychee', 'Heart: Rose, Peony', 'Base: Patchouli, Vanilla'],
      ru: ['Верхние: розовый перец, личи', 'Средние: роза, пион', 'Базовые: пачули, ваниль'],
    },
  },
  {
    id: 5,
    name: 'AMBRE SULTAN',
    brand: 'MESIR',
    price: '$460',
    image: 'https://images.unsplash.com/photo-1774682060922-c395859148c9?w=700&h=900&fit=crop&auto=format',
    accent: '#e0a020',
    tagline: { en: "The Sultan's Golden Chamber", ru: 'Золотые покои султана' },
    description: {
      en: 'Warm amber resins mingled with labdanum, honey and dried herbs — opulent, hypnotic, unforgettable.',
      ru: 'Тёплые амбровые смолы в сочетании с лабданумом, мёдом и сушёными травами — роскошный, гипнотический, незабываемый.',
    },
    notes: {
      en: ['Top: Coriander, Bay Leaf', 'Heart: Amber, Cistus', 'Base: Labdanum, Honey'],
      ru: ['Верхние: кориандр, лавровый лист', 'Средние: амбра, цистус', 'Базовые: лабданум, мёд'],
    },
  },
];
