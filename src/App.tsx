import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BookOpen, Database, Ghost as GhostIcon, GraduationCap, LogIn, LogOut, RefreshCw, Search, Settings, Sparkles, Timer, Wrench, ScanSearch } from 'lucide-react';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { api, loadWikiData, WikiData, LOCAL_GHOSTS, LOCAL_EQUIPMENT } from './lib/api';
import { Ghost, Equipment } from './types';
import { IdentifierTab } from './components/IdentifierTab';
import { GhostsTab } from './components/GhostsTab';
import { EquipmentTab } from './components/EquipmentTab';
import { MechanicsTab } from './components/MechanicsTab';
import { ToolsTab } from './components/ToolsTab';
import { QuizTab } from './components/QuizTab';
import { AdminTab } from './components/AdminTab';
import { AIChat } from './components/AIChat';
import { CommandPalette, PaletteItem } from './components/CommandPalette';
import { ConfirmDialog, ToastProvider, useToast } from './components/ui';

export type TabType = 'identifier' | 'ghosts' | 'equipment' | 'mechanics' | 'tools' | 'quiz' | 'admin';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'identifier', label: 'Визначник', icon: <ScanSearch size={17} /> },
  { id: 'ghosts', label: 'Привиди', icon: <GhostIcon size={17} /> },
  { id: 'equipment', label: 'Спорядження', icon: <Wrench size={17} /> },
  { id: 'mechanics', label: 'Механіки', icon: <BookOpen size={17} /> },
  { id: 'tools', label: 'Інструменти', icon: <Timer size={17} /> },
  { id: 'quiz', label: 'Тренування', icon: <GraduationCap size={17} /> },
];

const tabFromHash = (): TabType => {
  const id = window.location.hash.replace('#', '') as TabType;
  return TABS.some((t) => t.id === id) || id === 'admin' ? id : 'identifier';
};

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

