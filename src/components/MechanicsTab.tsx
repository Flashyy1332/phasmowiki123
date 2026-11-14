import React, { useMemo } from 'react';
import { Ghost } from '../types';
import { huntThresholds } from '../lib/ghostMeta';

const CURSED: { icon: string; name: string; text: string }[] = [
  { icon: '🔮', name: 'Дошка Уїджі', text: 'Відповідає на запитання («Де ти?», «Скільки тобі років?»). Кожне запитання знімає глузд. Не забудьте сказати «Goodbye».' },
  { icon: '🃏', name: 'Карти Таро', text: '10 карт із випадковим ефектом — від повного відновлення глузду до миттєвої смерті.' },
  { icon: '🪞', name: 'Дзеркало', text: 'Показує кімнату привида, але швидко випиває глузд — близько 7.5% за секунду.' },
  { icon: '🎵', name: 'Музична скринька', text: 'Привид підспівує і йде до скриньки. Якщо скринька впаде — почнеться атака.' },
  { icon: '🩸', name: 'Коло заклику', text: 'Запаліть 5 свічок — привид з’явиться в центрі для фото, після чого одразу почне полювання.' },
  { icon: '🪆', name: 'Лялька вуду', text: 'Змушує привида взаємодіяти. Кожна голка знімає глузд, голка в серце — полювання.' },
  { icon: '🐒', name: 'Мавпяча лапа', text: 'Виконує бажання (знайти привида, вижити, воскресити друга) за жахливу ціну.' },
];

export function MechanicsTab({ ghosts }: { ghosts: Ghost[] }) {
  const rows = useMemo(
    () =>
      ghosts
        .map((g) => ({ ghost: g, values: huntThresholds(g) }))
        .filter((r) => r.values.length && (r.values.length > 1 || r.values[0] !== 50))
        .sort((a, b) => Math.max(...b.values) - Math.max(...a.values)),
    [ghosts],
  );
  const standard = ghosts.length - rows.length;

  return (
    <div className="mechanics">
      <div className="page-head">
        <h1>Механіки гри</h1>
        <p className="muted">Те, що варто знати перед тим, як зайти в будинок.</p>
      </div>

      <section className="panel">
        <h2>Коли привид починає полювання</h2>
        <p className="lead">
          Полювання залежить від середнього глузду команди. Більшість привидів атакують, коли він падає до 50%. Нижче — ті, хто
          порушує це правило.
        </p>
        <div className="sanity-chart">
          <div className="sanity-axis" aria-hidden="true">
            <span style={{ left: '0%' }}>0%</span>
            <span style={{ left: '50%' }}>50%</span>
            <span style={{ left: '100%' }}>100%</span>
          </div>
          {rows.map(({ ghost, values }) => {
            const lo = Math.min(...values);
            const hi = Math.max(...values);
            return (
              <div key={ghost.name} className="sanity-row">
                <span className="sanity-name">{ghost.name}</span>
                <span className="sanity-track">
                  <i className="sanity-base" />
                  <i className="sanity-bar" style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 0)}%` }} />
                  {values.map((v, i) => (
                    <i key={i} className="sanity-dot" style={{ left: `${v}%` }} />
                  ))}
                </span>
                <span className="sanity-text">{ghost.hunt}</span>
              </div>
            );
          })}
        </div>
        <p className="muted">Ще {standard} привидів атакують на стандартних 50%.</p>
      </section>

      <div className="columns">
        <section className="panel">
          <h2>Івент чи полювання</h2>
          <dl className="facts">
            <dt>Вхідні двері</dt>
            <dd>Під час івенту лишаються відчиненими. Щойно починається полювання — зачиняються і замикаються.</dd>
            <dt>Видимість</dt>
            <dd>Під час івенту привид з’являється одразу. На початку полювання він кілька секунд невидимий — чути лише кроки.</dd>
            <dt>Електроніка</dt>
            <dd>Під час полювання ліхтарик та інші прилади мерехтять, коли привид близько.</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Пахощі</h2>
          <dl className="facts">
            <dt>Під час полювання</dt>
            <dd>Запаліть поруч із привидом — він осліпне на кілька секунд і не зможе вас убити. Морой сліпне на 12 секунд.</dd>
            <dt>Поза полюванням</dt>
            <dd>У кімнаті привида пахощі забороняють йому полювати 90 секунд. Дух чекає 180 секунд, Демон — лише 60.</dd>
            <dt>Виняток</dt>
            <dd>Галлу від пахощів, солі та розп’яття лютує і стає небезпечнішим.</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Як сховатися</h2>
          <dl className="facts">
            <dt>Вимкніть електроніку</dt>
            <dd>Привид відчуває увімкнені прилади в руках у радіусі 10 метрів. Ліхтарик — вимкнути, наголовну камеру 3 рівня — зняти.</dd>
            <dt>Мовчіть</dt>
            <dd>Привид чує ваш мікрофон так само добре, як і прилади.</dd>
            <dt>Розірвіть лінію зору</dt>
            <dd>Поки привид вас бачить, він розганяється (крім Тає, Деогена і Ханту). Заверніть за ріг, перш ніж лізти в шафу.</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Додатковий заробіток</h2>
          <dl className="facts">
            <dt>Три завдання</dt>
            <dd>На дошці у фургоні завжди є три випадкові завдання. Вони дають помітний бонус до грошей і досвіду.</dd>
            <dt>Кістка</dt>
            <dd>На кожній карті схована одна кістка. Сфотографуйте її і підберіть.</dd>
            <dt>Фото</dt>
            <dd>Найбільше платять за фото привида, проклятого предмета, кістки, відбитків і брудної води.</dd>
            <dt>Ідеальне розслідування</dt>
            <dd>Визначте привида, виконайте всі завдання, знайдіть кістку і зробіть 10 фото на три зірки — отримаєте великий множник.</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Престиж</h2>
          <p className="lead">Доступний зі 100-го рівня.</p>
          <dl className="facts">
            <dt>Що втрачаєте</dt>
            <dd>Рівень скидається до першого, гроші обнуляються, спорядження 2 і 3 рівнів треба відкривати заново.</dd>
            <dt>Що отримуєте</dt>
            <dd>Новий рівень престижу (I–XX), нашивку на руку, кольори та фони для ID-картки і титули для лобі.</dd>
          </dl>
        </section>
      </div>

      <section className="panel">
        <h2>Прокляті предмети</h2>
        <p className="lead">
          На кожній карті є один випадковий проклятий предмет. Він допомагає знайти привида, але спалює глузд і може викликати
          прокляте полювання: воно триває довше, а пахощі й розп’яття його не зупиняють.
        </p>
        <div className="cursed">
          {CURSED.map((c) => (
            <div key={c.name} className="cursed-item">
              <span aria-hidden="true">{c.icon}</span>
              <div>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
