/**
 * Англійські переклади контенту довідника (привиди, спорядження, докази,
 * механіки). Українські оригінали лишаються в data.ts / базі даних;
 * переклади підключаються за ключем, тож записи, яких тут немає
 * (наприклад, додані через адмін-панель), показуються як є.
 */

export interface GhostText {
  /** Англійська назва — потрібна лише тоді, коли в назві привида в базі немає дужок з англійською. */
  name?: string;
  hunt: string;
  desc: string;
  strength: string;
  weakness: string;
  test: string;
}

export interface EquipmentText {
  name: string;
  desc: string;
}

/* ------------------------------- Докази ------------------------------- */

export const EVIDENCE_EN: Record<string, string> = {
  'ЕМП (рівень 5)': 'EMF Level 5',
  'Радіоприймач': 'Spirit Box',
  'Відбитки (УФ)': 'Ultraviolet',
  'Примарний вогник': 'Ghost Orb',
  'Блокнот': 'Ghost Writing',
  'Мінусова температура': 'Freezing Temps',
  'D.O.T.S. проєктор': 'D.O.T.S. Projector',
};

/* ------------------------------- Привиди ------------------------------ */
/* Ключ — англійська назва з дужок, у нижньому регістрі (див. ghostKey). */

export const GHOSTS_EN: Record<string, GhostText> = {
  dayan: {
    hunt: '65% (movement) / 45% (still)',
    desc: 'A spirit that reacts to your activity. Always has a female character model and a female name.',
    strength: 'If you move near her (within 10 m), she speeds up sharply (2.25 m/s) and may start hunting earlier.',
    weakness: 'If you freeze and stand still next to her, her speed drops sharply (down to 1.2 m/s).',
    test: 'During a hunt, stop in a safe spot (or behind a table). If the ghost approaches very fast but slows to a crawl as it reaches you (because you are not moving) — it is 100% Dayan.',
  },
  gallu: {
    hunt: '60% (Enraged) / 40% (Weakened)',
    desc: 'A demon that rages when you use protective equipment.',
    strength: "Incense, crucifixes and salt put it into an 'Enraged' state. While enraged it is faster, its hunt threshold rises to 60%, incense blinds it for only 4 sec, and it leaves no footprints in salt (like a Wraith).",
    weakness: "After a hunt in the enraged state it becomes 'Weakened': it is slow, incense works for 6 sec, and its hunt threshold drops to 40%.",
    test: 'Lay several salt piles with big gaps between them. If it steps in the first pile (gets enraged) and then walks through the next ones without stepping in them or leaving footprints (ignoring salt) — it is Gallu.',
  },
  obambo: {
    hunt: '65% (Aggressive) / 10% (Calm)',
    desc: 'A bipolar ghost that lives by a strict timer.',
    strength: 'Switches state every 2 minutes. In the aggressive state it is very active and fast, its hunts are 20% shorter, and it can attack at 65% sanity.',
    weakness: 'In the calm state it almost never attacks (only down to 10% sanity) and is noticeably slower.',
    test: 'Listen to its footstep speed during a long hunt. If it suddenly changes speed sharply (much faster or much slower) with no visual contact with a player (the 2-minute timer flipped) — it is Obambo.',
  },
  spirit: {
    hunt: '50%',
    desc: 'A standard ghost with no special powers. Very sensitive to incense.',
    strength: 'Has no unique abilities or speed changes.',
    weakness: 'Using incense (Smudge Stick) stops it from hunting for 3 minutes (1.5 min for others).',
    test: 'Smudge the ghost and time it. If it does not start a hunt within 3 minutes (even at 0% sanity), it is definitely a Spirit.',
  },
  wraith: {
    hunt: '50%',
    desc: 'Can teleport to players. Never touches the ground.',
    strength: 'Never steps in salt (no footprints at all). May teleport right next to a player, producing EMF 2.',
    weakness: 'Salt is the best way to check it.',
    test: 'Put salt under the ghost. If an interaction or event happens but the salt stays intact (it never steps in it) — it is 100% a Wraith.',
  },
  phantom: {
    hunt: '50%',
    desc: 'Loves to scare. May approach a player (producing EMF 2).',
    strength: 'Looking at it quickly drains sanity. During a hunt it blinks very slowly (stays invisible longer).',
    weakness: 'Photographing a Phantom during an event makes it vanish instantly.',
    test: "Photograph it during a paranormal event. The Phantom vanishes, but the event sound (a heartbeat) keeps playing. The ghost will not be visible in the photo, and it will not 'glitch'.",
  },
  poltergeist: {
    hunt: '50%',
    desc: 'A noisy spirit that loves throwing things.',
    strength: 'Can throw many objects at once (a burst), draining 2% sanity for each.',
    weakness: 'In an empty room (no objects) it is no different from an ordinary ghost.',
    test: 'Pile small objects on a table. If the ghost scatters them all at once in different directions — it is 100% a Poltergeist. During a hunt it throws objects every half second.',
  },
  banshee: {
    hunt: '50% (target)',
    desc: 'A natural hunter that picks one victim for the whole game.',
    strength: 'Hunts only its target. All other players are safe while the target is inside.',
    weakness: 'Makes a unique paranormal scream into the Parabolic Microphone.',
    test: "Use the Parabolic Mic — if you hear a high-pitched scream, it is a Banshee. Or have the Banshee's target leave the house; during a hunt the ghost will then ignore the other players (walking through them).",
  },
  jinn: {
    hunt: '50%',
    desc: 'A territorial ghost. Never turns off the breaker.',
    strength: 'If the breaker is on and you are far away (in line of sight), it rushes at you at huge speed (2.5 m/s), slowing down only up close.',
    weakness: 'Turning off the breaker takes away its speed.',
    test: 'Leave the breaker on. During a hunt stand in a long corridor. If the ghost races toward you but slows sharply about 3 meters away — it is a Jinn.',
  },
  mare: {
    hunt: '60% (dark) / 40% (light)',
    desc: 'A spirit of darkness. Loves turning off the lights.',
    strength: 'Attacks more often in the dark (threshold 60%). Can break light bulbs.',
    weakness: 'Turning on the lights in its room lowers its hunt threshold to 40%. It never turns the lights on itself.',
    test: 'If the ghost has turned on any light or computer even once — it is definitely NOT a Mare.',
  },
  revenant: {
    hunt: '50%',
    desc: 'A fast and deadly killer.',
    strength: 'If it sees you (or hears your voice or radio), it runs at incredible speed (3.0 m/s).',
    weakness: 'If it has no target (sees and hears no one), it crawls very slowly (1.0 m/s).',
    test: 'Hide. If the footsteps are very, very slow, and then someone shouts and the footsteps become extremely fast — it is a Revenant.',
  },
  shade: {
    hunt: '35%',
    desc: 'A shy ghost that hides from groups.',
    strength: 'Very hard to get evidence from. Rarely interacts with objects while you are around.',
    weakness: 'Cannot start a hunt if anyone is in its room.',
    test: 'Drop your sanity to 0% and stand in the ghost room. If a hunt starts RIGHT after you leave it — it is a Shade.',
  },
  demon: {
    hunt: '70% (or 100%)',
    desc: 'The most aggressive ghost.',
    strength: 'Can use an ability to start a hunt at 100% sanity.',
    weakness: 'A crucifix works at 5 meters (instead of 3). Incense stops it for only 60 sec.',
    test: 'If a hunt starts in the first minute of the game — it is almost certainly a Demon. If it attacks 65–70 seconds after smudging — it is also a Demon.',
  },
  yurei: {
    hunt: '50%',
    desc: 'A ghost that feeds on sanity.',
    strength: 'Has an ability: it suddenly slams a door shut (with a lock click), taking 15% sanity from everyone nearby.',
    weakness: "Incense in its room 'traps' it there for 90 seconds.",
    test: "If a fully open door suddenly slams shut with a distinctive double lock sound — that is the Yurei's unique ability.",
  },
  oni: {
    hunt: '50%',
    desc: 'Loves a crowd. The complete opposite of the Shade.',
    strength: 'Very active when people are around. During a hunt it almost never flickers (clearly visible).',
    weakness: "Never performs the hissing 'airball' (puff of fog) event.",
    test: "If you caught a hissing 'puff of fog', you can safely cross the Oni off. During a hunt it is extremely visible.",
  },
  yokai: {
    hunt: '80% (talking)',
    desc: 'Gets irritated by voices.',
    strength: 'Talking nearby raises its chance to attack (it can attack at 80%).',
    weakness: "During a hunt it is 'deaf'. It hears voices and electronics only within 2.5 meters (others — 10 m).",
    test: 'Hide in a nearby room, turn on a flashlight and shout. If it walks past and does not come in — it is a Yokai (it cannot hear you).',
  },
  hantu: {
    hunt: '50%',
    desc: 'Loves the cold. Never turns on the breaker.',
    strength: 'Moves fast in cold rooms (2.7 m/s). Slow in warm ones (1.4 m/s).',
    weakness: "Its breath vapor is always visible during a hunt (if the breaker is off).",
    test: 'Turn off the breaker. If you see vapor by the ghost’s head, it runs fast, and in a warm room it slows sharply — it is a Hantu.',
  },
  goryo: {
    hunt: '50%',
    desc: 'A homebody that rarely leaves its room.',
    strength: 'Its D.O.T.S. can be seen ONLY through a video camera and only when nobody is in the room.',
    weakness: 'Rarely wanders far from its favorite room.',
    test: 'If a silhouette runs by on the camera, but with the naked eye (standing behind the door) you saw nothing at that moment — it is a Goryo.',
  },
  myling: {
    hunt: '50%',
    desc: 'A very quiet killer.',
    strength: 'Its footsteps during a hunt cannot be heard until it gets right up to you (the flashlight flicker radius).',
    weakness: 'Makes sounds (groans) into the Parabolic Mic more often.',
    test: 'Hide. If you hear footsteps AT THE SAME TIME as your flashlight starts flickering (and not earlier) — it is a Myling. Other ghosts can be heard from afar.',
  },
  onryo: {
    hunt: '60% (no flame)',
    desc: 'Afraid of fire.',
    strength: 'If it blows out 3 candles in a row, it immediately starts a hunt (at any sanity).',
    weakness: 'A lit candle works like a Crucifix (within 4 m). It always blows out the candle instead of attacking.',
    test: 'Place a candle by a crucifix. If the ghost tries to start a hunt, it ALWAYS blows out the candle first, leaving the crucifix intact.',
  },
  'the twins': {
    hunt: '50%',
    desc: 'Two ghosts working together.',
    strength: 'Can interact with objects at opposite ends of the house at the same time.',
    weakness: 'The main ghost is 10% slower than normal, and the decoy is 10% faster.',
    test: "If on the van's activity board the line goes up and has a 'kink' (another rise) — it is The Twins. Also, footstep speed differs between hunts.",
  },
  raiju: {
    hunt: '65% (electronics) / 50%',
    desc: 'Feeds off your equipment.',
    strength: 'Attacks earlier (65%) and runs incredibly fast near powered-on electronics.',
    weakness: 'Makes electronics glitch from 15 meters away (instead of 10 m).',
    test: "Make a 'trail' of turned-on flashlights. During a hunt it will fly along them, then slow sharply after passing.",
  },
  obake: {
    hunt: '50%',
    desc: 'A shapeshifter.',
    strength: 'Leaves fingerprints only 75% of the time. Can hide them.',
    weakness: 'Sometimes leaves a unique print: 6 fingers on a door (or 2 on a light switch).',
    test: 'If you find a 6-finger print — it is 100% an Obake. Watch it CLOSELY during a hunt: once per hunt it changes its model to a different one.',
  },
  'the mimic': {
    hunt: 'Variable',
    desc: 'Copies other ghosts.',
    strength: 'Copies abilities (it can be fast like a Revenant, then quiet like a Myling).',
    weakness: 'Always has 4 evidences instead of 3 (Ghost Orb is its fake evidence, which is always present).',
    test: 'If you found Ghost Orb plus 3 other genuine evidences — it is a Mimic.',
  },
  moroi: {
    hunt: '50%',
    desc: 'Curses its victims.',
    strength: "The lower the team's average sanity, the faster the Moroi (up to 2.25 m/s at 0%).",
    weakness: 'Curses those who hear it on the Spirit Box (their sanity drops twice as fast). Incense blinds it for 12 sec (instead of 6).',
    test: 'If during a hunt after smudging it runs around blind for a very long time (12 seconds) — it is a Moroi.',
  },
  deogen: {
    hunt: '40%',
    desc: 'Always knows where you are. Hiding is impossible.',
    strength: 'When far away it runs at a furious speed (3 m/s). Knows your hiding spots.',
    weakness: 'When it gets right up to you, its speed drops to a laughable 0.4 m/s. You can simply walk away from it.',
    test: 'On the Spirit Box, standing right next to it, it gives a unique heavy breathing. During a hunt just stand in a corridor: it will arrive fast, but will barely crawl near you.',
  },
  thaye: {
    hunt: '75%',
    desc: 'Ages and weakens over time.',
    strength: 'Incredibly fast at the start of the game and can attack at 75%.',
    weakness: "If you are near it, it 'ages'. Over time it becomes slower, and its hunt threshold drops (down to 15%).",
    test: 'Ask its age on the Ouija Board at the start, then again after 10 min — it will change! If it flew at the start and barely walks at the end — it is a Thaye.',
  },
};

