import { Globe, Cable, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RestClient from '../components/RestClient';
import WebSocketClient from '../components/WebSocketClient';

const TABS = [
  { key: 'rest', label: 'REST Client', icon: <Globe size={15} /> },
  { key: 'ws', label: 'WebSocket', icon: <Cable size={15} /> },
];

export default function Home({
  activeTab,
  onTabChange,
  history,
  onSelectItem,
  onClearHistory,
  settings,
  onSettingsChange,
  sidebarOpen,
  onSidebarToggle,
  onSidebarClose,
  onHistoryAdd,
  fillData,
}) {
  return (
    <div className="flex h-screen w-screen bg-surface-base overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar
        history={history}
        onSelectItem={onSelectItem}
        onClear={onClearHistory}
        settings={settings}
        onSettingsChange={onSettingsChange}
        isOpen={sidebarOpen}
        onClose={onSidebarClose}
      />

      {/* ── Main Workspace ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar with hamburger + tabs */}
        <div className="flex items-stretch border-b border-line bg-surface-sidebar">
          {/* Hamburger — mobile / tablet */}
          <button
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
            className="
              flex items-center justify-center w-12 border-r border-line
              text-txt-2 hover:text-txt hover:bg-surface-card cursor-pointer
              transition-colors lg:hidden
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent
            "
          >
            <Menu size={20} />
          </button>

          {/* Tab Bar */}
          <nav
            className="flex gap-0 px-2 sm:px-4 overflow-x-auto"
            role="tablist"
            aria-label="Main navigation tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`main-panel-${tab.key}`}
                className={`
                  relative flex items-center gap-2 px-4 sm:px-6 py-3.5
                  bg-transparent border-none cursor-pointer text-sm
                  whitespace-nowrap transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent
                  ${activeTab === tab.key
                    ? 'text-txt font-semibold'
                    : 'text-txt-3 font-normal hover:text-txt-2'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.key === 'rest' ? 'REST' : 'WS'}</span>
                {activeTab === tab.key && (
                  <div
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))',
                    }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Tab Content */}
        <div
          className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden"
          id={`main-panel-${activeTab}`}
          role="tabpanel"
        >
          {activeTab === 'rest' && (
            <RestClient
              settings={settings}
              onHistoryAdd={onHistoryAdd}
              fillData={fillData}
            />
          )}
          {activeTab === 'ws' && (
            <WebSocketClient
              onHistoryAdd={onHistoryAdd}
              fillData={fillData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
