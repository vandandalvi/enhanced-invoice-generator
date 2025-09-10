// Local Storage Utilities for Shop Analytics
import { format, startOfMonth, startOfYear, endOfMonth, endOfYear } from 'date-fns';

export class InvoiceStorage {
  static KEYS = {
    INVOICES: 'invoices_data',
    SETTINGS: 'app_settings',
    CUSTOMERS: 'customers_data',
    ANALYTICS: 'analytics_data'
  };

  // Save invoice to localStorage
  static saveInvoice(invoiceData) {
    try {
      const invoices = this.getAllInvoices();
      const newInvoice = {
        ...invoiceData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        month: format(new Date(), 'yyyy-MM'),
        year: format(new Date(), 'yyyy')
      };
      
      invoices.push(newInvoice);
      localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(invoices));
      
      // Update analytics
      this.updateAnalytics(newInvoice);
      
      return newInvoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return null;
    }
  }

  // Get all invoices
  static getAllInvoices() {
    try {
      const data = localStorage.getItem(this.KEYS.INVOICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  }

  // Get invoices by date range
  static getInvoicesByDateRange(startDate, endDate) {
    const invoices = this.getAllInvoices();
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  // Get monthly analytics
  static getMonthlyAnalytics(year, month) {
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const invoices = this.getAllInvoices().filter(inv => inv.month === monthKey);
    
    return {
      totalInvoices: invoices.length,
      totalEarnings: invoices.reduce((sum, inv) => sum + inv.total, 0),
      averageInvoice: invoices.length ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
      topCustomers: this.getTopCustomers(invoices),
      dailyBreakdown: this.getDailyBreakdown(invoices)
    };
  }

  // Get yearly analytics
  static getYearlyAnalytics(year) {
    const invoices = this.getAllInvoices().filter(inv => inv.year === year.toString());
    
    return {
      totalInvoices: invoices.length,
      totalEarnings: invoices.reduce((sum, inv) => sum + inv.total, 0),
      averageInvoice: invoices.length ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
      monthlyBreakdown: this.getMonthlyBreakdown(invoices),
      topCustomers: this.getTopCustomers(invoices),
      topItems: this.getTopItems(invoices)
    };
  }

  // Get current month analytics
  static getCurrentMonthAnalytics() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const invoices = this.getInvoicesByDateRange(startOfCurrentMonth, endOfCurrentMonth);
    
    return {
      totalInvoices: invoices.length,
      totalEarnings: invoices.reduce((sum, inv) => sum + inv.total, 0),
      averageInvoice: invoices.length ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
      growth: this.calculateGrowth(invoices, 'month')
    };
  }

  // Get current year analytics
  static getCurrentYearAnalytics() {
    const now = new Date();
    const startOfCurrentYear = startOfYear(now);
    const endOfCurrentYear = endOfYear(now);
    const invoices = this.getInvoicesByDateRange(startOfCurrentYear, endOfCurrentYear);
    
    return {
      totalInvoices: invoices.length,
      totalEarnings: invoices.reduce((sum, inv) => sum + inv.total, 0),
      averageInvoice: invoices.length ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
      growth: this.calculateGrowth(invoices, 'year'),
      monthlyTrend: this.getMonthlyTrend(invoices)
    };
  }

  // Save app settings
  static saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Get app settings
  static getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        language: 'en',
        currency: 'USD',
        theme: 'modern',
        shopName: '',
        shopAddress: ''
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        language: 'en',
        currency: 'USD',
        theme: 'modern',
        shopName: '',
        shopAddress: ''
      };
    }
  }

  // Customer management
  static saveCustomer(customerData) {
    try {
      const customers = this.getAllCustomers();
      const existingIndex = customers.findIndex(c => c.name.toLowerCase() === customerData.name.toLowerCase());
      
      if (existingIndex >= 0) {
        customers[existingIndex] = { ...customers[existingIndex], ...customerData };
      } else {
        customers.push({
          ...customerData,
          id: this.generateId(),
          createdAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  }

  static getAllCustomers() {
    try {
      const data = localStorage.getItem(this.KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  // Helper methods
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static updateAnalytics(invoice) {
    // This could be expanded for more complex analytics
    const analytics = this.getAnalyticsData();
    analytics.lastUpdated = new Date().toISOString();
    analytics.totalInvoicesGenerated = (analytics.totalInvoicesGenerated || 0) + 1;
    analytics.totalRevenue = (analytics.totalRevenue || 0) + invoice.total;
    
    localStorage.setItem(this.KEYS.ANALYTICS, JSON.stringify(analytics));
  }

  static getAnalyticsData() {
    try {
      const data = localStorage.getItem(this.KEYS.ANALYTICS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {};
    }
  }

  static getTopCustomers(invoices) {
    const customerStats = {};
    invoices.forEach(invoice => {
      if (invoice.customerName) {
        if (!customerStats[invoice.customerName]) {
          customerStats[invoice.customerName] = { count: 0, total: 0 };
        }
        customerStats[invoice.customerName].count++;
        customerStats[invoice.customerName].total += invoice.total;
      }
    });

    return Object.entries(customerStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  static getTopItems(invoices) {
    const itemStats = {};
    invoices.forEach(invoice => {
      invoice.items?.forEach(item => {
        if (item.name) {
          if (!itemStats[item.name]) {
            itemStats[item.name] = { count: 0, totalQty: 0, revenue: 0 };
          }
          itemStats[item.name].count++;
          itemStats[item.name].totalQty += parseInt(item.qty) || 0;
          itemStats[item.name].revenue += (parseFloat(item.price) || 0) * (parseInt(item.qty) || 0);
        }
      });
    });

    return Object.entries(itemStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  static getDailyBreakdown(invoices) {
    const dailyStats = {};
    invoices.forEach(invoice => {
      const day = format(new Date(invoice.createdAt), 'yyyy-MM-dd');
      if (!dailyStats[day]) {
        dailyStats[day] = { count: 0, total: 0 };
      }
      dailyStats[day].count++;
      dailyStats[day].total += invoice.total;
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static getMonthlyBreakdown(invoices) {
    const monthlyStats = {};
    invoices.forEach(invoice => {
      const month = format(new Date(invoice.createdAt), 'yyyy-MM');
      if (!monthlyStats[month]) {
        monthlyStats[month] = { count: 0, total: 0 };
      }
      monthlyStats[month].count++;
      monthlyStats[month].total += invoice.total;
    });

    return Object.entries(monthlyStats)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  static getMonthlyTrend(invoices) {
    const monthlyBreakdown = this.getMonthlyBreakdown(invoices);
    return monthlyBreakdown.map((month, index) => {
      const previousMonth = monthlyBreakdown[index - 1];
      const growth = previousMonth ? 
        ((month.total - previousMonth.total) / previousMonth.total * 100) : 0;
      
      return {
        ...month,
        growth: Math.round(growth * 100) / 100
      };
    });
  }

  static calculateGrowth(currentPeriodInvoices, period) {
    // This is a simplified growth calculation
    // In a real app, you'd compare with the previous period
    const total = currentPeriodInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const count = currentPeriodInvoices.length;
    
    return {
      revenueGrowth: 0, // Would calculate vs previous period
      invoiceGrowth: 0,  // Would calculate vs previous period
      averageGrowth: 0   // Would calculate vs previous period
    };
  }

  // Export data for backup
  static exportData() {
    return {
      invoices: this.getAllInvoices(),
      customers: this.getAllCustomers(),
      settings: this.getSettings(),
      analytics: this.getAnalyticsData(),
      exportDate: new Date().toISOString()
    };
  }

  // Import data from backup
  static importData(data) {
    try {
      if (data.invoices) localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(data.invoices));
      if (data.customers) localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.settings) localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.analytics) localStorage.setItem(this.KEYS.ANALYTICS, JSON.stringify(data.analytics));
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  static clearAllData() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