/* Привиди, які в базі записані лише українською назвою, без англійської в дужках. */
GHOSTS_EN['даян'] = { ...GHOSTS_EN.dayan, name: 'Dayan' };

GHOSTS_EN['кормос'] = {
  name: 'Cormos',
  hunt: '50% (can attack at 70% if a player is actively running/sprinting near its room)',
  desc: 'An absolutely blind hunter that navigates purely by noise. Ignores quiet, motionless players but gets irritated by running nearby. Its evidence mirrors the Mimic (without Freezing Temps).',
  strength: 'Reacts instantly to the sounds of footsteps, running or voices. Emits a sharp sound signal and accelerates rapidly toward the noise from the base 1.7 m/s to 2.21 m/s (and under certain conditions up to 3.65 m/s). Sensitive to rustling even inside hiding spots.',
  weakness: 'Absolutely blind. If a player turns off devices, does not talk and stands completely still, Cormos will walk right past, even if it ends up point-blank in the open.',
  test: 'During a hunt, freeze in the middle of a long empty corridor with no sound and your flashlight off. An ordinary ghost kills you at once, while Cormos simply walks past. You can also try provoking an early attack (at 70% sanity) by running actively near its room.',
};

GHOSTS_EN['асванг'] = {
  name: 'Aswang',
  hunt: '50%',
  desc: 'A dangerous stalker. Has a reduced base speed, but accelerates incredibly fast to its maximum on line of sight with a player.',
  strength: 'Incredible acceleration on visual contact (Line of Sight). It needs only 8.67 seconds to reach its maximum speed (2.53 m/s), while ordinary ghosts take 13 seconds.',
  weakness: 'Cannot kill players hidden in official hiding spots (closets, lockers) that close with a door.',
  test: 'Run into an official hiding spot (a closet) right in front of the ghost, or leave a flashlight turned on inside. If it is an Aswang, it will open the door, but the hunt ends instantly (the player survives). The next hunt starts without a build-up phase.',
};

