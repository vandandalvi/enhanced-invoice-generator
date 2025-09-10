import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileText, Users, Calendar, X } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { InvoiceStorage } from '../utils/storage';
import { CURRENCIES, THEMES } from '../config/languages';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AnalyticsDashboard = ({ isOpen, onClose, language, currency, theme }) => {
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [yearlyAnalytics, setYearlyAnalytics] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = () => {
    const now = new Date();
    const currentMonthData = InvoiceStorage.getCurrentMonthAnalytics();
    const currentYearData = InvoiceStorage.getCurrentYearAnalytics();
    const monthlyData = InvoiceStorage.getMonthlyAnalytics(now.getFullYear(), now.getMonth() + 1);
    const yearlyData = InvoiceStorage.getYearlyAnalytics(now.getFullYear());

    setCurrentMonth(currentMonthData);
    setCurrentYear(currentYearData);
    setMonthlyAnalytics(monthlyData);
    setYearlyAnalytics(yearlyData);
  };

  if (!isOpen || !monthlyAnalytics || !yearlyAnalytics) {
    return null;
  }

  const currencySymbol = CURRENCIES[currency]?.symbol || '$';
  const themeColors = THEMES[theme].colors;

  const formatCurrency = (amount) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const monthlyChartData = {
    labels: monthlyAnalytics.dailyBreakdown.map(day => format(new Date(day.date), 'MMM dd')),
    datasets: [
      {
        label: 'Daily Revenue',
        data: monthlyAnalytics.dailyBreakdown.map(day => day.total),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const yearlyChartData = {
    labels: yearlyAnalytics.monthlyBreakdown.map(month => format(new Date(month.month + '-01'), 'MMM')),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: yearlyAnalytics.monthlyBreakdown.map(month => month.total),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeTab === 'monthly' ? 'Daily Revenue This Month' : 'Monthly Revenue This Year',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
        
        <div className={`relative w-full max-w-6xl rounded-lg ${themeColors.background} p-6 shadow-xl max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <h2 className={`text-xl font-semibold ${themeColors.text}`}>
                Analytics Dashboard
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${themeColors.secondary} hover:bg-gray-200`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${themeColors.accent}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${themeColors.textSecondary}`}>This Month</p>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>
                    {formatCurrency(currentMonth?.totalEarnings || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${themeColors.accent}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${themeColors.textSecondary}`}>Invoices This Month</p>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>
                    {currentMonth?.totalInvoices || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${themeColors.accent}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${themeColors.textSecondary}`}>Average Invoice</p>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>
                    {formatCurrency(currentMonth?.averageInvoice || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${themeColors.accent}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${themeColors.textSecondary}`}>This Year</p>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>
                    {formatCurrency(currentYear?.totalEarnings || 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'monthly'
                  ? `${themeColors.primary} text-white`
                  : `${themeColors.secondary} ${themeColors.text}`
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'yearly'
                  ? `${themeColors.primary} text-white`
                  : `${themeColors.secondary} ${themeColors.text}`
              }`}
            >
              Yearly View
            </button>
          </div>

          {/* Charts */}
          <div className="mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              {activeTab === 'monthly' ? (
                <Bar data={monthlyChartData} options={chartOptions} />
              ) : (
                <Line data={yearlyChartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <div className={`p-4 rounded-lg ${themeColors.secondary}`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeColors.text}`}>
                Top Customers
              </h3>
              <div className="space-y-3">
                {(activeTab === 'monthly' ? monthlyAnalytics.topCustomers : yearlyAnalytics.topCustomers)
                  .slice(0, 5)
                  .map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className={`font-medium ${themeColors.text}`}>
                        {customer.name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${themeColors.text}`}>
                        {formatCurrency(customer.total)}
                      </div>
                      <div className={`text-sm ${themeColors.textSecondary}`}>
                        {customer.count} invoices
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Items (Yearly only) */}
            {activeTab === 'yearly' && (
              <div className={`p-4 rounded-lg ${themeColors.secondary}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeColors.text}`}>
                  Top Selling Items
                </h3>
                <div className="space-y-3">
                  {yearlyAnalytics.topItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${themeColors.text}`}>
                          {item.name}
                        </div>
                        <div className={`text-sm ${themeColors.textSecondary}`}>
                          Qty: {item.totalQty}
                        </div>
                      </div>
                      <div className={`font-semibold ${themeColors.text}`}>
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly breakdown for current month */}
            {activeTab === 'monthly' && (
              <div className={`p-4 rounded-lg ${themeColors.secondary}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeColors.text}`}>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {monthlyAnalytics.dailyBreakdown
                    .slice(-7)
                    .map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className={`font-medium ${themeColors.text}`}>
                        {format(new Date(day.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${themeColors.text}`}>
                          {formatCurrency(day.total)}
                        </div>
                        <div className={`text-sm ${themeColors.textSecondary}`}>
                          {day.count} invoices
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    const data = InvoiceStorage.exportData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `invoice-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
                    a.click();
                  }}
                  className={`px-4 py-2 ${themeColors.secondary} ${themeColors.text} rounded-lg hover:bg-gray-200 transition-colors`}
                >
                  Export Data
                </button>
                <button
                  onClick={onClose}
                  className={`px-6 py-2 ${themeColors.primary} ${themeColors.primaryHover} text-white rounded-lg transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
