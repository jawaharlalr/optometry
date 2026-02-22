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
      <div className="space-y-3 xl:hidden">
         {rows.map((row, index) => (
           <div key={row.id} className="relative grid grid-cols-2 gap-3 p-3 border bg-white/5 border-white/10 rounded-xl">
             <button onClick={() => onRemove(row.id)} className="absolute text-red-400 top-2 right-2"><FaTrash size={12}/></button>
             <div className="col-span-2 text-xs font-bold text-blue-400">General Data #{index+1}</div>
             
             <div><label className="text-[10px] text-blue-300 block">Eye</label><TableSelect value={row.eye} options={options.eye} onChange={(e) => onRowChange(row.id, 'eye', e.target.value)} /></div>
             <div><label className="text-[10px] text-blue-300 block">Chief Complaint</label><TableSelect value={row.complaint} options={options.complaint} onChange={(e) => onRowChange(row.id, 'complaint', e.target.value)} /></div>
             <div><label className="text-[10px] text-blue-300 block">Glass</label><TableSelect value={row.glass} options={options.glass} onChange={(e) => onRowChange(row.id, 'glass', e.target.value)} /></div>
             <div><label className="text-[10px] text-blue-300 block">Duration</label><TableSelect value={row.duration} options={options.duration} onChange={(e) => onRowChange(row.id, 'duration', e.target.value)} /></div>
             <div><label className="text-[10px] text-blue-300 block">Distance</label><TableSelect value={row.distance} options={options.distance} onChange={(e) => onRowChange(row.id, 'distance', e.target.value)} /></div>
             <div><label className="text-[10px] text-blue-300 block">Progression</label><TableSelect value={row.progression} options={options.progression} onChange={(e) => onRowChange(row.id, 'progression', e.target.value)} /></div>
             <div className="col-span-2"><label className="text-[10px] text-blue-300 block">Association</label><TableSelect value={row.association} options={options.association} onChange={(e) => onRowChange(row.id, 'association', e.target.value)} /></div>
             <div className="col-span-2"><label className="text-[10px] text-blue-300 block">Others</label><TableInput value={row.others} placeholder="Details" onChange={(e) => onRowChange(row.id, 'others', e.target.value)} /></div>
           </div>
         ))}
      </div>
      
      <button onClick={onAdd} className="flex items-center gap-2 mt-3 text-xs text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Row</button>
    </div>
  );
};

export default GeneralTable;