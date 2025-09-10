import React, { useState, useEffect } from 'react';
import { uid } from 'uid';
import { Settings, BarChart3, Plus, Trash2 } from 'lucide-react';
import InvoiceItem from './InvoiceItem';
import InvoiceModal from './InvoiceModal';
import SettingsPanel from './SettingsPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import incrementString from '../helpers/incrementString';
import { LANGUAGES, CURRENCIES, THEMES } from '../config/languages';
import { InvoiceStorage } from '../utils/storage';

const InvoiceForm = () => {
  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [cashierName, setCashierName] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  // App settings
  const [settings, setSettings] = useState({
    language: 'en',
    currency: 'USD',
    theme: 'modern',
    shopName: '',
    shopAddress: ''
  });

  const [items, setItems] = useState([
    {
      id: uid(6),
      name: '',
      qty: 1,
      price: '1.00',
    },
  ]);

  // Load settings and customer suggestions on mount
  useEffect(() => {
    const savedSettings = InvoiceStorage.getSettings();
    setSettings(savedSettings);
    
    // Set shop info if available
    if (savedSettings.shopName && !cashierName) {
      setCashierName(savedSettings.shopName);
    }
  }, []);

  // Get current language and theme
  const currentLanguage = LANGUAGES[settings.language];
  const t = currentLanguage.translations;
  const isRTL = currentLanguage.rtl;
  const currency = CURRENCIES[settings.currency];
  const theme = THEMES[settings.theme];

  // Format date according to language
  const formatDate = () => {
    const date = new Date();
    if (settings.language === 'ar') {
      return date.toLocaleDateString('ar-EG');
    } else if (settings.language === 'zh') {
      return date.toLocaleDateString('zh-CN');
    } else if (settings.language === 'fr') {
      return date.toLocaleDateString('fr-FR');
    } else if (settings.language === 'es') {
      return date.toLocaleDateString('es-ES');
    }
    return date.toLocaleDateString('en-GB', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const reviewInvoiceHandler = (event) => {
    event.preventDefault();
    setIsOpen(true);
  };

  const addNextInvoiceHandler = () => {
    // Save the current invoice data
    const invoiceData = {
      invoiceNumber,
      cashierName,
      customerName,
      items: items.filter(item => item.name.trim().length > 0),
      subtotal,
      taxRate,
      discountRate,
      total,
      currency: settings.currency,
      date: new Date().toISOString()
    };

    // Save to localStorage for analytics
    InvoiceStorage.saveInvoice(invoiceData);
    
    // Save customer info
    if (customerName.trim()) {
      InvoiceStorage.saveCustomer({ name: customerName.trim() });
    }

    // Reset form
    setInvoiceNumber((prevNumber) => incrementString(prevNumber));
    setCustomerName('');
    setDiscount('');
    setTax('');
    setItems([
      {
        id: uid(6),
        name: '',
        qty: 1,
        price: '1.00',
      },
    ]);
  };

  const addItemHandler = () => {
    const id = uid(6);
    setItems((prevItem) => [
      ...prevItem,
      {
        id: id,
        name: '',
        qty: 1,
        price: '1.00',
      },
    ]);
  };

  const deleteItemHandler = (id) => {
    setItems((prevItem) => prevItem.filter((item) => item.id !== id));
  };

  const edtiItemHandler = (event) => {
    const editedItem = {
      id: event.target.id,
      name: event.target.name,
      value: event.target.value,
    };

    const newItems = items.map((items) => {
      for (const key in items) {
        if (key === editedItem.name && items.id === editedItem.id) {
          items[key] = editedItem.value;
        }
      }
      return items;
    });

    setItems(newItems);
  };

  // Get customer suggestions
  const getCustomerSuggestions = () => {
    const customers = InvoiceStorage.getAllCustomers();
    return customers
      .filter(customer => 
        customer.name.toLowerCase().includes(customerName.toLowerCase())
      )
      .slice(0, 5);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const subtotal = items.reduce((prev, curr) => {
    if (curr.name.trim().length > 0)
      return prev + Number(curr.price * Math.floor(curr.qty));
    else return prev;
  }, 0);
  const taxRate = (tax * subtotal) / 100;
  const discountRate = (discount * subtotal) / 100;
  const total = subtotal - discountRate + taxRate;

  const formatCurrency = (amount) => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  const customerSuggestions = getCustomerSuggestions();

  return (
    <div className={`min-h-screen ${theme.colors.secondary}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with controls */}
      <div className={`${theme.colors.background} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${theme.colors.text}`}>
                {settings.shopName || t.invoice}
              </h1>
              {settings.shopAddress && (
                <p className={`text-sm ${theme.colors.textSecondary}`}>
                  {settings.shopAddress}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAnalyticsOpen(true)}
                className={`flex items-center space-x-2 px-4 py-2 ${theme.colors.accent} ${theme.colors.text} rounded-lg hover:opacity-80 transition-opacity`}
                type="button"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{t.analytics}</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center space-x-2 px-4 py-2 ${theme.colors.accent} ${theme.colors.text} rounded-lg hover:opacity-80 transition-opacity`}
                type="button"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t.settings}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <form
        className="relative flex flex-col px-2 md:flex-row max-w-7xl mx-auto"
        onSubmit={reviewInvoiceHandler}
      >
        <div className={`my-6 flex-1 space-y-2 rounded-md ${theme.colors.background} p-4 shadow-sm sm:space-y-4 md:p-6`}>
          <div className="flex flex-col justify-between space-y-2 border-b border-gray-900/10 pb-4 md:flex-row md:items-center md:space-y-0">
            <div className="flex space-x-2">
              <span className={`font-bold ${theme.colors.text}`}>{t.currentDate}: </span>
              <span className={theme.colors.textSecondary}>{formatDate()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <label className={`font-bold ${theme.colors.text}`} htmlFor="invoiceNumber">
                {t.invoiceNumber}:
              </label>
              <input
                required
                className={`max-w-[130px] px-3 py-1 rounded border ${theme.colors.inputBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.colors.inputBackground} ${theme.colors.inputText}`}
                type="number"
                name="invoiceNumber"
                id="invoiceNumber"
                min="1"
                step="1"
                value={invoiceNumber}
                onChange={(event) => setInvoiceNumber(event.target.value)}
              />
            </div>
          </div>
          
          <h1 className={`text-center text-xl font-bold ${theme.colors.text} py-4`}>
            {t.invoice.toUpperCase()}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-8">
            <div className="space-y-2">
              <label
                htmlFor="cashierName"
                className={`block text-sm font-bold ${theme.colors.text}`}
              >
                {t.cashierName}:
              </label>
              <input
                required
                className={`w-full px-3 py-2 rounded border ${theme.colors.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder={t.cashierName}
                type="text"
                name="cashierName"
                id="cashierName"
                value={cashierName}
                onChange={(event) => setCashierName(event.target.value)}
              />
            </div>
            
            <div className="space-y-2 relative">
              <label
                htmlFor="customerName"
                className={`block text-sm font-bold ${theme.colors.text}`}
              >
                {t.customerName}:
              </label>
              <input
                required
                className={`w-full px-3 py-2 rounded border ${theme.colors.border} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder={t.customerName}
                type="text"
                name="customerName"
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
              
              {/* Customer suggestions dropdown */}
              {customerName && customerSuggestions.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 ${theme.colors.background} border ${theme.colors.border} rounded-md shadow-lg`}>
                  {customerSuggestions.map((customer, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:${theme.colors.accent} ${theme.colors.text}`}
                      onClick={() => setCustomerName(customer.name)}
                    >
                      {customer.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${theme.colors.border} text-sm md:text-base`}>
                  <th className={`py-3 font-bold ${theme.colors.text}`}>{t.itemName}</th>
                  <th className={`py-3 font-bold ${theme.colors.text}`}>{t.quantity}</th>
                  <th className={`py-3 text-center font-bold ${theme.colors.text}`}>{t.price}</th>
                  <th className={`py-3 text-center font-bold ${theme.colors.text}`}>{t.action}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <InvoiceItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    qty={item.qty}
                    price={item.price}
                    onDeleteItem={deleteItemHandler}
                    onEdtiItem={edtiItemHandler}
                    theme={theme}
                    currency={currency}
                    translations={t}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            className={`flex items-center space-x-2 rounded-md ${theme.colors.primary} ${theme.colors.primaryHover} px-4 py-2 text-sm text-white shadow-sm transition-colors`}
            type="button"
            onClick={addItemHandler}
          >
            <Plus className="h-4 w-4" />
            <span>{t.addItem}</span>
          </button>
          
          <div className="flex flex-col items-end space-y-2 pt-6">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between">
                <span className={`font-bold ${theme.colors.text}`}>{t.subtotal}:</span>
                <span className={theme.colors.text}>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className={`font-bold ${theme.colors.text}`}>{t.discount}:</span>
                <span className={theme.colors.text}>
                  ({discount || '0'}%) {formatCurrency(discountRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`font-bold ${theme.colors.text}`}>{t.tax}:</span>
                <span className={theme.colors.text}>
                  ({tax || '0'}%) {formatCurrency(taxRate)}
                </span>
              </div>
              <div className={`flex justify-between border-t ${theme.colors.border} pt-2`}>
                <span className={`font-bold text-lg ${theme.colors.text}`}>{t.total}:</span>
                <span className={`font-bold text-lg ${theme.colors.text}`}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="basis-1/4 bg-transparent">
          <div className="sticky top-0 z-10 space-y-4 divide-y divide-gray-900/10 pb-8 md:pt-6 md:pl-4">
            <button
              className={`w-full rounded-md ${theme.colors.primary} ${theme.colors.primaryHover} py-3 text-sm text-white shadow-sm transition-colors font-medium`}
              type="submit"
            >
              {t.reviewInvoice}
            </button>
            
            <InvoiceModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              invoiceInfo={{
                invoiceNumber,
                cashierName,
                customerName,
                subtotal,
                taxRate,
                discountRate,
                total,
              }}
              items={items}
              onAddNextInvoice={addNextInvoiceHandler}
              currency={currency}
              theme={theme}
              translations={t}
              settings={settings}
            />
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className={`text-sm font-bold md:text-base ${theme.colors.text}`} htmlFor="tax">
                  {t.tax}:
                </label>
                <div className="flex items-center">
                  <input
                    className={`w-full rounded-r-none ${theme.colors.background} shadow-sm border ${theme.colors.border} px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    type="number"
                    name="tax"
                    id="tax"
                    min="0.01"
                    step="0.01"
                    placeholder="0.0"
                    value={tax}
                    onChange={(event) => setTax(event.target.value)}
                  />
                  <span className={`rounded-r-md ${theme.colors.accent} py-2 px-4 ${theme.colors.textSecondary} shadow-sm border ${theme.colors.border} border-l-0`}>
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  className={`text-sm font-bold md:text-base ${theme.colors.text}`}
                  htmlFor="discount"
                >
                  {t.discount}:
                </label>
                <div className="flex items-center">
                  <input
                    className={`w-full rounded-r-none ${theme.colors.background} shadow-sm border ${theme.colors.border} px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    type="number"
                    name="discount"
                    id="discount"
                    min="0"
                    step="0.01"
                    placeholder="0.0"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                  />
                  <span className={`rounded-r-md ${theme.colors.accent} py-2 px-4 ${theme.colors.textSecondary} shadow-sm border ${theme.colors.border} border-l-0`}>
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        language={settings.language}
        currency={settings.currency}
        theme={settings.theme}
      />
    </div>
  );
};

export default InvoiceForm;
