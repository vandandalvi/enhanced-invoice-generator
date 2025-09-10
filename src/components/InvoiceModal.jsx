import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Printer, Plus, X } from 'lucide-react';

const InvoiceModal = ({
  isOpen,
  setIsOpen,
  invoiceInfo,
  items,
  onAddNextInvoice,
  currency,
  theme,
  translations,
  settings
}) => {
  function closeModal() {
    setIsOpen(false);
  }

  const addNextInvoiceHandler = () => {
    setIsOpen(false);
    onAddNextInvoice();
  };

  const formatCurrency = (amount) => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

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

  const SaveAsPDFHandler = () => {
    const dom = document.getElementById('print');
    toPng(dom)
      .then((dataUrl) => {
        const img = new Image();
        img.crossOrigin = 'annoymous';
        img.src = dataUrl;
        img.onload = () => {
          // Initialize the PDF.
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: [5.5, 8.5],
          });

          // Define reused data
          const imgProps = pdf.getImageProperties(img);
          const imageType = imgProps.fileType;
          const pdfWidth = pdf.internal.pageSize.getWidth();

          // Calculate the number of pages.
          const pxFullHeight = imgProps.height;
          const pxPageHeight = Math.floor((imgProps.width * 8.5) / 5.5);
          const nPages = Math.ceil(pxFullHeight / pxPageHeight);

          // Define pageHeight separately so it can be trimmed on the final page.
          let pageHeight = pdf.internal.pageSize.getHeight();

          // Create a one-page canvas to split up the full image.
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = imgProps.width;
          pageCanvas.height = pxPageHeight;

          for (let page = 0; page < nPages; page++) {
            // Trim the final page to reduce file size.
            if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
              pageCanvas.height = pxFullHeight % pxPageHeight;
              pageHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width;
            }
            // Display the page.
            const w = pageCanvas.width;
            const h = pageCanvas.height;
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, w, h);
            pageCtx.drawImage(img, 0, page * pxPageHeight, w, h, 0, 0, w, h);

            // Add the page to the PDF.
            if (page) pdf.addPage();

            const imgData = pageCanvas.toDataURL(`image/${imageType}`, 1);
            pdf.addImage(imgData, imageType, 0, 0, pdfWidth, pageHeight);
          }
          // Output / Save
          pdf.save(`invoice-${invoiceInfo.invoiceNumber}.pdf`);
        };
      })
      .catch((error) => {
        console.error('oops, something went wrong!', error);
      });
  };

  const printHandler = () => {
    window.print();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeModal}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className={`my-8 inline-block w-full max-w-2xl transform overflow-hidden rounded-lg ${theme.colors.background} text-left align-middle shadow-xl transition-all`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className={`text-lg font-medium ${theme.colors.text}`}>
                  {translations.invoice} #{invoiceInfo.invoiceNumber}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Invoice Content */}
              <div className="p-6" id="print">
                <div className="text-center mb-6">
                  <h1 className={`text-2xl font-bold ${theme.colors.text}`}>
                    {settings.shopName || translations.invoice.toUpperCase()}
                  </h1>
                  {settings.shopAddress && (
                    <p className={`text-sm ${theme.colors.textSecondary} mt-1`}>
                      {settings.shopAddress}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.invoiceNumber}:</span>
                        <span className={theme.colors.text}>{invoiceInfo.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.currentDate}:</span>
                        <span className={theme.colors.text}>{formatDate()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.cashierName}:</span>
                        <span className={theme.colors.text}>{invoiceInfo.cashierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.customerName}:</span>
                        <span className={theme.colors.text}>{invoiceInfo.customerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`border-y ${theme.colors.border} text-sm font-medium ${theme.colors.textSecondary}`}>
                        <th className="py-3">{translations.itemName}</th>
                        <th className="py-3 text-center">{translations.quantity}</th>
                        <th className="py-3 text-right">{translations.price}</th>
                        <th className="py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter(item => item.name.trim().length > 0).map((item) => (
                        <tr key={item.id} className={`border-b ${theme.colors.border}`}>
                          <td className={`py-3 ${theme.colors.text}`}>{item.name}</td>
                          <td className={`py-3 text-center ${theme.colors.text}`}>{item.qty}</td>
                          <td className={`py-3 text-right ${theme.colors.text}`}>
                            {formatCurrency(Number(item.price))}
                          </td>
                          <td className={`py-3 text-right font-medium ${theme.colors.text}`}>
                            {formatCurrency(Number(item.price * item.qty))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.subtotal}:</span>
                    <span className={theme.colors.text}>{formatCurrency(invoiceInfo.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.discount}:</span>
                    <span className={theme.colors.text}>-{formatCurrency(invoiceInfo.discountRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${theme.colors.textSecondary}`}>{translations.tax}:</span>
                    <span className={theme.colors.text}>+{formatCurrency(invoiceInfo.taxRate)}</span>
                  </div>
                  <div className={`flex justify-between border-t ${theme.colors.border} pt-2`}>
                    <span className={`text-lg font-bold ${theme.colors.text}`}>{translations.total}:</span>
                    <span className={`text-lg font-bold ${theme.colors.text}`}>
                      {formatCurrency(invoiceInfo.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex space-x-3 px-6 pb-6">
                <button
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 border ${theme.colors.border} rounded-lg ${theme.colors.text} hover:${theme.colors.accent} transition-colors`}
                  onClick={SaveAsPDFHandler}
                >
                  <Download className="h-4 w-4" />
                  <span>{translations.saveAsPDF}</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 border ${theme.colors.border} rounded-lg ${theme.colors.text} hover:${theme.colors.accent} transition-colors`}
                  onClick={printHandler}
                >
                  <Printer className="h-4 w-4" />
                  <span>{translations.print}</span>
                </button>
                <button
                  onClick={addNextInvoiceHandler}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 ${theme.colors.primary} ${theme.colors.primaryHover} text-white rounded-lg transition-colors`}
                >
                  <Plus className="h-4 w-4" />
                  <span>{translations.addNextInvoice}</span>
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceModal;
