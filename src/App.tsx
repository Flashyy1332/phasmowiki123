import React, { useState, useMemo, useEffect } from 'react';
import { Menu, Sparkles, Wand2, Search, Ghost as GhostIcon, Wrench, Settings, LogOut, LogIn, BookOpen } from 'lucide-react';
import { EVIDENCES, GHOSTS, EQUIPMENT } from './data';
import { IdentifierTab } from './components/IdentifierTab';
import { GhostsTab } from './components/GhostsTab';
import { EquipmentTab } from './components/EquipmentTab';
import { MechanicsTab } from './components/MechanicsTab';
import { AIChatTab, ChatMessage } from './components/AIChatTab';
import { AdminTab } from './components/AdminTab';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Ghost, Equipment } from './types';

type TabType = 'identifier' | 'ghosts' | 'equipment' | 'mechanics' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('identifier');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [excludedEvidences, setExcludedEvidences] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ghostToDelete, setGhostToDelete] = useState<string | null>(null);

  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Привіт! Я — ваш персональний ШІ-експерт з Phasmophobia. Я можу допомогти налаштувати ідеальну кастомну складність: збалансувати ризики та нагороди, створити хардкорний челендж або підібрати комфортні умови для новачків. Що вас цікавить?',
    },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        fetch(`/api/is-admin?email=${encodeURIComponent(currentUser.email)}`)
          .then(res => res.json())
          .then(data => setIsAdmin(data.isAdmin))
          .catch(err => console.error("Error checking admin status", err));
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const [editingGhost, setEditingGhost] = useState<Ghost | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchData = async () => {
    try {
      const resGhosts = await fetch("/api/ghosts");
      const ghostsData = await resGhosts.json();
      if (!Array.isArray(ghostsData)) throw new Error("Ghosts not an array - " + JSON.stringify(ghostsData));
      const mappedGhosts: Ghost[] = ghostsData.map((g: any) => ({
        name: g.name,
        hunt: g.huntThreshold,
        evidence: Array.isArray(g.evidences) ? g.evidences : (typeof g.evidences === 'string' ? g.evidences.split(",").map((s: string) => s.trim()) : g.evidence || []),
        desc: g.description || g.desc,
        strength: g.strength,
        weakness: g.weakness,
        test: g.testToVerify || g.test,
      }));
      setGhosts(mappedGhosts);

      const resEq = await fetch("/api/equipment");
      const eqData = await resEq.json();
      if (!Array.isArray(eqData)) throw new Error("Equipment not an array - " + JSON.stringify(eqData));
      const mappedEq: Equipment[] = eqData.map((eq: any) => {
        const imgName = eq.imageName || eq.image;
        return {
          name: eq.name,
          icon: eq.icon,
          image: imgName ? `/items/${imgName}` : '',
          desc: eq.description || eq.desc,
        };
      });
      setEquipmentList(mappedEq);
    } catch (err) {
      console.error("Failed to load data from DB", err);
      setGhosts([]);
      setEquipmentList([]);
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteGhost = (name: string) => {
    if (!user?.email || !isAdmin) return;
    setGhostToDelete(name);
  };

  const confirmDeleteGhost = async () => {
    if (!user?.email || !isAdmin || !ghostToDelete) return;
    try {
      const res = await fetch(`/api/ghosts/${encodeURIComponent(ghostToDelete)}?adminEmail=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(); // Оновлюємо список
        setGhostToDelete(null);
      } else {
        console.error('Помилка видалення');
        setGhostToDelete(null);
      }
    } catch (e) {
      console.error(e);
      setGhostToDelete(null);
    }
  };

  const switchTab = (tab: TabType, clearEdits: boolean = true) => {
    setActiveTab(tab);
    if (clearEdits) {
      setEditingGhost(null);
      setEditingEquipment(null);
    }
    setIsMenuOpen(false);
  };

  const handleEditGhost = (ghost: Ghost) => {
    setEditingGhost(ghost);
    setEditingEquipment(null);
    switchTab('admin', false);
  };

  const handleDeleteEquipment = (name: string) => {
    if (!user?.email || !isAdmin) return;
    setEquipmentToDelete(name);
  };

  const confirmDeleteEquipment = async () => {
    if (!user?.email || !isAdmin || !equipmentToDelete) return;
    try {
      const res = await fetch(`/api/equipment/${encodeURIComponent(equipmentToDelete)}?adminEmail=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
        setEquipmentToDelete(null);
      } else {
        console.error('Помилка видалення');
        setEquipmentToDelete(null);
      }
    } catch (e) {
      console.error(e);
      setEquipmentToDelete(null);
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setEditingGhost(null);
    switchTab('admin', false);
  };

  const handleLogin = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed' || error.message.includes('network')) {
        setAuthError('Не вдалося виконати вхід. Будь ласка, спробуйте відкрити додаток у новій вкладці (Open in new tab), або вимкніть блокувальники реклами.');
      } else {
        setAuthError(error.message || 'Сталася помилка під час входу.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      setAuthError(null);
      await logOut();
      setIsChatOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);


  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setIsMenuOpen(false);
  };

  const toggleEvidence = (evidence: string) => {
    if (selectedEvidences.includes(evidence)) {
      setSelectedEvidences(selectedEvidences.filter((e) => e !== evidence));
      setExcludedEvidences([...excludedEvidences, evidence]);
    } else if (excludedEvidences.includes(evidence)) {
      setExcludedEvidences(excludedEvidences.filter((e) => e !== evidence));
    } else {
      if (
        selectedEvidences.length < 3 ||
        (selectedEvidences.length === 3 && evidence === 'Примарний вогник')
      ) {
        setSelectedEvidences([...selectedEvidences, evidence]);
      }
    }
  };

  const resetFilter = () => {
    setSelectedEvidences([]);
    setExcludedEvidences([]);
  };

  const possibleGhosts = useMemo(() => {
    return ghosts.filter((ghost) => {
      const hasAllSelected = selectedEvidences.every((e) =>
        ghost.evidence.includes(e)
      );
      const hasNoExcluded = excludedEvidences.every(
        (e) => !ghost.evidence.includes(e)
      );
      return hasAllSelected && hasNoExcluded;
    });
  }, [selectedEvidences, excludedEvidences, ghosts]);

  const possibleEvidences = useMemo(() => {
    const evidences = new Set<string>();
    possibleGhosts.forEach((ghost) => {
      ghost.evidence.forEach((e) => evidences.add(e));
    });
    return evidences;
  }, [possibleGhosts]);

  return (
    <>
      <header>
        <div className="header-container">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ marginBottom: 0 }}>
              <span>👻</span> PhasmoWiki Ultimate
            </h1>
            <span className="author-text">
              Автори: Ковальчук Ростислав Ростиславович, Папірник Евеліна Романівна
            </span>
          </div>

          {/* Гамбургер-меню для мобільних */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Меню"
          >
            <Menu size={28} />
          </button>

          <nav id="main-nav" className={isMenuOpen ? 'open' : ''}>
            <div className="nav-capsule">
              <button
                className={`nav-btn flex-center-gap ${activeTab === 'identifier' ? 'active' : ''}`}
                onClick={() => switchTab('identifier')}
              >
                <Search size={18} />
                <span className="nav-text">Визначник</span>
              </button>
              <button
                className={`nav-btn flex-center-gap ${activeTab === 'ghosts' ? 'active' : ''}`}
                onClick={() => switchTab('ghosts')}
              >
                <GhostIcon size={18} />
                <span className="nav-text">Всі Привиди ({ghosts.length})</span>
              </button>
              <button
                className={`nav-btn flex-center-gap ${activeTab === 'equipment' ? 'active' : ''}`}
                onClick={() => switchTab('equipment')}
              >
                <Wrench size={18} />
                <span className="nav-text">Спорядження</span>
              </button>
              <button
                className={`nav-btn flex-center-gap ${activeTab === 'mechanics' ? 'active' : ''}`}
                onClick={() => switchTab('mechanics')}
              >
                <BookOpen size={18} />
                <span className="nav-text">Механіки</span>
              </button>
              <button
                className={`nav-btn flex-center-gap ${isChatOpen ? 'active' : ''}`}
                onClick={toggleChat}
              >
                <Sparkles size={18} style={{ color: isChatOpen ? '#000' : 'var(--accent-purple)' }} />
                <span className="nav-text">ШІ Асистент</span>
              </button>
              {isAdmin && (
                <button
                  className={`nav-btn flex-center-gap ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => switchTab('admin')}
                >
                  <Settings size={18} />
                  <span className="nav-text">Адмін</span>
                </button>
              )}
            </div>
            
            <div className="nav-capsule user-actions" style={{ marginLeft: 'auto' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 5px' }}>
                  <img 
                    src={user.photoURL || ''} 
                    alt="avatar" 
                    className="user-avatar"
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--card-border)' }} 
                  />
                  <button className="nav-btn p-small" onClick={handleLogout} aria-label="Вийти" title="Вийти">
                    <LogOut size={16} />
                    <span className="nav-text">Вийти</span>
                  </button>
                </div>
              ) : (
                <button 
                  className="nav-btn flex-center-gap" 
                  onClick={handleLogin} 
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-title)' }}
                >
                  <LogIn size={16} />
                  <span className="nav-text">Увійти</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {authError && (
        <div style={{
          backgroundColor: 'var(--state-excluded-bg)',
          color: 'var(--state-excluded-text)',
          padding: '12px 20px',
          textAlign: 'center',
          borderBottom: '1px solid var(--state-excluded-border)',
          fontWeight: 600,
        }}>
          {authError}
        </div>
      )}

      <main>
        {!isDataLoaded ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
            Завантаження даних бази...
          </div>
        ) : (
          <>
            {activeTab === 'identifier' && (
              <IdentifierTab
                selectedEvidences={selectedEvidences}
                excludedEvidences={excludedEvidences}
                toggleEvidence={toggleEvidence}
                resetFilter={resetFilter}
                possibleGhosts={possibleGhosts}
                possibleEvidences={possibleEvidences}
                isAdmin={isAdmin}
                onDelete={handleDeleteGhost}
                onEdit={handleEditGhost}
              />
            )}
            {activeTab === 'ghosts' && <GhostsTab ghosts={ghosts} isAdmin={isAdmin} onDelete={handleDeleteGhost} onEdit={handleEditGhost} />}
            {activeTab === 'equipment' && <EquipmentTab equipment={equipmentList} isAdmin={isAdmin} onDelete={handleDeleteEquipment} onEdit={handleEditEquipment} />}
            {activeTab === 'mechanics' && <MechanicsTab />}
            {activeTab === 'admin' && isAdmin && user?.email && <AdminTab userEmail={user.email} editingGhost={editingGhost} setEditingGhost={setEditingGhost} editingEquipment={editingEquipment} setEditingEquipment={setEditingEquipment} onRefresh={fetchData} />}
            
            {/* ШІ Асистент - Floating widget */}
            {isChatOpen && (
              <div className="ai-chat-widget">
                {user ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--card-border)', backgroundColor: 'transparent' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="var(--accent-purple)" /> ШІ Асистент
                      </h3>
                      <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}>✕</button>
                    </div>
                    <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                      <AIChatTab messages={chatMessages} setMessages={setChatMessages} isActive={isChatOpen} />
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' }}>
                    <button onClick={() => setIsChatOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}>✕</button>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--accent-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px'
                    }}>
                      <Sparkles size={32} />
                    </div>
                    <h3 style={{ margin: 0 }}>Потрібна авторизація</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                      ШІ Асистент доступний тільки для зареєстрованих користувачів.
                    </p>
                    <button 
                      className="nav-btn" 
                      onClick={handleLogin} 
                      style={{ backgroundColor: 'var(--accent-purple)', color: '#000', marginTop: '15px', width: '100%', justifyContent: 'center' }}
                    >
                      Увійти через Google
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {ghostToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', margin: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Підтвердження видалення</h3>
            <p>Ви дійсно хочете видалити привида <strong>{ghostToDelete}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setGhostToDelete(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--card-border)', color: 'var(--text-title)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Скасувати
              </button>
              <button 
                onClick={confirmDeleteGhost}
                style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {equipmentToDelete && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', margin: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Підтвердження видалення</h3>
            <p>Ви дійсно хочете видалити спорядження <strong>{equipmentToDelete}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setEquipmentToDelete(null)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--card-border)', color: 'var(--text-title)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Скасувати
              </button>
              <button 
                onClick={confirmDeleteEquipment}
                style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
