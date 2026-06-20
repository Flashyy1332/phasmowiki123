import React from 'react';

export function MechanicsTab() {
  return (
    <section id="mechanics" className="tab-content active">
      <h2>Корисні Механіки Гри</h2>

      <div className="grid-cards">
        <div className="card">
          <h3 style={{ color: '#4ade80' }}>💰 Додатковий заробіток та Завдання</h3>
          <ul
            style={{
              marginTop: '10px',
              paddingLeft: '20px',
              color: 'var(--text-main)',
            }}
          >
            <li>
              <strong>3 Додаткові завдання:</strong> На дошці у фургоні завжди є
              3 випадкові завдання (наприклад, зупинити полювання розп'яттям,
              втекти під час атаки). Їх виконання дає значний бонус до грошей та
              досвіду.
            </li>
            <li>
              <strong>Кістка:</strong> На кожній карті завжди захована одна
              кістка. Знайдіть її, сфотографуйте та підберіть.
            </li>
            <li>
              <strong>Фотографії:</strong> Заповнюйте журнал фотографіями на 3
              зірки. Найбільше платять за фото самого привида, проклятого
              предмета, кістки, відбитків пальців/ніг та брудної води.
            </li>
            <li>
              <strong>Ідеальне розслідування (Perfect Investigation):</strong>{' '}
              Визначте тип привида, виконайте всі 3 завдання,
              знайдіть/сфотографуйте кістку та зробіть 10 фотографій на 3 зірки,
              щоб отримати величезний грошовий множник!
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: '#f97316' }}>
            ⭐ Система Престижу (Переродження)
          </h3>
          <p style={{ marginTop: '10px', color: 'var(--text-main)' }}>
            Коли ви досягаєте <strong>100-го рівня</strong>, у вас з'являється
            можливість активувати Престиж. Це серйозний крок для досвідчених
            гравців:
          </p>
          <ul
            style={{
              marginTop: '10px',
              paddingLeft: '20px',
              color: 'var(--text-main)',
            }}
          >
            <li>
              <strong>Що ви втрачаєте:</strong> Ваш рівень скидається до 1-го.
              Всі ваші гроші обнуляються, а все спорядження 2 та 3 рівнів знову
              блокується (треба відкривати заново).
            </li>
            <li>
              <strong>Що ви отримуєте:</strong> Ви отримуєте новий рівень
              престижу (від I до XX), унікальний бейдж (нашивку) на руку
              персонажа, ексклюзивні кольори/фони для ID-картки та спеціальні
              титули для лобі.
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: '#fde047' }}>Глузд (Sanity) та Полювання</h3>
          <p>
            Середній показник глузду всієї команди визначає, коли привид може
            почати полювання. Більшість привидів атакують при <strong>50%</strong>
            . Винятки:
          </p>
          <ul
            style={{
              marginTop: '10px',
              paddingLeft: '20px',
              color: 'var(--text-main)',
            }}
          >
            <li>
              <strong>Демон:</strong> 70% (або 100% через унікальну здатність)
            </li>
            <li>
              <strong>Тає:</strong> 75% (на початку гри)
            </li>
            <li>
              <strong>Даян / Обамбо:</strong> До 65% (залежить від руху або стану)
            </li>
            <li>
              <strong>Райджу:</strong> 65% (біля увімкненої електроніки)
            </li>
            <li>
              <strong>Мара:</strong> 60% (у темряві) / 40% (при світлі)
            </li>
            <li>
              <strong>Деоген / Тінь:</strong> 40% / 35% відповідно
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: '#f87171' }}>Івент чи Полювання? (Як відрізнити)</h3>
          <p>Дуже важливо розуміти, коли вам загрожує небезпека:</p>
          <ul
            style={{
              marginTop: '10px',
              paddingLeft: '20px',
              color: 'var(--text-main)',
            }}
          >
            <li>
              <strong>Вхідні двері:</strong> Під час івенту вони залишаються
              ВІДКРИТИМИ. Як тільки починається полювання — вони миттєво
              зачиняються і замикаються на замок.
            </li>
            <li>
              <strong>Видимість:</strong> Під час івенту привид з'являється
              одразу. При полюванні привид залишається невидимим перші 1-5
              секунд (grace period), ви чуєте лише кроки та звук полювання.
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: '#38bdf8' }}>Робота з Пахощами (Incense)</h3>
          <p>Пахощі — ваш єдиний активний захист:</p>
          <ul
            style={{
              marginTop: '10px',
              paddingLeft: '20px',
              color: 'var(--text-main)',
            }}
          >
            <li>
              <strong>Під час полювання:</strong> Запаліть поруч із привидом.
              Це "засліпить" його на <strong>5 секунд</strong> (він
              продовжить йти, але не зможе вас вбити чи бачити), що дасть час
              сховатися. Морой сліпне на 12 секунд.
            </li>
            <li>
              <strong>Поза полюванням:</strong> Якщо запалити в кімнаті привида,
              це заблокує йому можливість почати полювання на{' '}
              <strong>90 секунд</strong> (Дух — 180с, Демон — 60с). Галлу
              (Gallu) від пахощів лютує.
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--accent-purple)' }}>
            Електроніка та Схованки (Line of Sight)
          </h3>
          <p>Як правильно вижити під час атаки:</p>
          <ul
            style={{
              marginTop: '10px',
              paddingLeft: '20px',
              color: 'var(--text-main)',
            }}
          >
            <li>
              <strong>Електроніка:</strong> Привид відчуває увімкнені ліхтарики,
              камери та ЕМП у ваших руках чи інвентарі в радіусі 10 метрів.
              Ховаючись, <strong>обов'язково вимикайте ліхтарик</strong> (Тір 3
              наголовної камери потрібно знімати).
            </li>
            <li>
              <strong>Голос:</strong> Привид чує вас через мікрофон так само
              добре. Мовчіть!
            </li>
            <li>
              <strong>Поле зору:</strong> Коли привид бачить вас, він постійно
              прискорюється (крім Тає, Деогена та Ханту). Завертайте за кути,
              щоб розірвати лінію зору (Line of Sight) перед тим, як зайти в
              шафу.
            </li>
          </ul>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ color: '#4ade80' }}>
            Прокляті предмети (Cursed Possessions)
          </h3>
          <p>
            На кожній карті є один випадковий проклятий предмет. Вони допомагають
            знайти привида або взаємодіяти з ним, але стрімко спалюють ваш глузд
            і викликають "Прокляте полювання" (Cursed Hunt — триває довше,
            ігнорує 90с від пахощів, розп'яття не рятує):
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>
                🔮 Дошка Уїджі:
              </strong>{' '}
              Дає відповіді (Де ти? Скільки тобі років?). Знімає глузд за
              запитання. Не забудьте сказати "Goodbye".
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>
                🃏 Карти Таро:
              </strong>{' '}
              10 карт з випадковим ефектом (від повного лікування до миттєвої
              смерті).
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>🪞 Дзеркало:</strong>{' '}
              Показує кімнату привида, але швидко "випиває" глузд (близько 7.5%
              на секунду).
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>
                🎵 Музична скринька:
              </strong>{' '}
              Змушує привида підспівувати і йти до скриньки. Падіння скриньки
              викликає атаку.
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>
                🩸 Коло заклику:
              </strong>{' '}
              Телепортує привида в центр для фото (запаліть 5 свічок), після чого
              одразу починає полювання.
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>
                🪆 Лялька Вуду:
              </strong>{' '}
              Змушує привида зробити взаємодію (кожна голка знімає глузд, голка в
              серце = полювання).
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <strong style={{ color: 'var(--text-title)' }}>
                🐒 Мавпяча лапа:
              </strong>{' '}
              Виконує бажання (знайти привида, вижити, воскресити друга) за
              жахливу ціну.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
