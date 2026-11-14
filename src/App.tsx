import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BookOpen, Database, Ghost as GhostIcon, GraduationCap, Languages, LogIn, LogOut, RefreshCw, Search, Settings, Sparkles, Timer, Wrench, ScanSearch } from 'lucide-react';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { api, loadWikiData, sortGhosts, WikiData, LOCAL_GHOSTS, LOCAL_EQUIPMENT } from './lib/api';
import { Key, useI18n } from './lib/i18n';
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

const TABS: { id: TabType; label: Key; icon: React.ReactNode }[] = [
  { id: 'identifier', label: 'tab.identifier', icon: <ScanSearch size={17} /> },
  { id: 'ghosts', label: 'tab.ghosts', icon: <GhostIcon size={17} /> },
  { id: 'equipment', label: 'tab.equipment', icon: <Wrench size={17} /> },
  { id: 'mechanics', label: 'tab.mechanics', icon: <BookOpen size={17} /> },
  { id: 'tools', label: 'tab.tools', icon: <Timer size={17} /> },
  { id: 'quiz', label: 'tab.quiz', icon: <GraduationCap size={17} /> },
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
  const { t, lang, setLang, gName, eName, ev } = useI18n();
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
      toast(t('auth.loggedIn'));
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') return;
      toast(
        error?.code === 'auth/unauthorized-domain'
          ? t('auth.errDomain')
          : error?.code === 'auth/popup-blocked'
            ? t('auth.errPopup')
            : t('auth.errGeneric'),
        'error',
      );
    }
  };

  const logout = async () => {
    await logOut();
    toast(t('auth.loggedOut'));
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
      toast(t('toast.deleted', { name }));
      refresh();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  // Привиди й спорядження в поточній мові; сортування за назвою теж залежить від мови.
  const ghosts = useMemo(() => sortGhosts(data.ghosts, lang), [data.ghosts, lang]);

  const paletteItems = useMemo<PaletteItem[]>(
    () => [
      ...TABS.map((tabItem) => ({ id: `tab-${tabItem.id}`, group: t('palette.sections'), top: true, title: t(tabItem.label), run: () => go(tabItem.id) })),
      { id: 'chat', group: t('palette.sections'), top: true, title: t('chat.title'), run: () => setChatOpen(true) },
      ...ghosts.map((g) => ({
        id: `g-${g.name}`,
        group: t('palette.ghosts'),
        title: gName(g),
        hint: g.evidence.map(ev).join(', '),
        run: () => {
          setGhostQuery(gName(g));
          go('ghosts');
        },
      })),
      ...data.equipment.map((e) => ({
        id: `e-${e.name}`,
        group: t('palette.gear'),
        title: `${e.icon} ${eName(e)}`.trim(),
        run: () => {
          setEquipmentQuery(eName(e));
          go('equipment');
        },
      })),
    ],
    [data.equipment, ghosts, go, lang],
  );

  const live = data.source === 'live';

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <button className="brand" onClick={() => go('identifier')} aria-label={t('app.homeAria')}>
            <span className="brand-mark" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </span>
            <span className="brand-name">PhasmoWiki</span>
          </button>

          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setPaletteOpen(true)}>
              <Search size={16} />
              <span>{t('search.label')}</span>
              <kbd>Ctrl K</kbd>
            </button>

            <div className="status" ref={statusRef}>
              <button
                className={`status-pill ${loading ? 'is-loading' : live ? 'is-live' : 'is-local'}`}
                onClick={() => setStatusOpen((v) => !v)}
                aria-expanded={statusOpen}
              >
                <span className="status-dot" />
                <span className="status-text">{loading ? t('status.connecting') : live ? t('status.online') : t('status.local')}</span>
              </button>
              {statusOpen && (
                <div className="status-pop" role="dialog" aria-label={t('status.aria')}>
                  <p className="status-pop-title">
                    <Database size={16} /> {live ? t('status.titleLive') : t('status.titleLocal')}
                  </p>
                  <p>
                    {live
                      ? t('status.loaded', { ghosts: data.ghosts.length, equipment: data.equipment.length })
                      : data.problemKey
                        ? t(data.problemKey)
                        : data.problem || t('status.unavailable')}
                  </p>
                  {!live && <p className="muted">{t('status.localNote')}</p>}
                  <button
                    className="btn btn-quiet"
                    disabled={loading}
                    onClick={async () => {
                      const next = await refresh();
                      toast(next.source === 'live' ? t('status.recheckOk') : t('status.recheckFail'), next.source === 'live' ? 'ok' : 'error');
                    }}
                  >
                    <RefreshCw size={15} className={loading ? 'spin' : ''} /> {t('status.recheck')}
                  </button>
                </div>
              )}
            </div>

            <button className="btn btn-quiet lang-switch" onClick={() => setLang(lang === 'uk' ? 'en' : 'uk')} title={t('lang.switch')} aria-label={t('lang.switch')}>
              <Languages size={16} />
              <span>{t('lang.short')}</span>
            </button>

            <button className="btn btn-uv chat-trigger" onClick={() => setChatOpen(true)}>
              <Sparkles size={16} />
              <span>{t('chat.title')}</span>
            </button>

            {user ? (
              <div className="user">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span className="user-fallback">{(user.displayName || user.email || '?')[0]}</span>
                )}
                <button className="icon-btn" onClick={logout} title={t('auth.logout')} aria-label={t('auth.logout')}>
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button className="btn btn-quiet" onClick={login}>
                <LogIn size={16} />
                <span>{t('auth.login')}</span>
              </button>
            )}
          </div>
        </div>

        <nav className="tabs" aria-label={t('nav.sections')}>
          {TABS.map((tabItem) => (
            <button key={tabItem.id} className={`tab ${tab === tabItem.id ? 'is-active' : ''}`} onClick={() => go(tabItem.id)} aria-current={tab === tabItem.id ? 'page' : undefined}>
              {tabItem.icon}
              {t(tabItem.label)}
              {tabItem.id === 'ghosts' && <span className="tab-count">{data.ghosts.length}</span>}
            </button>
          ))}
          {isAdmin && (
            <button className={`tab ${tab === 'admin' ? 'is-active' : ''}`} onClick={() => go('admin')}>
              <Settings size={17} />
              {t('tab.admin')}
            </button>
          )}
        </nav>
      </header>

      <main className="page" key={tab}>
        {tab === 'identifier' && <IdentifierTab ghosts={ghosts} admin={adminActions} />}
        {tab === 'ghosts' && <GhostsTab ghosts={ghosts} admin={adminActions} query={ghostQuery} setQuery={setGhostQuery} />}
        {tab === 'equipment' && <EquipmentTab equipment={data.equipment} admin={adminActions} query={equipmentQuery} setQuery={setEquipmentQuery} />}
        {tab === 'mechanics' && <MechanicsTab ghosts={ghosts} />}
        {tab === 'tools' && <ToolsTab ghosts={ghosts} />}
        {tab === 'quiz' && <QuizTab ghosts={ghosts} />}
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
              <h2>{t('adminOnly.title')}</h2>
              <p>{user ? t('adminOnly.noRights') : t('adminOnly.signIn')}</p>
              {!user && (
                <button className="btn btn-uv" onClick={login}>
                  <LogIn size={16} /> {t('auth.loginGoogle')}
                </button>
              )}
            </div>
          ))}
      </main>

      <footer className="footer">
        <p>{t('footer.authors')}</p>
        <p className="muted">{t('footer.disclaimer')}</p>
      </footer>

      <AIChat open={chatOpen} onClose={() => setChatOpen(false)} user={user} onLogin={login} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
      <ConfirmDialog
        open={!!pendingDelete}
        title={pendingDelete?.kind === 'ghosts' ? t('confirm.deleteGhost') : t('confirm.deleteGear')}
        text={t('confirm.text', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('common.delete')}
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
