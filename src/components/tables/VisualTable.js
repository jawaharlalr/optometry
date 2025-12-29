import React from 'react';
import { FaTrash, FaPlus, FaGlasses, FaEye, FaMicroscope, FaCheckCircle, FaFilePrescription } from 'react-icons/fa';
import { TableSelect, TableInput } from '../common/TableComponents';

const VisualTable = ({ 
  // Previous Glass (rxRows)
  rxRows = [], onRxChange, onRxAdd, onRxRemove,
  // Visual Acuity (vaRows)
  vaRows = [], onVaChange, onVaAdd, onVaRemove,
  // Refraction (refRows)
  refRows = [], onRefChange, onRefAdd, onRefRemove,
  // Acceptance (accRows)
  accRows = [], onAccChange, onAccAdd, onAccRemove,
  // Glass Prescription (gpRows) - NEW
  gpRows = [], onGpChange, onGpAdd, onGpRemove,
  
  options = {} 
}) => {
  
  return (
    <div className="p-4 mb-8 space-y-8 glass-panel md:p-6 rounded-2xl">
      
      {/* --- SECTION 1: PREVIOUS GLASS PRESCRIPTION --- */}
      <div>
        <h3 className="flex items-center gap-2 pb-2 mb-3 text-lg font-bold text-blue-300 border-b border-white/10">
          <FaGlasses /> Previous Glass Prescription
        </h3>
        <div className="hidden overflow-x-auto xl:block custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs text-blue-200 uppercase bg-blue-900/40">
              <tr>{['Date', 'Eye', 'Sph', 'Cyl', 'Axis', 'Add', 'Prism', 'Base', 'Lens', 'Status', 'Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rxRows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-2"><TableInput type="date" value={row.date} onChange={(e) => onRxChange(row.id, 'date', e.target.value)} /></td>
                  <td className="p-2"><TableSelect value={row.eye} options={options.eye} onChange={(e) => onRxChange(row.id, 'eye', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.sph} placeholder="Sph" onChange={(e) => onRxChange(row.id, 'sph', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.cyl} placeholder="Cyl" onChange={(e) => onRxChange(row.id, 'cyl', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onRxChange(row.id, 'axis', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.add} placeholder="Add" onChange={(e) => onRxChange(row.id, 'add', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.prism} placeholder="Prism" onChange={(e) => onRxChange(row.id, 'prism', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.base} placeholder="Base" onChange={(e) => onRxChange(row.id, 'base', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.lens} placeholder="Lens" onChange={(e) => onRxChange(row.id, 'lens', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.status} placeholder="Status" onChange={(e) => onRxChange(row.id, 'status', e.target.value)} /></td>
                  <td className="p-2 pt-3 text-center"><button onClick={() => onRxRemove(row.id)} className="p-2 text-red-400 hover:text-white"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 xl:hidden">
          {rxRows.map((row, idx) => (
            <div key={row.id} className="relative grid grid-cols-2 gap-3 p-3 border bg-white/5 border-white/10 rounded-xl">
              <button onClick={() => onRxRemove(row.id)} className="absolute text-red-400 top-2 right-2"><FaTrash size={12}/></button>
              <div className="col-span-2 text-xs font-bold text-blue-400">Prev. Glass #{idx+1}</div>
              <div className="col-span-2"><label className="text-[10px] text-blue-300 block">Date</label><TableInput type="date" value={row.date} onChange={(e) => onRxChange(row.id, 'date', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Eye</label><TableSelect value={row.eye} options={options.eye} onChange={(e) => onRxChange(row.id, 'eye', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Sph</label><TableInput value={row.sph} placeholder="Sph" onChange={(e) => onRxChange(row.id, 'sph', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Cyl</label><TableInput value={row.cyl} placeholder="Cyl" onChange={(e) => onRxChange(row.id, 'cyl', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Axis</label><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onRxChange(row.id, 'axis', e.target.value)} /></div>
            </div>
          ))}
        </div>
        <button onClick={onRxAdd} className="flex items-center gap-2 mt-3 text-xs text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Previous Glass</button>
      </div>

      {/* --- SECTION 2: VISUAL ACUITY --- */}
      <div>
        <h3 className="flex items-center gap-2 pb-2 mb-3 text-lg font-bold text-blue-300 border-b border-white/10">
          <FaEye /> Visual Acuity
        </h3>
        <div className="hidden overflow-x-auto xl:block custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs text-blue-200 uppercase bg-blue-900/40">
              <tr>{['S.No', 'Eye', 'Without Glass', 'With Glass', 'With PH', 'Contact Lens', 'Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vaRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-2 text-center text-blue-300">{idx + 1}</td>
                  <td className="p-2"><TableSelect value={row.eye} options={options.eye} onChange={(e) => onVaChange(row.id, 'eye', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.withoutGlass} placeholder="6/6" onChange={(e) => onVaChange(row.id, 'withoutGlass', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.withGlass} placeholder="6/6" onChange={(e) => onVaChange(row.id, 'withGlass', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.withPh} placeholder="PH" onChange={(e) => onVaChange(row.id, 'withPh', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.contactLens} placeholder="CL" onChange={(e) => onVaChange(row.id, 'contactLens', e.target.value)} /></td>
                  <td className="p-2 text-center"><button onClick={() => onVaRemove(row.id)} className="p-2 text-red-400 hover:text-white"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 xl:hidden">
          {vaRows.map((row, idx) => (
            <div key={row.id} className="relative grid grid-cols-2 gap-3 p-3 border bg-white/5 border-white/10 rounded-xl">
              <button onClick={() => onVaRemove(row.id)} className="absolute text-red-400 top-2 right-2"><FaTrash size={12}/></button>
              <div className="col-span-2 text-xs font-bold text-blue-400">VA #{idx+1}</div>
              <div><label className="text-[10px] text-blue-300 block">Eye</label><TableSelect value={row.eye} options={options.eye} onChange={(e) => onVaChange(row.id, 'eye', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Without Glass</label><TableInput value={row.withoutGlass} onChange={(e) => onVaChange(row.id, 'withoutGlass', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">With Glass</label><TableInput value={row.withGlass} onChange={(e) => onVaChange(row.id, 'withGlass', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">With PH</label><TableInput value={row.withPh} onChange={(e) => onVaChange(row.id, 'withPh', e.target.value)} /></div>
              <div className="col-span-2"><label className="text-[10px] text-blue-300 block">Contact Lens</label><TableInput value={row.contactLens} onChange={(e) => onVaChange(row.id, 'contactLens', e.target.value)} /></div>
            </div>
          ))}
        </div>
        <button onClick={onVaAdd} className="flex items-center gap-2 mt-3 text-xs text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add VA Row</button>
      </div>

      {/* --- SECTION 3: REFRACTION --- */}
      <div>
        <h3 className="flex items-center gap-2 pb-2 mb-3 text-lg font-bold text-blue-300 border-b border-white/10">
          <FaMicroscope /> Refraction
        </h3>
        <div className="hidden overflow-x-auto xl:block custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs text-blue-200 uppercase bg-blue-900/40">
              <tr>{['S.No', 'Eye', 'Reflex', 'DSph', 'DCyl', 'Axis', 'Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {refRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-2 text-center text-blue-300">{idx + 1}</td>
                  <td className="p-2"><TableSelect value={row.eye} options={options.eye} onChange={(e) => onRefChange(row.id, 'eye', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.retinoscopy} placeholder="Reflex" onChange={(e) => onRefChange(row.id, 'retinoscopy', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.dsph} placeholder="Sph" onChange={(e) => onRefChange(row.id, 'dsph', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.dcyl} placeholder="Cyl" onChange={(e) => onRefChange(row.id, 'dcyl', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onRefChange(row.id, 'axis', e.target.value)} /></td>
                  <td className="p-2 text-center"><button onClick={() => onRefRemove(row.id)} className="p-2 text-red-400 hover:text-white"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 xl:hidden">
          {refRows.map((row, idx) => (
            <div key={row.id} className="relative grid grid-cols-2 gap-3 p-3 border bg-white/5 border-white/10 rounded-xl">
              <button onClick={() => onRefRemove(row.id)} className="absolute text-red-400 top-2 right-2"><FaTrash size={12}/></button>
              <div className="col-span-2 text-xs font-bold text-blue-400">Refraction #{idx+1}</div>
              <div><label className="text-[10px] text-blue-300 block">Eye</label><TableSelect value={row.eye} options={options.eye} onChange={(e) => onRefChange(row.id, 'eye', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Reflex</label><TableInput value={row.retinoscopy} onChange={(e) => onRefChange(row.id, 'retinoscopy', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">DSph</label><TableInput value={row.dsph} onChange={(e) => onRefChange(row.id, 'dsph', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">DCyl</label><TableInput value={row.dcyl} onChange={(e) => onRefChange(row.id, 'dcyl', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Axis</label><TableInput value={row.axis} onChange={(e) => onRefChange(row.id, 'axis', e.target.value)} /></div>
            </div>
          ))}
        </div>
        <button onClick={onRefAdd} className="flex items-center gap-2 mt-3 text-xs text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Refraction Row</button>
      </div>

      {/* --- SECTION 4: ACCEPTANCE --- */}
      <div>
        <h3 className="flex items-center gap-2 pb-2 mb-3 text-lg font-bold text-blue-300 border-b border-white/10">
          <FaCheckCircle /> ACCEPTANCE
        </h3>
        <div className="hidden overflow-x-auto xl:block custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs text-blue-200 uppercase bg-blue-900/40">
              <tr>{['Eye', 'Sph', 'Cyl', 'Axis', 'Dist Vision', 'Add', 'Near Vision', 'Comments', 'Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accRows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-2"><TableSelect value={row.eye} options={options.eye} onChange={(e) => onAccChange(row.id, 'eye', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.sph} placeholder="Sph" onChange={(e) => onAccChange(row.id, 'sph', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.cyl} placeholder="Cyl" onChange={(e) => onAccChange(row.id, 'cyl', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onAccChange(row.id, 'axis', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.distVision} placeholder="6/6" onChange={(e) => onAccChange(row.id, 'distVision', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.add} placeholder="Add" onChange={(e) => onAccChange(row.id, 'add', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.nearVision} placeholder="N6" onChange={(e) => onAccChange(row.id, 'nearVision', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.comments} placeholder="Remarks" onChange={(e) => onAccChange(row.id, 'comments', e.target.value)} /></td>
                  <td className="p-2 text-center"><button onClick={() => onAccRemove(row.id)} className="p-2 text-red-400 hover:text-white"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 xl:hidden">
          {accRows.map((row, idx) => (
            <div key={row.id} className="relative grid grid-cols-2 gap-3 p-3 border bg-white/5 border-white/10 rounded-xl">
              <button onClick={() => onAccRemove(row.id)} className="absolute text-red-400 top-2 right-2"><FaTrash size={12}/></button>
              <div className="col-span-2 text-xs font-bold text-blue-400">Acceptance #{idx+1}</div>
              <div><label className="text-[10px] text-blue-300 block">Eye</label><TableSelect value={row.eye} options={options.eye} onChange={(e) => onAccChange(row.id, 'eye', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Sph</label><TableInput value={row.sph} placeholder="Sph" onChange={(e) => onAccChange(row.id, 'sph', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Cyl</label><TableInput value={row.cyl} placeholder="Cyl" onChange={(e) => onAccChange(row.id, 'cyl', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Axis</label><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onAccChange(row.id, 'axis', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Dist Vision</label><TableInput value={row.distVision} placeholder="6/6" onChange={(e) => onAccChange(row.id, 'distVision', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Add</label><TableInput value={row.add} placeholder="Add" onChange={(e) => onAccChange(row.id, 'add', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Near Vision</label><TableInput value={row.nearVision} placeholder="N6" onChange={(e) => onAccChange(row.id, 'nearVision', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Comments</label><TableInput value={row.comments} placeholder="Remarks" onChange={(e) => onAccChange(row.id, 'comments', e.target.value)} /></div>
            </div>
          ))}
        </div>
        <button onClick={onAccAdd} className="flex items-center gap-2 mt-3 text-xs text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Acceptance Row</button>
      </div>

      {/* --- SECTION 5: GLASS PRESCRIPTION (NEW) --- */}
      <div>
        <h3 className="flex items-center gap-2 pb-2 mb-3 text-lg font-bold text-blue-300 border-b border-white/10">
          <FaFilePrescription /> Glass Prescription
        </h3>
        <div className="hidden overflow-x-auto xl:block custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="text-xs text-blue-200 uppercase bg-blue-900/40">
              <tr>{['Eye', 'Sph', 'Cyl', 'Axis', 'Add', 'Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gpRows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-2"><TableSelect value={row.eye} options={options.eye} onChange={(e) => onGpChange(row.id, 'eye', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.sph} placeholder="Sph" onChange={(e) => onGpChange(row.id, 'sph', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.cyl} placeholder="Cyl" onChange={(e) => onGpChange(row.id, 'cyl', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onGpChange(row.id, 'axis', e.target.value)} /></td>
                  <td className="p-2"><TableInput value={row.add} placeholder="Add" onChange={(e) => onGpChange(row.id, 'add', e.target.value)} /></td>
                  <td className="p-2 text-center"><button onClick={() => onGpRemove(row.id)} className="p-2 text-red-400 hover:text-white"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 xl:hidden">
          {gpRows.map((row, idx) => (
            <div key={row.id} className="relative grid grid-cols-2 gap-3 p-3 border bg-white/5 border-white/10 rounded-xl">
              <button onClick={() => onGpRemove(row.id)} className="absolute text-red-400 top-2 right-2"><FaTrash size={12}/></button>
              <div className="col-span-2 text-xs font-bold text-blue-400">Glass Rx #{idx+1}</div>
              <div><label className="text-[10px] text-blue-300 block">Eye</label><TableSelect value={row.eye} options={options.eye} onChange={(e) => onGpChange(row.id, 'eye', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Sph</label><TableInput value={row.sph} placeholder="Sph" onChange={(e) => onGpChange(row.id, 'sph', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Cyl</label><TableInput value={row.cyl} placeholder="Cyl" onChange={(e) => onGpChange(row.id, 'cyl', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Axis</label><TableInput value={row.axis} placeholder="Axis" onChange={(e) => onGpChange(row.id, 'axis', e.target.value)} /></div>
              <div><label className="text-[10px] text-blue-300 block">Add</label><TableInput value={row.add} placeholder="Add" onChange={(e) => onGpChange(row.id, 'add', e.target.value)} /></div>
            </div>
          ))}
        </div>
        <button onClick={onGpAdd} className="flex items-center gap-2 mt-3 text-xs text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Glass Rx Row</button>
      </div>

    </div>
  );
};

export default VisualTable;