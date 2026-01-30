'use client';

import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Stock {
  id: string;
  quantity: number;
  unit: string;
  minThreshold: number | null;
  maxThreshold: number | null;
  lastRestockDate: string | null;
  updatedAt: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
}

interface StockExportButtonProps {
  stocks: Stock[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function StockExportButton({
  stocks,
  variant = 'outline',
  size = 'default',
  className
}: StockExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getStockStatus = (stock: Stock) => {
    if (!stock.minThreshold) return 'normal';
    if (stock.quantity <= stock.minThreshold) return 'critical';
    if (stock.quantity <= stock.minThreshold * 1.5) return 'low';
    return 'normal';
  };

  const handleExport = () => {
    setIsGenerating(true);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour exporter le PDF');
      setIsGenerating(false);
      return;
    }

    const criticalStocks = stocks.filter(s => getStockStatus(s) === 'critical');
    const lowStocks = stocks.filter(s => getStockStatus(s) === 'low');
    const normalStocks = stocks.filter(s => getStockStatus(s) === 'normal');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport de Stock - ${new Date().toLocaleDateString('fr-FR')}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 40px;
            color: #1a1a1a;
            background: white;
          }

          .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
          }

          .header .subtitle {
            font-size: 14px;
            color: #64748b;
          }

          .header .date {
            font-size: 14px;
            color: #64748b;
            margin-top: 4px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }

          .summary-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            background: #f8fafc;
          }

          .summary-card .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }

          .summary-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
          }

          .summary-card.critical .value {
            color: #dc2626;
          }

          .summary-card.warning .value {
            color: #ea580c;
          }

          .summary-card.success .value {
            color: #16a34a;
          }

          .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1a1a1a;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .badge.critical {
            background: #fee2e2;
            color: #dc2626;
          }

          .badge.warning {
            background: #ffedd5;
            color: #ea580c;
          }

          .badge.success {
            background: #dcfce7;
            color: #16a34a;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }

          thead {
            background: #f1f5f9;
            border-bottom: 2px solid #cbd5e1;
          }

          th {
            text-align: left;
            padding: 12px 16px;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }

          th.text-right {
            text-align: right;
          }

          td {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
          }

          td.text-right {
            text-align: right;
          }

          tr.critical {
            background: #fef2f2;
          }

          tr.warning {
            background: #fff7ed;
          }

          tbody tr:hover {
            background: #f8fafc;
          }

          .ingredient-name {
            font-weight: 600;
            color: #1a1a1a;
          }

          .category {
            color: #64748b;
            font-size: 12px;
          }

          .quantity {
            font-weight: 700;
            font-size: 14px;
          }

          .threshold {
            color: #64748b;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }

          .no-data {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
            font-style: italic;
          }

          @media print {
            body {
              padding: 20px;
            }

            .section {
              page-break-inside: avoid;
            }

            @page {
              margin: 1.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 Rapport de Stock</h1>
          <div class="subtitle">Bar du Casino</div>
          <div class="date">Généré le ${new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Total Ingrédients</div>
            <div class="value">${stocks.length}</div>
          </div>
          <div class="summary-card critical">
            <div class="label">Stocks Critiques</div>
            <div class="value">${criticalStocks.length}</div>
          </div>
          <div class="summary-card warning">
            <div class="label">Stocks Faibles</div>
            <div class="value">${lowStocks.length}</div>
          </div>
        </div>

        ${criticalStocks.length > 0 ? `
        <div class="section">
          <div class="section-title">
            🚨 Stocks Critiques (Action Immédiate Requise)
            <span class="badge critical">${criticalStocks.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ingrédient</th>
                <th>Catégorie</th>
                <th class="text-right">Quantité Actuelle</th>
                <th class="text-right">Seuil Minimum</th>
                <th class="text-right">À Commander</th>
              </tr>
            </thead>
            <tbody>
              ${criticalStocks.map(stock => {
                const toOrder = stock.maxThreshold
                  ? Math.max(0, stock.maxThreshold - stock.quantity)
                  : (stock.minThreshold ? stock.minThreshold * 2 - stock.quantity : 0);
                return `
                <tr class="critical">
                  <td class="ingredient-name">${stock.ingredient.name}</td>
                  <td class="category">${stock.ingredient.category}</td>
                  <td class="text-right quantity" style="color: #dc2626;">${Number(stock.quantity).toFixed(0)} ${stock.unit}</td>
                  <td class="text-right threshold">${stock.minThreshold || '-'} ${stock.unit}</td>
                  <td class="text-right" style="font-weight: 600;">${Math.ceil(toOrder)} ${stock.unit}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${lowStocks.length > 0 ? `
        <div class="section">
          <div class="section-title">
            ⚠️ Stocks Faibles (À Surveiller)
            <span class="badge warning">${lowStocks.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ingrédient</th>
                <th>Catégorie</th>
                <th class="text-right">Quantité Actuelle</th>
                <th class="text-right">Seuil Minimum</th>
                <th class="text-right">À Commander</th>
              </tr>
            </thead>
            <tbody>
              ${lowStocks.map(stock => {
                const toOrder = stock.maxThreshold
                  ? Math.max(0, stock.maxThreshold - stock.quantity)
                  : (stock.minThreshold ? stock.minThreshold * 2 - stock.quantity : 0);
                return `
                <tr class="warning">
                  <td class="ingredient-name">${stock.ingredient.name}</td>
                  <td class="category">${stock.ingredient.category}</td>
                  <td class="text-right quantity" style="color: #ea580c;">${Number(stock.quantity).toFixed(0)} ${stock.unit}</td>
                  <td class="text-right threshold">${stock.minThreshold || '-'} ${stock.unit}</td>
                  <td class="text-right" style="font-weight: 600;">${Math.ceil(toOrder)} ${stock.unit}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">
            ✅ Inventaire Complet
            <span class="badge success">${normalStocks.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ingrédient</th>
                <th>Catégorie</th>
                <th class="text-right">Quantité Actuelle</th>
                <th class="text-right">Seuil Minimum</th>
                <th class="text-right">Seuil Maximum</th>
              </tr>
            </thead>
            <tbody>
              ${stocks.map(stock => {
                const status = getStockStatus(stock);
                return `
                <tr class="${status === 'critical' ? 'critical' : status === 'low' ? 'warning' : ''}">
                  <td class="ingredient-name">${stock.ingredient.name}</td>
                  <td class="category">${stock.ingredient.category}</td>
                  <td class="text-right quantity">${Number(stock.quantity).toFixed(0)} ${stock.unit}</td>
                  <td class="text-right threshold">${stock.minThreshold || '-'} ${stock.unit}</td>
                  <td class="text-right threshold">${stock.maxThreshold || '-'} ${stock.unit}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Document confidentiel - Bar du Casino</p>
          <p>Ce rapport a été généré automatiquement par le système de gestion de stock</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={className}
      disabled={isGenerating || stocks.length === 0}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Exporter en PDF
        </>
      )}
    </Button>
  );
}