GHOSTS_EN['дейльдегаст'] = {
  name: 'Daildegast',
  hunt: '50%',
  desc: 'A pedantic ghost whose hunting speed depends directly on the number of items players have scattered around. Very rarely interacts with doors and light switches.',
  strength: 'It has a huge advantage at the start of the investigation. Its base speed during the first hunt is extremely high (3 m/s), although it does not speed up from line of sight with a player.',
  weakness: 'The ghost can be slowed down considerably. The more unique items players (even dead ones!) move or throw around the location before the hunt starts, the slower it becomes (down to as little as 0.4 m/s).',
  test: "In a no-evidence game or on Nightmare, listen to the footsteps during the first hunt — the ghost will be very fast. Right after the attack ends, scatter as many different items around the house as you can (a maximum of 26 unique items counts). During the next hunt the ghost will be very slow. Important: throwing items during a hunt does not work (the speed is locked in); after every attack Daildegast's speed resets to the maximum 3 m/s, so the mess must be made between hunts.",
};

/* Примітки до швидкості (ключ — як у ghostMeta.SPEEDS). */
export const SPEED_NOTES_EN: Record<string, string> = {
  revenant: '1.0 with no target, 3.0 when it sees or hears a player',
  deogen: '3.0 from afar, 0.4 right next to the player',
  jinn: '2.5 from afar in line of sight, if the breaker is on',
  hantu: 'the colder the room, the faster; does not speed up in line of sight',
  raiju: '2.5 near powered-on electronics',
  moroi: 'the lower the team’s sanity, the faster',
  thaye: "2.75 at the start, slows down as it 'ages' to 1.0",
  'the twins': 'main ≈1.53, decoy ≈1.87',
  dayan: '2.25 if you move nearby, 1.2 if you stand still',
  gallu: '≈1.96 enraged, ≈1.36 weakened',
  obambo: '≈1.96 aggressive, ≈1.45 calm; the state changes every 2 min',
  'the mimic': 'copies the speed of the ghost it imitates',
};
export const DEFAULT_SPEED_NOTE_EN = 'standard 1.7, speeds up in line of sight';

