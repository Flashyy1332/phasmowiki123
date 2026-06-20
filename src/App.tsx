import React, { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { GHOSTS } from './data';
import { IdentifierTab } from './components/IdentifierTab';
import { GhostsTab } from './components/GhostsTab';
import { EquipmentTab } from './components/EquipmentTab';
import { MechanicsTab } from './components/MechanicsTab';

type TabType = 'identifier' | 'ghosts' | 'equipment' | 'mechanics';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('identifier');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([]);
  const [excludedEvidences, setExcludedEvidences] = useState<string[]>([]);

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
          </nav>
        </div>
      </header>

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
      </main>
    </>
  );
}