function Shell() {
  const toast = useToast();
  const [tab, setTab] = useState<TabType>(tabFromHash);
  const [data, setData] = useState<WikiData>({ ghosts: LOCAL_GHOSTS, equipment: LOCAL_EQUIPMENT, source: 'local' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [ghostQuery, setGhostQuery] = useState('');
  const [equipmentQuery, setEquipmentQuery] = useState('');
  const [editingGhost, setEditingGhost] = useState<Ghost | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'ghosts' | 'equipment'; name: string } | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await loadWikiData();
    setData(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (current) => {
        setUser(current);
        if (!current) return setIsAdmin(false);
        try {
          setIsAdmin((await api<{ isAdmin: boolean }>('/api/me')).isAdmin);
        } catch {
          setIsAdmin(false);
        }
      }),
    [],
  );

  const go = useCallback((next: TabType) => {
    setTab(next);
    window.history.replaceState(null, '', `#${next}`);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
      toast('Ви увійшли в акаунт');
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') return;
      toast(
        error?.code === 'auth/unauthorized-domain'
          ? 'Цей домен не дозволено у Firebase. Додайте його в Authentication → Settings → Authorized domains.'
          : error?.code === 'auth/popup-blocked'
            ? 'Браузер заблокував вікно входу. Дозвольте спливаючі вікна для цього сайту.'
            : 'Не вдалося увійти. Вимкніть блокувальник реклами і спробуйте ще раз.',
        'error',
      );
    }
  };

  const logout = async () => {
    await logOut();
    toast('Ви вийшли з акаунта');
  };

  const adminActions = useMemo(
    () =>
      isAdmin
        ? {
            editGhost: (g: Ghost) => {
              setEditingEquipment(null);
              setEditingGhost(g);
              go('admin');
            },
            deleteGhost: (name: string) => setPendingDelete({ kind: 'ghosts', name }),
            editEquipment: (e: Equipment) => {
              setEditingGhost(null);
              setEditingEquipment(e);
              go('admin');
            },
            deleteEquipment: (name: string) => setPendingDelete({ kind: 'equipment', name }),
          }
        : null,
    [isAdmin, go],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, name } = pendingDelete;
    setPendingDelete(null);
    try {
      await api(`/api/${kind}/${encodeURIComponent(name)}`, { method: 'DELETE' });
      toast(`Видалено: ${name}`);
      refresh();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const paletteItems = useMemo<PaletteItem[]>(
    () => [
      ...TABS.map((t) => ({ id: `tab-${t.id}`, group: 'Розділи', title: t.label, run: () => go(t.id) })),
      { id: 'chat', group: 'Розділи', title: 'ШІ-асистент', run: () => setChatOpen(true) },
      ...data.ghosts.map((g) => ({
        id: `g-${g.name}`,
        group: 'Привиди',
        title: g.name,
        hint: g.evidence.join(', '),
        run: () => {
          setGhostQuery(g.name);
          go('ghosts');
        },
      })),
      ...data.equipment.map((e) => ({
        id: `e-${e.name}`,
        group: 'Спорядження',
        title: `${e.icon} ${e.name}`.trim(),
        run: () => {
          setEquipmentQuery(e.name);
          go('equipment');
        },
      })),
    ],
    [data, go],
  );

  const live = data.source === 'live';

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <button className="brand" onClick={() => go('identifier')} aria-label="PhasmoWiki — на головну">
            <span className="brand-mark" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </span>
            <span className="brand-name">PhasmoWiki</span>
          </button>

          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setPaletteOpen(true)}>
              <Search size={16} />
              <span>Пошук</span>
              <kbd>Ctrl K</kbd>
            </button>

            <div className="status" ref={statusRef}>
              <button
                className={`status-pill ${loading ? 'is-loading' : live ? 'is-live' : 'is-local'}`}
                onClick={() => setStatusOpen((v) => !v)}
                aria-expanded={statusOpen}
              >
                <span className="status-dot" />
                <span className="status-text">{loading ? 'З’єднання…' : live ? 'База онлайн' : 'Локальна копія'}</span>
              </button>
              {statusOpen && (
                <div className="status-pop" role="dialog" aria-label="Стан бази даних">
                  <p className="status-pop-title">
                    <Database size={16} /> {live ? 'Дані з бази Supabase' : 'Показано вбудований довідник'}
                  </p>
                  <p>
                    {live
                      ? `Завантажено привидів: ${data.ghosts.length}, предметів: ${data.equipment.length}.`
                      : data.problem || 'База даних недоступна.'}
                  </p>
                  {!live && <p className="muted">Усі розділи працюють. Зміни з адмін-панелі з’являться, коли база відповість.</p>}
                  <button
                    className="btn btn-quiet"
                    disabled={loading}
                    onClick={async () => {
                      const next = await refresh();
                      toast(next.source === 'live' ? 'База відповіла — дані оновлено' : 'База досі недоступна', next.source === 'live' ? 'ok' : 'error');
                    }}
                  >
                    <RefreshCw size={15} className={loading ? 'spin' : ''} /> Перевірити ще раз
                  </button>
                </div>
              )}
            </div>

            <button className="btn btn-uv chat-trigger" onClick={() => setChatOpen(true)}>
              <Sparkles size={16} />
              <span>ШІ-асистент</span>
            </button>

            {user ? (
              <div className="user">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span className="user-fallback">{(user.displayName || user.email || '?')[0]}</span>
                )}
                <button className="icon-btn" onClick={logout} title="Вийти" aria-label="Вийти">
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button className="btn btn-quiet" onClick={login}>
                <LogIn size={16} />
                <span>Увійти</span>
              </button>
            )}
          </div>
        </div>

        <nav className="tabs" aria-label="Розділи">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
              {t.icon}
              {t.label}
              {t.id === 'ghosts' && <span className="tab-count">{data.ghosts.length}</span>}
            </button>
          ))}
          {isAdmin && (
            <button className={`tab ${tab === 'admin' ? 'is-active' : ''}`} onClick={() => go('admin')}>
              <Settings size={17} />
              Адмін
            </button>
          )}
        </nav>
      </header>

      <main className="page" key={tab}>
        {tab === 'identifier' && <IdentifierTab ghosts={data.ghosts} admin={adminActions} />}
        {tab === 'ghosts' && <GhostsTab ghosts={data.ghosts} admin={adminActions} query={ghostQuery} setQuery={setGhostQuery} />}
        {tab === 'equipment' && <EquipmentTab equipment={data.equipment} admin={adminActions} query={equipmentQuery} setQuery={setEquipmentQuery} />}
        {tab === 'mechanics' && <MechanicsTab ghosts={data.ghosts} />}
        {tab === 'tools' && <ToolsTab ghosts={data.ghosts} />}
        {tab === 'quiz' && <QuizTab ghosts={data.ghosts} />}
        {tab === 'admin' &&
          (isAdmin ? (
            <AdminTab
              data={data}
              editingGhost={editingGhost}
              setEditingGhost={setEditingGhost}
              editingEquipment={editingEquipment}
              setEditingEquipment={setEditingEquipment}
              onRefresh={refresh}
            />
          ) : (
            <div className="empty">
              <h2>Розділ для адміністраторів</h2>
              <p>{user ? 'У цього акаунта немає прав адміністратора.' : 'Увійдіть через Google-акаунт адміністратора.'}</p>
              {!user && (
                <button className="btn btn-uv" onClick={login}>
                  <LogIn size={16} /> Увійти через Google
                </button>
              )}
            </div>
          ))}
      </main>

      <footer className="footer">
        <p>Автори: Ковальчук Ростислав Ростиславович, Папірник Евеліна Романівна</p>
        <p className="muted">Фанатський довідник. Phasmophobia належить Kinetic Games.</p>
      </footer>

      <AIChat open={chatOpen} onClose={() => setChatOpen(false)} user={user} onLogin={login} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
      <ConfirmDialog
        open={!!pendingDelete}
        title={pendingDelete?.kind === 'ghosts' ? 'Видалити привида?' : 'Видалити спорядження?'}
        text={`«${pendingDelete?.name}» буде видалено з бази. Це не можна скасувати.`}
        confirmLabel="Видалити"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export interface AdminActions {
  editGhost: (g: Ghost) => void;
  deleteGhost: (name: string) => void;
  editEquipment: (e: Equipment) => void;
  deleteEquipment: (name: string) => void;
}
