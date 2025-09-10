import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import { InvoiceStorage } from './utils/storage';
import { THEMES } from './config/languages';

function App() {
  const [settings, setSettings] = useState({
    language: 'en',
    currency: 'USD',
    theme: 'modern',
    shopName: '',
    shopAddress: ''
  });

  useEffect(() => {
    const savedSettings = InvoiceStorage.getSettings();
    setSettings(savedSettings);
  }, []);

  const theme = THEMES[settings.theme];

  return (
    <div className={`min-h-screen ${theme.colors.secondary}`}>
      <InvoiceForm />
    </div>
  );
}

export default App;