/* ------------------------------ Спорядження ----------------------------- */
/* Ключ — ім’я файлу фото без розширення (воно однакове в коді і в базі). */

const tiers = (intro: string, t1: string, t2: string, t3: string) =>
  `${intro}<br><div style='margin-top: 10px; font-size: 0.9em; padding-left: 5px;'>` +
  `<strong style='color: var(--accent-purple);'>Tier 1:</strong> ${t1}<br>` +
  `<strong style='color: var(--accent-purple);'>Tier 2:</strong> ${t2}<br>` +
  `<strong style='color: var(--accent-purple);'>Tier 3:</strong> ${t3}</div>`;

export const EQUIPMENT_EN: Record<string, EquipmentText> = {
  emf: {
    name: 'EMF Reader',
    desc: tiers('Detects interaction. 5 lights (or the red indicator) = evidence.', 'Analog counter, readings are slow and imprecise.', 'Classic device with 5 little lights and a loud sound.', 'Digital screen, also shows the distance and direction to the source.'),
  },
  flashlight: {
    name: 'Flashlight',
    desc: tiers('The main light source. Flickers during a hunt, warning of danger.', 'Weak, narrow beam.', 'Standard bright flashlight.', 'Powerful floodlight with an extremely wide beam angle.'),
  },
  sound_recorder: {
    name: 'Sound Recorder',
    desc: tiers('Records paranormal sounds (whispers, footsteps) that you can later play back in the journal.', 'Cassette recorder, short range.', 'Digital recorder, cleaner sound and a longer range.', 'Professional recorder with a huge coverage radius and the highest sensitivity.'),
  },
  spirit_box: {
    name: 'Spirit Box',
    desc: tiers("Turn off the lights and ask: 'Where are you?'. A reply in the ghost's voice = evidence.", 'Old AM/FM radio. Very short range, lots of noise.', 'Digital receiver. Medium range and a screen with a ghost icon.', 'Boombox. Huge range, clear response indicator.'),
  },
  thermometer: {
    name: 'Thermometer',
    desc: tiers('If the temperature drops below 0°C and you see breath vapor = evidence.', 'Mercury thermometer. Updates slowly but is very reliable.', 'Digital. You have to hold the button to scan.', 'Advanced digital. Instantly shows the room temperature.'),
  },
  uv_light: {
    name: 'UV Light',
    desc: tiers('Used to find fingerprints and footprints.', 'Chemical light source (Glowstick). Lights up the area around it, you have to shake it.', 'Narrow-beam UV flashlight.', 'UV floodlight. Wide beam, charges prints much faster.'),
  },
  book: {
    name: 'Ghost Writing Book',
    desc: tiers('Put it on the floor. Drawings or writing in it = evidence.', 'Small notebook. Low chance of interaction.', 'Standard medium-sized notebook.', 'Large luxury book. The ghost writes in it almost instantly.'),
  },
  video_camera: {
    name: 'Video Camera',
    desc: tiers("Turn on Night Vision to look for a 'Ghost Orb'.", 'Old camera (VHS). Very poor night vision and a small screen.', 'Modern digital camera with a cleaner image.', 'Professional DSLR camera. Gigantic screen and perfect night vision.'),
  },
  dots: {
    name: 'D.O.T.S. Projector',
    desc: tiers('Emits a grid of dots. A translucent silhouette = evidence.', 'Laser pen. Lights only a single point (narrow beam).', 'Floor projector. Covers a medium-sized room.', 'Motorized projector. Moves and scans the whole room.'),
  },
  crucifix: {
    name: 'Crucifix',
    desc: tiers('Prevents a hunt if the ghost tries to appear nearby.', 'A simple wooden cross. 3 m radius, only 1 charge.', 'Iron cross. 4 m radius, 2 charges.', 'Ornate cross. 5 m radius, 2 charges, can even block a Cursed Hunt.'),
  },
  incense: {
    name: 'Incense',
    desc: tiers('Blinds the ghost during a hunt or blocks it from starting one for 90 s.', 'A simple bundle of herbs. Blinds for 5 sec, 3 m radius.', 'Standard incense. Blinds for 6 sec, 4 m radius.', "Sacred incense. Blinds for 7 sec, 5 m radius, and fully paralyzes the ghost's movement for 1 second!"),
  },
  salt: {
    name: 'Salt',
    desc: tiers('Lets you track footsteps. A Wraith never steps in salt.', 'A regular salt shaker. Enough for 2 small piles.', 'Wooden jar. Enough for 3 large piles.', 'Black salt. Enough for 3 lines. If the ghost steps in it during a hunt, it temporarily slows down!'),
  },
  igniter: {
    name: 'Igniter',
    desc: tiers('Required to use incense, candles and the Summoning Circle.', 'Matches. Burn out quickly and give little light.', 'Zippo lighter. Burns for a long time.', 'Gas torch. Does not go out in rain and shines very brightly.'),
  },
  candle: {
    name: 'Candle',
    desc: tiers('Slows sanity drain significantly. The Onryo blows it out instead of hunting.', 'A small candle. Burns down quickly.', 'A large candle. Burns for a long time and lights well.', 'Kerosene lamp. Does not go out in the wind and runs almost forever.'),
  },
  photo_camera: {
    name: 'Photo Camera',
    desc: tiers('Takes photos of the ghost, evidence and cursed possessions for money.', 'Old Polaroid. Very slow recharge between shots.', "Digital point-and-shoot. Medium shooting speed.", 'DSLR camera. Lets you take shots one right after another.'),
  },
  pills: {
    name: 'Sanity Pills',
    desc: tiers('Restores your sanity.', 'Pills restore sanity very slowly (gradually).', 'Syrup restores sanity noticeably faster.', 'Adrenaline syringe. Restores sanity almost instantly and gives a temporary sprint bonus (running speed).'),
  },
  paramic: {
    name: 'Parabolic Microphone',
    desc: tiers('Lets you hear paranormal sounds through walls from far away.', 'Basic parabolic microphone, short range.', 'Modern microphone with a display and more precise sound pickup.', 'Sonar that also shows the visual source of the sound on a large screen.'),
  },
  motion_sensor: {
    name: 'Motion Sensor',
    desc: tiers('Sends a signal to the van when the ghost passes through its beam.', 'Laser line, covers only a narrow passage.', 'Sensor with light and sound indication, covers a wider angle.', 'Motion scanner. Covers the whole room and creates a laser grid.'),
  },
  head_gear: {
    name: 'Head Gear',
    desc: tiers("Worn on the head, freeing the player's hands.", 'Head-mounted video camera. The team sees your view in the van.', 'Headlamp. Lets you have light without holding a flashlight.', 'Night Vision Goggles. Lets you see in complete darkness without extra light.'),
  },
};

