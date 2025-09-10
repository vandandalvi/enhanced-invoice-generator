import React from 'react';
import { Trash2, DollarSign } from 'lucide-react';
import InvoiceField from './InvoiceField';

const InvoiceItem = ({ id, name, qty, price, onDeleteItem, onEdtiItem, theme, currency, translations }) => {
  const deleteItemHandler = () => {
    onDeleteItem(id);
  };

  return (
    <tr className={`${theme.colors.border} border-b`}>
      <td className="py-3 pr-4">
        <InvoiceField
          onEditItem={(event) => onEdtiItem(event)}
          cellData={{
            placeholder: translations.itemName,
            type: 'text',
            name: 'name',
            id: id,
            value: name,
            className: `w-full px-3 py-2 rounded border ${theme.colors.inputBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.colors.inputBackground} ${theme.colors.inputText}`
          }}
        />
      </td>
      <td className="py-3 pr-4 min-w-[80px]">
        <InvoiceField
          onEditItem={(event) => onEdtiItem(event)}
          cellData={{
            type: 'number',
            min: '1',
            name: 'qty',
            id: id,
            value: qty,
            className: `w-full px-3 py-2 rounded border ${theme.colors.inputBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.colors.inputBackground} ${theme.colors.inputText} text-center`
          }}
        />
      </td>
      <td className="py-3 pr-4 min-w-[120px]">
        <div className="relative">
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textSecondary}`}>
            {currency.symbol}
          </div>
          <InvoiceField
            onEditItem={(event) => onEdtiItem(event)}
            cellData={{
              className: `w-full pl-8 pr-3 py-2 rounded border ${theme.colors.inputBorder} focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.colors.inputBackground} ${theme.colors.inputText} text-right`,
              type: 'number',
              min: '0.01',
              step: '0.01',
              name: 'price',
              id: id,
              value: price,
            }}
          />
        </div>
      </td>
      <td className="py-3 text-center">
        <button
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
          onClick={deleteItemHandler}
          title={translations.delete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
};

export default InvoiceItem;
