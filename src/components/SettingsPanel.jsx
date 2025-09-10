import React, { useState, useEffect } from 'react';
import { Settings, Globe, DollarSign, Palette, X, BarChart3 } from 'lucide-react';
import { LANGUAGES, CURRENCIES, THEMES } from '../config/languages';
import { InvoiceStorage } from '../utils/storage';

const SettingsPanel = ({ isOpen, onClose, currentSettings, onSettingsChange }) => {
  const [settings, setSettings] = useState(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    InvoiceStorage.saveSettings(newSettings);
    onSettingsChange(newSettings);
  };

  if (!isOpen) return null;

  const currentLanguage = LANGUAGES[settings.language];
  const t = currentLanguage.translations;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
        
        <div className={`relative w-full max-w-2xl rounded-lg ${THEMES[settings.theme].colors.background} p-6 shadow-xl`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <h2 className={`text-xl font-semibold ${THEMES[settings.theme].colors.text}`}>
                {t.settings}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${THEMES[settings.theme].colors.secondary} hover:bg-gray-200`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className={`flex items-center space-x-2 text-sm font-medium mb-3 ${THEMES[settings.theme].colors.text}`}>
                <Globe className="h-4 w-4" />
                <span>{t.language}</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSettingChange('language', lang.code)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      settings.language === lang.code
                        ? `${THEMES[settings.theme].colors.primary} text-white border-transparent`
                        : `${THEMES[settings.theme].colors.secondary} ${THEMES[settings.theme].colors.text} ${THEMES[settings.theme].colors.border}`
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <label className={`flex items-center space-x-2 text-sm font-medium mb-3 ${THEMES[settings.theme].colors.text}`}>
                <DollarSign className="h-4 w-4" />
                <span>{t.currency}</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(CURRENCIES).map(([code, currency]) => (
                  <button
                    key={code}
                    onClick={() => handleSettingChange('currency', code)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      settings.currency === code
                        ? `${THEMES[settings.theme].colors.primary} text-white border-transparent`
                        : `${THEMES[settings.theme].colors.secondary} ${THEMES[settings.theme].colors.text} ${THEMES[settings.theme].colors.border}`
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold">{currency.symbol}</span>
                        <span className="text-sm font-medium">{code}</span>
                      </div>
                      <div className="text-xs opacity-75">{currency.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className={`flex items-center space-x-2 text-sm font-medium mb-3 ${THEMES[settings.theme].colors.text}`}>
                <Palette className="h-4 w-4" />
                <span>{t.theme}</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(THEMES).map(([themeKey, theme]) => (
                  <button
                    key={themeKey}
                    onClick={() => handleSettingChange('theme', themeKey)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      settings.theme === themeKey
                        ? `border-blue-500 bg-blue-50`
                        : `border-gray-200 hover:border-gray-300`
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        <div className={`w-3 h-3 rounded ${theme.colors.primary}`}></div>
                        <div className={`w-3 h-3 rounded ${theme.colors.secondary}`}></div>
                        <div className={`w-3 h-3 rounded ${theme.colors.accent}`}></div>
                      </div>
                      <div className="text-sm font-medium capitalize">
                        {t[themeKey] || themeKey}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${THEMES[settings.theme].colors.text}`}>
                Shop Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${THEMES[settings.theme].colors.textSecondary}`}>
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={settings.shopName || ''}
                    onChange={(e) => handleSettingChange('shopName', e.target.value)}
                    className={`w-full p-3 rounded-lg border ${THEMES[settings.theme].colors.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your shop name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${THEMES[settings.theme].colors.textSecondary}`}>
                    Shop Address
                  </label>
                  <input
                    type="text"
                    value={settings.shopAddress || ''}
                    onChange={(e) => handleSettingChange('shopAddress', e.target.value)}
                    className={`w-full p-3 rounded-lg border ${THEMES[settings.theme].colors.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your shop address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Settings are automatically saved
              </div>
              <button
                onClick={onClose}
                className={`px-6 py-2 ${THEMES[settings.theme].colors.primary} ${THEMES[settings.theme].colors.primaryHover} text-white rounded-lg transition-colors`}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
