import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { TableSelect, TableInput } from '../common/TableComponents';

const GeneralTable = ({ rows, options, onRowChange, onAdd, onRemove }) => {
  return (
    <div className="p-4 mb-8 glass-panel md:p-6 rounded-2xl">
      <h2 className="pb-2 mb-4 text-xl font-bold border-b border-white/10">General Data</h2>
      
      {/* Desktop */}
      <div className="hidden overflow-x-auto xl:block custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="text-xs text-blue-200 uppercase bg-blue-900/40">
            <tr>{['S.No','Eye','Chief Complaint','Glass','Duration','Distance','Progression','Association','Others','Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-white/5">
                <td className="p-3 pt-4 text-center text-blue-300 align-top">{index + 1}</td>
                <td className="p-3 align-top"><TableSelect value={row.eye} options={options.eye} onChange={(e) => onRowChange(row.id, 'eye', e.target.value)} /></td>
                <td className="p-3 align-top"><TableSelect value={row.complaint} options={options.complaint} onChange={(e) => onRowChange(row.id, 'complaint', e.target.value)} /></td>
                <td className="p-3 align-top"><TableSelect value={row.glass} options={options.glass} onChange={(e) => onRowChange(row.id, 'glass', e.target.value)} /></td>
                <td className="p-3 align-top"><TableSelect value={row.duration} options={options.duration} onChange={(e) => onRowChange(row.id, 'duration', e.target.value)} /></td>
                <td className="p-3 align-top"><TableSelect value={row.distance} options={options.distance} onChange={(e) => onRowChange(row.id, 'distance', e.target.value)} /></td>
                <td className="p-3 align-top"><TableSelect value={row.progression} options={options.progression} onChange={(e) => onRowChange(row.id, 'progression', e.target.value)} /></td>
                <td className="p-3 align-top"><TableSelect value={row.association} options={options.association} onChange={(e) => onRowChange(row.id, 'association', e.target.value)} /></td>
                <td className="p-3 align-top"><TableInput value={row.others} placeholder="Details" onChange={(e) => onRowChange(row.id, 'others', e.target.value)} /></td>
                <td className="p-3 pt-3 text-center align-top"><button onClick={() => onRemove(row.id)} className="p-2 text-red-400 hover:text-white"><FaTrash /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-4 xl:hidden">
         {rows.map((row, index) => (
           <div key={row.id} className="relative p-4 space-y-3 border bg-white/5 rounded-xl border-white/10">
             <div className="absolute text-xs text-blue-500 top-2 right-2">#{index+1}</div>
             <TableSelect value={row.eye} options={options.eye} onChange={(e) => onRowChange(row.id, 'eye', e.target.value)} />
             <TableSelect value={row.complaint} options={options.complaint} onChange={(e) => onRowChange(row.id, 'complaint', e.target.value)} />
             <TableInput value={row.others} placeholder="Others" onChange={(e) => onRowChange(row.id, 'others', e.target.value)} />
             <button onClick={() => onRemove(row.id)} className="w-full p-2 text-sm text-red-300 rounded bg-red-500/20"><FaTrash className="inline mr-2"/> Remove</button>
           </div>
         ))}
      </div>
      
      <button onClick={onAdd} className="flex items-center gap-2 mt-4 text-sm text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Row</button>
    </div>
  );
};

export default GeneralTable;