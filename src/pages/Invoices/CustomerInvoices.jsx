import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoice.service';
import { FileText, Download, Printer, Search, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getInvoices();
      setInvoices(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (invoice, isThermal = false) => {
    const doc = isThermal 
      ? new jsPDF({ format: [80, 200], unit: 'mm' })
      : new jsPDF();
    
    const margin = isThermal ? 5 : 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = margin + 5;

    if (isThermal) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('GARMENTS ERP', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Tax Invoice', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(8);
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, margin, yPos);
      yPos += 4;
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, margin, yPos);
      yPos += 6;

      const tableData = (invoice.items || []).map(item => [
        `${(item.Product?.productName || 'Unknown').substring(0, 12)} ${item.variant?.size ? `(${item.variant.size})` : ''}`.trim(), 
        item.quantity, 
        item.total
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Qty', 'Total']],
        body: tableData,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 5;
      doc.setFont('helvetica', 'bold');
      doc.text(`GST: ${formatCurrency(invoice.gstAmount)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 5;
      doc.setFontSize(10);
      doc.text(`Total: ${formatCurrency(invoice.totalAmount)}`, pageWidth - margin, yPos, { align: 'right' });

      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you!', pageWidth / 2, yPos, { align: 'center' });

      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      
    } else {
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 37, 41);
      doc.text('GARMENTS ERP', margin, yPos);
      
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('TAX INVOICE', pageWidth - margin, yPos, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(33, 37, 41);
      doc.text(`Invoice No:`, pageWidth - margin - 35, yPos + 8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${invoice.invoiceNumber}`, pageWidth - margin, yPos + 8, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Date:`, pageWidth - margin - 35, yPos + 14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos + 14, { align: 'right' });

      yPos += 30;

      const tableData = (invoice.items || []).map(item => [
        `${item.Product?.productName || 'Unknown'} ${item.variant?.size ? `(${item.variant.size})` : ''}`.trim(), 
        formatCurrency(item.unitPrice), 
        item.quantity, 
        formatCurrency(item.total)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Item Description', 'Selling Price', 'Qty', 'Total']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
      const totalsX = pageWidth - margin - 60;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', totalsX, yPos);
      doc.text(`${formatCurrency(invoice.subTotal)}`, pageWidth - margin, yPos, { align: 'right' });
      
      yPos += 6;
      doc.text('GST:', totalsX, yPos);
      doc.text(`${formatCurrency(invoice.gstAmount)}`, pageWidth - margin, yPos, { align: 'right' });

      if (invoice.discount > 0) {
        yPos += 6;
        doc.text('Discount:', totalsX, yPos);
        doc.text(`-${formatCurrency(invoice.discount)}`, pageWidth - margin, yPos, { align: 'right' });
      }

      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Final Amount:', totalsX, yPos);
      doc.setTextColor(79, 70, 229);
      doc.text(`${formatCurrency(invoice.totalAmount)}`, pageWidth - margin, yPos, { align: 'right' });

      doc.save(`Tax_Invoice_${invoice.invoiceNumber}.pdf`);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Invoices</h1>
          <p className="text-sm text-gray-500">View and download your shopping tax invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" placeholder="Search invoices..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center font-medium text-gray-900">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">CARD</span></td>
                    <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button 
                        onClick={() => generatePDF(invoice, false)}
                        className="flex items-center text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3 h-3 mr-1" /> PDF
                      </button>
                      <button 
                        onClick={() => generatePDF(invoice, true)}
                        className="flex items-center text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-primary rounded-lg transition-colors"
                      >
                        <Printer className="w-3 h-3 mr-1" /> Print
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoices;
