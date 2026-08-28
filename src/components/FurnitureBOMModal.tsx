import React from 'react';
import { FURNITURE_BOM } from '../data/classroomData';
import { BOMItem } from '../types';
import { Package, Download, CheckCircle2, ShieldCheck, DollarSign, Layers } from 'lucide-react';

export const FurnitureBOMModal: React.FC = () => {
  const totalItems = FURNITURE_BOM.reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = FURNITURE_BOM.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

  const exportCSV = () => {
    const headers = ['Category', 'Item Name', 'Model Code', 'Quantity', 'Unit Cost ($)', 'Total Cost ($)', 'Dimensions', 'Ergonomics Certification'];
    const rows = FURNITURE_BOM.map(item => [
      item.category,
      `"${item.name}"`,
      item.modelCode,
      item.quantity,
      item.unitCost,
      item.quantity * item.unitCost,
      `"${item.dimensions}"`,
      `"${item.ergonomics}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '18x24_Classroom_30Student_Furniture_BOM.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="furniture-bom-view" className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Package className="w-4 h-4" />
            <span>Procurement & Architectural Specifications</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Furniture Bill of Materials (BOM) & Ergonomics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official commercial-grade educational catalog for 18' × 24' classroom (30 Students + Educator + Breakout Lounge).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase text-slate-400 font-mono">Estimated Total</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              ${totalCost.toLocaleString()}
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export CSV Specification</span>
          </button>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Item & Specifications</th>
                <th className="py-3.5 px-3">Model Code</th>
                <th className="py-3.5 px-3 text-center">Qty</th>
                <th className="py-3.5 px-3 text-right">Unit Price</th>
                <th className="py-3.5 px-3 text-right">Extended Total</th>
                <th className="py-3.5 px-4">Reconfigurability & Ergonomics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {FURNITURE_BOM.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.dimensions}</div>
                    <ul className="mt-1 space-y-0.5 text-[10px] text-slate-400">
                      {item.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-indigo-400" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">{item.modelCode}</td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-indigo-400">{item.quantity}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">${item.unitCost}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                    ${(item.quantity * item.unitCost).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-[11px] text-slate-300">{item.ergonomics}</div>
                    <div className="text-[10px] text-amber-300/90 font-medium mt-0.5">{item.reconfigurability}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950/90 text-slate-200 font-bold border-t border-slate-800">
              <tr>
                <td colSpan={2} className="py-4 px-4 text-slate-400 font-mono">
                  TOTAL CLASSROOM FITOUT ({totalItems} Furniture Units)
                </td>
                <td className="py-4 px-3 text-center font-mono text-indigo-400">{totalItems}</td>
                <td className="py-4 px-3 text-right text-slate-400">-</td>
                <td className="py-4 px-3 text-right font-mono text-base text-emerald-400 font-bold">
                  ${totalCost.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-xs font-normal text-slate-400">
                  Includes 10-year manufacturer warranty & BIFMA certifications
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
