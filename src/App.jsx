import { useState, useCallback, useEffect } from 'react';
import { loadHistory, saveHistory, loadSettings, saveSettings, MAX_HISTORY } from './utils/storage';
import Home from './pages/Home';

export default function App() {
  const [activeTab, setActiveTab] = useState('rest');
  const [history, setHistory] = useState(loadHistory);
  const [settings, setSettings] = useState(loadSettings);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fillData, setFillData] = useState(null);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Add a new request to history
  const addToHistory = useCallback((item) => {
    setHistory((prev) => {
      const next = [item, ...prev].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  // Select a history item — switch tab and fill form
  const selectHistoryItem = useCallback((item) => {
    const tab = item.type === 'WS' ? 'ws' : 'rest';
    setActiveTab(tab);
    // Use a timestamp to ensure the effect re-triggers even if same item is selected
    setFillData({ ...item, _ts: Date.now() });
  }, []);

  return (
    <Home
      activeTab={activeTab}
      onTabChange={setActiveTab}
      history={history}
      onSelectItem={selectHistoryItem}
      onClearHistory={clearHistory}
      settings={settings}
      onSettingsChange={setSettings}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen((p) => !p)}
      onSidebarClose={() => setSidebarOpen(false)}
      onHistoryAdd={addToHistory}
      fillData={fillData}
    />
  );
}