/* -------------------------------- Механіки -------------------------------- */

export interface MechanicsContent {
  title: string;
  sub: string;
  huntTitle: string;
  huntLead: string;
  standardLeft: (n: number) => string;
  panels: { title: string; lead?: string; facts: [string, string][] }[];
  cursedTitle: string;
  cursedLead: string;
  cursed: { icon: string; name: string; text: string }[];
}

export const MECHANICS: Record<'uk' | 'en', MechanicsContent> = {
  uk: {
    title: 'Механіки гри',
    sub: 'Те, що варто знати перед тим, як зайти в будинок.',
    huntTitle: 'Коли привид починає полювання',
    huntLead: 'Полювання залежить від середнього глузду команди. Більшість привидів атакують, коли він падає до 50%. Нижче — ті, хто порушує це правило.',
    standardLeft: (n) => `Ще ${n} привидів атакують на стандартних 50%.`,
    panels: [
      {
        title: 'Івент чи полювання',
        facts: [
          ['Вхідні двері', 'Під час івенту лишаються відчиненими. Щойно починається полювання — зачиняються і замикаються.'],
          ['Видимість', 'Під час івенту привид з’являється одразу. На початку полювання він кілька секунд невидимий — чути лише кроки.'],
          ['Електроніка', 'Під час полювання ліхтарик та інші прилади мерехтять, коли привид близько.'],
        ],
      },
      {
        title: 'Пахощі',
        facts: [
          ['Під час полювання', 'Запаліть поруч із привидом — він осліпне на кілька секунд і не зможе вас убити. Морой сліпне на 12 секунд.'],
          ['Поза полюванням', 'У кімнаті привида пахощі забороняють йому полювати 90 секунд. Дух чекає 180 секунд, Демон — лише 60.'],
          ['Виняток', 'Галлу від пахощів, солі та розп’яття лютує і стає небезпечнішим.'],
        ],
      },
      {
        title: 'Як сховатися',
        facts: [
          ['Вимкніть електроніку', 'Привид відчуває увімкнені прилади в руках у радіусі 10 метрів. Ліхтарик — вимкнути, наголовну камеру 3 рівня — зняти.'],
          ['Мовчіть', 'Привид чує ваш мікрофон так само добре, як і прилади.'],
          ['Розірвіть лінію зору', 'Поки привид вас бачить, він розганяється (крім Тає, Деогена і Ханту). Заверніть за ріг, перш ніж лізти в шафу.'],
        ],
      },
      {
        title: 'Додатковий заробіток',
        facts: [
          ['Три завдання', 'На дошці у фургоні завжди є три випадкові завдання. Вони дають помітний бонус до грошей і досвіду.'],
          ['Кістка', 'На кожній карті схована одна кістка. Сфотографуйте її і підберіть.'],
          ['Фото', 'Найбільше платять за фото привида, проклятого предмета, кістки, відбитків і брудної води.'],
          ['Ідеальне розслідування', 'Визначте привида, виконайте всі завдання, знайдіть кістку і зробіть 10 фото на три зірки — отримаєте великий множник.'],
        ],
      },
      {
        title: 'Престиж',
        lead: 'Доступний зі 100-го рівня.',
        facts: [
          ['Що втрачаєте', 'Рівень скидається до першого, гроші обнуляються, спорядження 2 і 3 рівнів треба відкривати заново.'],
          ['Що отримуєте', 'Новий рівень престижу (I–XX), нашивку на руку, кольори та фони для ID-картки і титули для лобі.'],
        ],
      },
    ],
    cursedTitle: 'Прокляті предмети',
    cursedLead: 'На кожній карті є один випадковий проклятий предмет. Він допомагає знайти привида, але спалює глузд і може викликати прокляте полювання: воно триває довше, а пахощі й розп’яття його не зупиняють.',
    cursed: [
      { icon: '🔮', name: 'Дошка Уїджі', text: 'Відповідає на запитання («Де ти?», «Скільки тобі років?»). Кожне запитання знімає глузд. Не забудьте сказати «Goodbye».' },
      { icon: '🃏', name: 'Карти Таро', text: '10 карт із випадковим ефектом — від повного відновлення глузду до миттєвої смерті.' },
      { icon: '🪞', name: 'Дзеркало', text: 'Показує кімнату привида, але швидко випиває глузд — близько 7.5% за секунду.' },
      { icon: '🎵', name: 'Музична скринька', text: 'Привид підспівує і йде до скриньки. Якщо скринька впаде — почнеться атака.' },
      { icon: '🩸', name: 'Коло заклику', text: 'Запаліть 5 свічок — привид з’явиться в центрі для фото, після чого одразу почне полювання.' },
      { icon: '🪆', name: 'Лялька вуду', text: 'Змушує привида взаємодіяти. Кожна голка знімає глузд, голка в серце — полювання.' },
      { icon: '🐒', name: 'Мавпяча лапа', text: 'Виконує бажання (знайти привида, вижити, воскресити друга) за жахливу ціну.' },
    ],
  },
  en: {
    title: 'Game mechanics',
    sub: 'What you should know before walking into the house.',
    huntTitle: 'When a ghost starts hunting',
    huntLead: 'Hunting depends on the team’s average sanity. Most ghosts attack when it drops to 50%. Below are the ones that break this rule.',
    standardLeft: (n) => `${n} more ghosts hunt at the standard 50%.`,
    panels: [
      {
        title: 'Event or hunt',
        facts: [
          ['Front door', 'During an event it stays open. As soon as a hunt starts, it shuts and locks.'],
          ['Visibility', 'During an event the ghost appears right away. At the start of a hunt it is invisible for a few seconds — you only hear footsteps.'],
          ['Electronics', 'During a hunt, the flashlight and other devices flicker when the ghost is close.'],
        ],
      },
      {
        title: 'Incense',
        facts: [
          ['During a hunt', 'Light it near the ghost — it goes blind for a few seconds and cannot kill you. A Moroi is blinded for 12 seconds.'],
          ['Outside a hunt', 'In the ghost’s room, incense forbids it from hunting for 90 seconds. A Spirit waits 180 seconds, a Demon only 60.'],
          ['Exception', 'Incense, salt and the crucifix make a Gallu rage and become more dangerous.'],
        ],
      },
      {
        title: 'How to hide',
        facts: [
          ['Turn off electronics', 'The ghost senses powered-on devices in your hands within 10 meters. Turn the flashlight off, take off tier 3 head gear.'],
          ['Stay quiet', 'The ghost hears your microphone just as well as devices.'],
          ['Break line of sight', 'While the ghost sees you, it speeds up (except Thaye, Deogen and Hantu). Turn a corner before climbing into a closet.'],
        ],
      },
      {
        title: 'Extra income',
        facts: [
          ['Three tasks', 'There are always three random tasks on the van board. They give a noticeable bonus to money and XP.'],
          ['Bone', 'Every map hides one bone. Photograph it and pick it up.'],
          ['Photos', 'Photos of the ghost, a cursed possession, a bone, fingerprints and dirty water pay the most.'],
          ['Perfect investigation', 'Identify the ghost, complete all tasks, find the bone and take 10 three-star photos — you get a big multiplier.'],
        ],
      },
      {
        title: 'Prestige',
        lead: 'Available from level 100.',
        facts: [
          ['What you lose', 'Your level resets to 1, money is zeroed, and tier 2 and 3 equipment must be unlocked again.'],
          ['What you get', 'A new prestige level (I–XX), an arm patch, colors and backgrounds for the ID card, and lobby titles.'],
        ],
      },
    ],
    cursedTitle: 'Cursed possessions',
    cursedLead: 'Every map has one random cursed possession. It helps you find the ghost, but burns sanity and can trigger a cursed hunt: it lasts longer, and incense and crucifixes do not stop it.',
    cursed: [
      { icon: '🔮', name: 'Ouija Board', text: 'Answers questions (“Where are you?”, “How old are you?”). Each question drains sanity. Don’t forget to say “Goodbye”.' },
      { icon: '🃏', name: 'Tarot Cards', text: '10 cards with a random effect — from full sanity restoration to instant death.' },
      { icon: '🪞', name: 'Haunted Mirror', text: 'Shows the ghost’s room but drains sanity fast — about 7.5% per second.' },
      { icon: '🎵', name: 'Music Box', text: 'The ghost sings along and walks to the box. If the box falls, a hunt begins.' },
      { icon: '🩸', name: 'Summoning Circle', text: 'Light 5 candles — the ghost appears in the center for a photo, then immediately starts a hunt.' },
      { icon: '🪆', name: 'Voodoo Doll', text: 'Forces the ghost to interact. Each pin drains sanity, a pin in the heart triggers a hunt.' },
      { icon: '🐒', name: 'Monkey Paw', text: 'Grants wishes (find the ghost, survive, resurrect a friend) at a terrible price.' },
    ],
  },
};
