import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  FaSave, 
  FaSearch, 
  FaFileInvoiceDollar, 
  FaUserCircle, 
  FaPhone, 
  FaTimes,
  FaPlus,
  FaTrash,
  FaPills,
  FaBaby
} from 'react-icons/fa';

// Import New Table Components
import GeneralTable from './tables/GeneralTable';
import HealthTable from './tables/HealthTable';
import OcularTable from './tables/OcularTable';
import VisualTable from './tables/VisualTable';
import { TableInput } from './common/TableComponents';

const AddBill = () => {
  // ... Search State (unchanged)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ... Option State (unchanged)
  const [options, setOptions] = useState({
    eye: [], complaint: [], glass: [], duration: [], distance: [], progression: [], association: [], conditions: [], lensType: []
  });

  // ... Harvest Effect (unchanged) ...
  useEffect(() => {
    const harvestOptions = async () => {
      try {
        const sets = { eye: new Set(), complaint: new Set(), glass: new Set(), duration: new Set(), distance: new Set(), progression: new Set(), association: new Set(), conditions: new Set(), lensType: new Set() };
        
        const genSnapshot = await getDocs(collection(db, "general_data"));
        genSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.eye && Array.isArray(data.eye)) data.eye.forEach(i => i && sets.eye.add(i));
        });

        const healthSnapshot = await getDocs(collection(db, "health_data"));
        healthSnapshot.forEach(doc => {
           if(doc.data().conditions) doc.data().conditions.forEach(c => c && sets.conditions.add(c));
        });

        setOptions(prev => ({
          ...prev,
          eye: Array.from(sets.eye).sort(),
          conditions: Array.from(sets.conditions).sort()
        }));
      } catch(e) {}
    };
    harvestOptions();
  }, []);

  // --- Row States ---
  const [generalDataRows, setGeneralDataRows] = useState([{ id: 1, eye: '', complaint: '', glass: '', duration: '', distance: '', progression: '', association: '', others: '' }]);
  const [healthConditionRows, setHealthConditionRows] = useState([{ id: 1, condition: '', duration: '', investigation: '' }]);
  const [ocularRows, setOcularRows] = useState([{ id: 1, eye: '', condition: '', duration: '', investigation: '' }]);
  const [medicationRows, setMedicationRows] = useState([{ id: 1, medication: '' }]);
  const [birthRows, setBirthRows] = useState([{ id: 1, birthHistory: '', allergies: '' }]);
  
  // --- VISUAL ACUITY STATES ---
  const [rxRows, setRxRows] = useState([{ id: 1, date: '', eye: '', sph: '', cyl: '', axis: '', add: '', prism: '', base: '', lens: '', status: '' }]); // Prev. Glass
  const [vaRows, setVaRows] = useState([{ id: 1, eye: '', withoutGlass: '', withGlass: '', withPh: '', contactLens: '' }]);
  const [refRows, setRefRows] = useState([{ id: 1, eye: '', retinoscopy: '', dsph: '', dcyl: '', axis: '' }]);
  const [accRows, setAccRows] = useState([{ id: 1, eye: '', sph: '', cyl: '', axis: '', distVision: '', add: '', nearVision: '', comments: '' }]);
  const [gpRows, setGpRows] = useState([{ id: 1, eye: '', sph: '', cyl: '', axis: '', add: '' }]); // New Glass Rx

  // ... Search Logic (unchanged) ...
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 1 && !selectedPatient) {
        setLoading(true);
        try {
          const patientsRef = collection(db, "patients");
          const nameQuery = query(patientsRef, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
          const mrQuery = query(patientsRef, where('mrNo', '>=', searchTerm), where('mrNo', '<=', searchTerm + '\uf8ff'));
          const [nameSnap, mrSnap] = await Promise.all([getDocs(nameQuery), getDocs(mrQuery)]);
          const combined = [...nameSnap.docs, ...mrSnap.docs];
          const unique = Array.from(new Map(combined.map(d => [d.id, { id: d.id, ...d.data() }])).values());
          setSearchResults(unique);
          setShowDropdown(true);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedPatient]);

  // --- Handlers ---
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRowAction = (type, action, id, field, value) => {
    const update = (rows, setRows, newRow) => {
        if(action === 'add') setRows([...rows, { ...newRow, id: Date.now() }]);
        if(action === 'remove') setRows(rows.filter(r => r.id !== id));
        if(action === 'update') setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    if(type === 'general') update(generalDataRows, setGeneralDataRows, { eye: '', complaint: '', glass: '', duration: '', distance: '', progression: '', association: '', others: '' });
    if(type === 'health') update(healthConditionRows, setHealthConditionRows, { condition: '', duration: '', investigation: '' });
    if(type === 'ocular') update(ocularRows, setOcularRows, { eye: '', condition: '', duration: '', investigation: '' });
    if(type === 'medication') update(medicationRows, setMedicationRows, { medication: '' });
    if(type === 'birth') update(birthRows, setBirthRows, { birthHistory: '', allergies: '' });
    
    // Visual Sections
    if(type === 'rx') update(rxRows, setRxRows, { date: '', eye: '', sph: '', cyl: '', axis: '', add: '', prism: '', base: '', lens: '', status: '' });
    if(type === 'va') update(vaRows, setVaRows, { eye: '', withoutGlass: '', withGlass: '', withPh: '', contactLens: '' });
    if(type === 'ref') update(refRows, setRefRows, { eye: '', retinoscopy: '', dsph: '', dcyl: '', axis: '' });
    if(type === 'acc') update(accRows, setAccRows, { eye: '', sph: '', cyl: '', axis: '', distVision: '', add: '', nearVision: '', comments: '' });
    if(type === 'gp') update(gpRows, setGpRows, { eye: '', sph: '', cyl: '', axis: '', add: '' });
  };

  const handleSave = async () => {
    if (!selectedPatient) return alert("Select a patient first.");
    setSaving(true);
    try {
      await addDoc(collection(db, "bills"), {
        patient: selectedPatient,
        generalData: generalDataRows,
        healthConditions: healthConditionRows,
        ocularHistory: ocularRows,
        medications: medicationRows,
        birthHistory: birthRows,
        
        // Save All Visual Data
        previousGlass: rxRows,
        visualAcuity: vaRows,
        refraction: refRows,
        acceptance: accRows,
        glassPrescription: gpRows, // Saved new table
        
        createdAt: serverTimestamp()
      });
      alert("Bill Saved Successfully!");
      handleClearPatient();
    } catch (e) { alert("Error saving bill."); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto text-white md:p-8 custom-scrollbar">
      
      {/* Header & Search ... (Same as before) */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 text-white bg-blue-500 shadow-lg rounded-xl shadow-blue-500/20"><FaFileInvoiceDollar size={24} /></div>
        <div><h1 className="text-2xl font-bold md:text-3xl">Add Medical Bill</h1><p className="text-sm text-blue-200">Search patient and enter details.</p></div>
      </div>

      <div className="relative z-30 p-1 mb-8 glass-panel rounded-2xl">
         {!selectedPatient ? (
             <div className="relative p-6">
                 <h2 className="mb-4 text-lg font-bold">Search Patient</h2>
                 <div className="flex items-center px-4 py-3 transition-all border bg-white/5 border-white/10 rounded-xl focus-within:border-blue-400">
                     <FaSearch className="mr-3 text-blue-300" />
                     <input 
                        className="flex-1 text-white bg-transparent outline-none placeholder-blue-300/50" 
                        placeholder="Type Name or MR Number..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                     />
                     {loading && <div className="w-4 h-4 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>}
                 </div>
                 {showDropdown && searchResults.length > 0 && (
                     <div className="absolute z-50 mt-2 overflow-y-auto border shadow-2xl left-6 right-6 top-full bg-slate-900/95 backdrop-blur-xl border-white/10 rounded-xl max-h-60 custom-scrollbar">
                         {searchResults.map(p => (
                             <div key={p.id} onClick={() => handleSelectPatient(p)} className="flex items-center justify-between p-4 transition-colors border-b cursor-pointer border-white/5 hover:bg-blue-600/30 group">
                                 <div><div className="font-bold text-white group-hover:text-blue-200">{p.name}</div><div className="text-xs text-blue-300/70">{p.gender}, {p.age} Yrs</div></div>
                                 <div className="text-right"><div className="px-2 py-1 mb-1 font-mono text-xs text-blue-300 rounded bg-blue-500/20">{p.mrNo}</div><div className="text-xs text-white/50">{p.phone}</div></div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
         ) : (
             <div className="flex flex-col items-center justify-between gap-4 p-6 border bg-gradient-to-r from-blue-600/20 to-purple-600/10 rounded-2xl border-blue-500/30 md:flex-row animate-fade-in">
                 <div className="flex items-center gap-4">
                     <div className="p-4 text-white bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"><FaUserCircle size={40} /></div>
                     <div><h3 className="text-2xl font-bold text-white">{selectedPatient.name}</h3><div className="flex flex-wrap mt-2 text-sm text-blue-200 gap-x-4 gap-y-2"><span className="bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/20 font-mono">MR: {selectedPatient.mrNo}</span><span className="flex items-center gap-1"><FaPhone size={12}/> {selectedPatient.phone}</span><span>{selectedPatient.age} Yrs / {selectedPatient.gender}</span></div></div>
                 </div>
                 <button onClick={handleClearPatient} className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-all border bg-white/10 hover:bg-red-500/20 hover:text-red-200 rounded-xl border-white/5 hover:border-red-500/30"><FaTimes /> Change Patient</button>
             </div>
         )}
      </div>

      <GeneralTable 
        rows={generalDataRows} options={options} 
        onRowChange={(id, f, v) => handleRowAction('general', 'update', id, f, v)}
        onAdd={() => handleRowAction('general', 'add')}
        onRemove={(id) => handleRowAction('general', 'remove', id)}
      />

      <HealthTable 
        rows={healthConditionRows} options={options} 
        onRowChange={(id, f, v) => handleRowAction('health', 'update', id, f, v)}
        onAdd={() => handleRowAction('health', 'add')}
        onRemove={(id) => handleRowAction('health', 'remove', id)}
      />

      <OcularTable 
        rows={ocularRows} options={options} 
        onRowChange={(id, f, v) => handleRowAction('ocular', 'update', id, f, v)}
        onAdd={() => handleRowAction('ocular', 'add')}
        onRemove={(id) => handleRowAction('ocular', 'remove', id)}
      />

      <div className="p-6 mb-8 glass-panel rounded-2xl">
         <h2 className="flex items-center gap-2 pb-2 mb-4 text-xl font-bold border-b border-white/10"><FaPills className="text-blue-400"/> Current Medications</h2>
         {medicationRows.map(r => (
             <div key={r.id} className="flex items-center gap-2 p-2 mb-3 border bg-white/5 rounded-xl border-white/5">
                 <span className="px-2 text-xs text-blue-500/50">#{medicationRows.indexOf(r)+1}</span>
                 <div className="flex-1"><TableInput value={r.medication} onChange={e => handleRowAction('medication','update',r.id,'medication',e.target.value)} placeholder="Enter Medication Name"/></div>
                 <button onClick={() => handleRowAction('medication','remove',r.id)} className="p-3 text-red-400 transition-colors rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white"><FaTrash size={14}/></button>
             </div>
         ))}
         <button onClick={() => handleRowAction('medication','add')} className="flex items-center gap-2 mt-2 text-sm text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Row</button>
      </div>

      <div className="p-6 mb-8 glass-panel rounded-2xl">
         <h2 className="flex items-center gap-2 pb-2 mb-4 text-xl font-bold border-b border-white/10"><FaBaby className="text-blue-400"/> Birth History</h2>
         {birthRows.map(r => (
             <div key={r.id} className="relative grid grid-cols-1 gap-4 p-4 mb-4 border md:grid-cols-2 bg-white/5 rounded-xl border-white/10">
                 <button onClick={() => handleRowAction('birth','remove',r.id)} className="absolute text-red-400 top-2 right-2 hover:text-white"><FaTrash size={12}/></button>
                 <div><label className="block mb-1 text-xs text-blue-300">Birth History</label><TableInput value={r.birthHistory} onChange={e => handleRowAction('birth','update',r.id,'birthHistory',e.target.value)} placeholder="History details..."/></div>
                 <div><label className="block mb-1 text-xs text-blue-300">Allergies</label><TableInput value={r.allergies} onChange={e => handleRowAction('birth','update',r.id,'allergies',e.target.value)} placeholder="List allergies..."/></div>
             </div>
         ))}
         <button onClick={() => handleRowAction('birth','add')} className="flex items-center gap-2 text-sm text-blue-300 hover:text-white"><FaPlus className="p-1 text-lg rounded bg-blue-500/20"/> Add Row</button>
      </div>

      {/* --- Pass ALL Visual Props to VisualTable --- */}
      <VisualTable 
        // 1. Previous Glass
        rxRows={rxRows}
        onRxChange={(id, f, v) => handleRowAction('rx', 'update', id, f, v)}
        onRxAdd={() => handleRowAction('rx', 'add')}
        onRxRemove={(id) => handleRowAction('rx', 'remove', id)}
        // 2. Visual Acuity
        vaRows={vaRows} 
        onVaChange={(id, f, v) => handleRowAction('va', 'update', id, f, v)}
        onVaAdd={() => handleRowAction('va', 'add')}
        onVaRemove={(id) => handleRowAction('va', 'remove', id)}
        // 3. Refraction
        refRows={refRows}
        onRefChange={(id, f, v) => handleRowAction('ref', 'update', id, f, v)}
        onRefAdd={() => handleRowAction('ref', 'add')}
        onRefRemove={(id) => handleRowAction('ref', 'remove', id)}
        // 4. Acceptance
        accRows={accRows}
        onAccChange={(id, f, v) => handleRowAction('acc', 'update', id, f, v)}
        onAccAdd={() => handleRowAction('acc', 'add')}
        onAccRemove={(id) => handleRowAction('acc', 'remove', id)}
        // 5. Glass Prescription (NEW)
        gpRows={gpRows}
        onGpChange={(id, f, v) => handleRowAction('gp', 'update', id, f, v)}
        onGpAdd={() => handleRowAction('gp', 'add')}
        onGpRemove={(id) => handleRowAction('gp', 'remove', id)}
        
        options={options} 
      />

      <div className="flex justify-end pt-4 pb-20">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-all transform shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl shadow-blue-900/50 active:scale-95 disabled:opacity-50 disabled:scale-100">
          {saving ? 'Saving...' : <><FaSave /> Save Bill Data</>}
        </button>
      </div>

    </div>
  );
};

export default AddBill;