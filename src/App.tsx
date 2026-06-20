import React, { useState, useMemo, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { GHOSTS } from './data';
import { IdentifierTab } from './components/IdentifierTab';
import { GhostsTab } from './components/GhostsTab';
import { EquipmentTab } from './components/EquipmentTab';
import { MechanicsTab } from './components/MechanicsTab';
import { AIChatTab } from './components/AIChatTab';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

type TabType = 'identifier' | 'ghosts' | 'equipment' | 'mechanics' | 'ai-chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('identifier');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [excludedEvidences, setExcludedEvidences] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
    return GHOSTS.filter((ghost) => {
      const hasAllSelected = selectedEvidences.every((e) =>
        ghost.evidence.includes(e)
      );
      const hasNoExcluded = excludedEvidences.every(
        (e) => !ghost.evidence.includes(e)
      );
      return hasAllSelected && hasNoExcluded;
    });
  }, [selectedEvidences, excludedEvidences]);

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
          <h1>
            <span>👻</span> PhasmoWiki Ultimate
          </h1>

          {/* Гамбургер-меню для мобільних */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Меню"
          >
            <Menu size={28} />
          </button>

          <nav id="main-nav" className={isMenuOpen ? 'open' : ''}>
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
              Усі Привиди (27)
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
            
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        {activeTab === 'identifier' && (
          <IdentifierTab
            selectedEvidences={selectedEvidences}
            excludedEvidences={excludedEvidences}
            toggleEvidence={toggleEvidence}
            resetFilter={resetFilter}
            possibleGhosts={possibleGhosts}
            possibleEvidences={possibleEvidences}
          />
        )}
        {activeTab === 'ghosts' && <GhostsTab />}
        {activeTab === 'equipment' && <EquipmentTab />}
        {activeTab === 'mechanics' && <MechanicsTab />}
        {activeTab === 'ai-chat' && <AIChatTab />}
      </main>
    </>
  );
}
