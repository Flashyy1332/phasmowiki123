import React, { useState, useMemo, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
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

type TabType = 'identifier' | 'ghosts' | 'equipment' | 'mechanics' | 'ai-chat' | 'admin';

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
      const mappedEq: Equipment[] = eqData.map((eq: any) => ({
        name: eq.name,
        icon: eq.icon,
        image: eq.imageName || eq.image,
        desc: eq.description || eq.desc,
      }));
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

  const handleEditGhost = (ghost: Ghost) => {
    setEditingGhost(ghost);
    switchTab('admin');
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
    switchTab('admin');
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
      if (activeTab === 'ai-chat') {
        setActiveTab('identifier');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.6, paddingLeft: '45px', marginTop: '-4px' }}>
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
                className={`nav-btn ${activeTab === 'identifier' ? 'active' : ''}`}
                onClick={() => switchTab('identifier')}
              >
                Визначник
              </button>
              <button
                className={`nav-btn ${activeTab === 'ghosts' ? 'active' : ''}`}
                onClick={() => switchTab('ghosts')}
              >
                Усі Привиди ({ghosts.length})
              </button>
              <button
                className={`nav-btn ${activeTab === 'equipment' ? 'active' : ''}`}
                onClick={() => switchTab('equipment')}
              >
                Спорядження
              </button>
              <button
                className={`nav-btn ${activeTab === 'mechanics' ? 'active' : ''}`}
                onClick={() => switchTab('mechanics')}
              >
                Механіки
              </button>
              <button
                className={`nav-btn ${activeTab === 'ai-chat' ? 'active' : ''}`}
                onClick={() => switchTab('ai-chat')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={16} style={{ color: activeTab === 'ai-chat' ? '#000' : 'var(--accent-purple)' }} />
                ШІ Асистент
              </button>
              {isAdmin && (
                <button
                  className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => switchTab('admin')}
                >
                  Адмін-панель
                </button>
              )}
            </div>
            
            <div className="nav-capsule" style={{ marginLeft: 'auto' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 5px' }}>
                  <img 
                    src={user.photoURL || ''} 
                    alt="avatar" 
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--card-border)' }} 
                  />
                  <button className="nav-btn" onClick={handleLogout}>
                    Вийти
                  </button>
                </div>
              ) : (
                <button 
                  className="nav-btn" 
                  onClick={handleLogin} 
                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-title)' }}
                >
                  Увійти
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
            <div style={{ display: activeTab === 'ai-chat' ? 'block' : 'none', height: '100%' }}>
              {user ? (
                <AIChatTab messages={chatMessages} setMessages={setChatMessages} isActive={activeTab === 'ai-chat'} />
              ) : (
                <section className="tab-content active" style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
                  <div className="card" style={{ textAlign: 'center', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
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
                    <h2 style={{ marginBottom: 0, justifyContent: 'center' }}>Потрібна авторизація</h2>
                    <p style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>
                      ШІ Асистент доступний тільки для зареєстрованих користувачів. Будь ласка, увійдіть за допомогою свого Google акаунта.
                    </p>
                    <button 
                      className="nav-btn" 
                      onClick={handleLogin} 
                      style={{ backgroundColor: 'var(--accent-purple)', color: '#000', marginTop: '10px', fontSize: '1rem', padding: '12px 24px' }}
                    >
                      Увійти через Google
                    </button>
                  </div>
                </section>
              )}
            </div>
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
