import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { 
  FaSave, 
  FaSearch, 
  FaFileInvoiceDollar, 
  FaUserCircle, 
  FaPhone, 
  FaTimes, 
  FaPlus,
  FaTrash
} from 'react-icons/fa';

// --- COMPONENTS MOVED OUTSIDE TO FIX FOCUS LOSS & ALLOW EXPANSION ---

const TableSelect = ({ value, onChange, options = [] }) => (
  <select 
    className="w-full bg-black/20 border border-white/10 text-white text-sm rounded p-2.5 outline-none focus:border-blue-400 appearance-none cursor-pointer min-h-[42px]" 
    value={value} 
    onChange={onChange}
  >
    <option value="" className="bg-slate-800 text-gray-400">Select</option>
    {options && options.map((opt, i) => <option key={i} value={opt} className="bg-slate-800">{opt}</option>)}
  </select>
);

const TableInput = ({ value, onChange, placeholder = '' }) => (
  <textarea 
    className="w-full bg-black/20 border border-white/10 text-white text-sm rounded p-2.5 outline-none focus:border-blue-400 placeholder-white/30 resize-y min-h-[42px] overflow-hidden align-top" 
    value={value} 
    onChange={onChange} 
    placeholder={placeholder}
    rows={1}
    onInput={(e) => {
      e.target.style.height = 'auto'; // Reset height
      e.target.style.height = e.target.scrollHeight + 'px'; // Auto-expand
    }}
  />
);

// --- MAIN COMPONENT ---

const AddBill = () => {
  // --- Search & Patient State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Dynamic Options State (Initialized Empty) ---
  const [options, setOptions] = useState({
    eye: [],
    complaint: [],
    glass: [],
    duration: [],
    distance: [],
    progression: [],
    association: [],
    conditions: []
  });

  // --- 1. HARVEST DATA FROM FIRESTORE (No Hardcoded Defaults) ---
  useEffect(() => {
    const harvestOptions = async () => {
      try {
        // Sets to ensure unique values
        const sets = {
          eye: new Set(),
          complaint: new Set(),
          glass: new Set(),
          duration: new Set(),
          distance: new Set(),
          progression: new Set(),
          association: new Set(),
          conditions: new Set()
        };

        // A. Harvest General Data
        const genSnapshot = await getDocs(collection(db, "general_data"));
        genSnapshot.forEach(doc => {
          const data = doc.data();
          // Check for flat arrays (New Schema)
          if (data.eye) {
             if(Array.isArray(data.eye)) data.eye.forEach(i => i && sets.eye.add(i));
             if(Array.isArray(data.complaint)) data.complaint.forEach(i => i && sets.complaint.add(i));
             if(Array.isArray(data.glass)) data.glass.forEach(i => i && sets.glass.add(i));
             if(Array.isArray(data.duration)) data.duration.forEach(i => i && sets.duration.add(i));
             if(Array.isArray(data.distance)) data.distance.forEach(i => i && sets.distance.add(i));
             if(Array.isArray(data.progression)) data.progression.forEach(i => i && sets.progression.add(i));
             if(Array.isArray(data.association)) data.association.forEach(i => i && sets.association.add(i));
          }
          // Check for array of objects (Old Schema Fallback)
          else if (data.complaintsData && Array.isArray(data.complaintsData)) {
             data.complaintsData.forEach(row => {
               if(row.eye) sets.eye.add(row.eye);
               if(row.complaint) sets.complaint.add(row.complaint);
               if(row.glass) sets.glass.add(row.glass);
               if(row.duration) sets.duration.add(row.duration);
               if(row.distance) sets.distance.add(row.distance);
               if(row.progression) sets.progression.add(row.progression);
               if(row.association) sets.association.add(row.association);
             });
          }
        });

        // B. Harvest Health Data
        const healthSnapshot = await getDocs(collection(db, "health_data"));
        healthSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.conditions && Array.isArray(data.conditions)) {
            data.conditions.forEach(c => c && sets.conditions.add(c));
          }
        });

        // Update State
        setOptions({
          eye: Array.from(sets.eye).sort(),
          complaint: Array.from(sets.complaint).sort(),
          glass: Array.from(sets.glass).sort(),
          duration: Array.from(sets.duration).sort(),
          distance: Array.from(sets.distance).sort(),
          progression: Array.from(sets.progression).sort(),
          association: Array.from(sets.association).sort(),
          conditions: Array.from(sets.conditions).sort()
        });

      } catch (err) {
        console.error("Error harvesting options:", err);
      }
    };

    harvestOptions();
  }, []);

  // --- Table Rows State ---
  const [generalDataRows, setGeneralDataRows] = useState([{ id: 1, eye: '', complaint: '', glass: '', duration: '', distance: '', progression: '', association: '', others: '' }]);
  const [healthConditionRows, setHealthConditionRows] = useState([{ id: 1, condition: '', duration: '', investigation: '' }]);
  const [ocularRows, setOcularRows] = useState([{ id: 1, eye: '', condition: '', duration: '', investigation: '' }]);
  const [medicationRows, setMedicationRows] = useState([{ id: 1, medication: '' }]);
  const [birthRows, setBirthRows] = useState([{ id: 1, birthHistory: '', allergies: '' }]);

  // --- Search Logic ---
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

  // --- Data Mapping Helper ---
  const mapArraysToRows = (data) => {
    if (!data) return [];
    if (data.eye && Array.isArray(data.eye)) {
      const maxLength = Math.max((data.eye?.length || 0), (data.complaint?.length || 0));
      const rows = [];
      for (let i = 0; i < maxLength; i++) {
        rows.push({
          id: Date.now() + i,
          eye: data.eye?.[i] || '',
          complaint: data.complaint?.[i] || '',
          glass: data.glass?.[i] || '',
          duration: data.duration?.[i] || '',
          distance: data.distance?.[i] || '',
          progression: data.progression?.[i] || '',
          association: data.association?.[i] || '',
          others: ''
        });
      }
      return rows.length > 0 ? rows : null;
    }
    if (data.complaintsData && Array.isArray(data.complaintsData)) {
      return data.complaintsData.map((row, i) => ({ ...row, id: Date.now() + i }));
    }
    return null;
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setShowDropdown(false);

    if (patient.mrNo) {
      try {
        const genQuery = query(collection(db, "general_data"), where("mrNo", "==", patient.mrNo), orderBy("savedAt", "desc"), limit(1));
        const genSnap = await getDocs(genQuery);
        
        let genData = null;
        if (!genSnap.empty) genData = genSnap.docs[0].data();
        else {
           // Fallback for legacy data
           const legacyQuery = query(collection(db, "general_data"), where("mrNo", "==", patient.mrNo), orderBy("visitDate", "desc"), limit(1));
           const legacySnap = await getDocs(legacyQuery);
           if (!legacySnap.empty) genData = legacySnap.docs[0].data();
        }

        if (genData) {
          const mappedRows = mapArraysToRows(genData);
          if (mappedRows) setGeneralDataRows(mappedRows);
        }
      } catch (err) { console.error("Error fetching history:", err); }
    }
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setSearchTerm('');
    setSearchResults([]);
    setGeneralDataRows([{ id: 1, eye: '', complaint: '', glass: '', duration: '', distance: '', progression: '', association: '', others: '' }]);
    setHealthConditionRows([{ id: 1, condition: '', duration: '', investigation: '' }]);
  };

  // --- Table Logic ---
  const handleAddRow = (type) => {
    const newId = Date.now();
    const rowMap = {
      general: { id: newId, eye: '', complaint: '', glass: '', duration: '', distance: '', progression: '', association: '', others: '' },
      health: { id: newId, condition: '', duration: '', investigation: '' },
      ocular: { id: newId, eye: '', condition: '', duration: '', investigation: '' },
      medication: { id: newId, medication: '' },
      birth: { id: newId, birthHistory: '', allergies: '' }
    };
    
    if (type === 'general') setGeneralDataRows([...generalDataRows, rowMap.general]);
    if (type === 'health') setHealthConditionRows([...healthConditionRows, rowMap.health]);
    if (type === 'ocular') setOcularRows([...ocularRows, rowMap.ocular]);
    if (type === 'medication') setMedicationRows([...medicationRows, rowMap.medication]);
    if (type === 'birth') setBirthRows([...birthRows, rowMap.birth]);
  };

  const handleRemoveRow = (type, id) => {
    if (type === 'general') setGeneralDataRows(generalDataRows.filter(r => r.id !== id));
    if (type === 'health') setHealthConditionRows(healthConditionRows.filter(r => r.id !== id));
    if (type === 'ocular') setOcularRows(ocularRows.filter(r => r.id !== id));
    if (type === 'medication') setMedicationRows(medicationRows.filter(r => r.id !== id));
    if (type === 'birth') setBirthRows(birthRows.filter(r => r.id !== id));
  };

  const handleRowChange = (type, id, field, value) => {
    const update = (rows) => rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    if (type === 'general') setGeneralDataRows(update(generalDataRows));
    if (type === 'health') setHealthConditionRows(update(healthConditionRows));
    if (type === 'ocular') setOcularRows(update(ocularRows));
    if (type === 'medication') setMedicationRows(update(medicationRows));
    if (type === 'birth') setBirthRows(update(birthRows));
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
        createdAt: serverTimestamp()
      });
      alert("Bill Saved Successfully!");
      handleClearPatient();
    } catch (e) { alert("Error saving bill."); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 md:p-8 w-full h-full overflow-y-auto custom-scrollbar text-white">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-500 p-3 rounded-xl shadow-lg shadow-blue-500/20 text-white"><FaFileInvoiceDollar size={24} /></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Add Medical Bill</h1>
          <p className="text-blue-200 text-sm">Search patient and enter details.</p>
        </div>
      </div>

      {/* --- Search --- */}
      <div className="glass-panel p-6 rounded-2xl mb-8 relative z-20">
        <h2 className="text-lg font-bold mb-4">Patient Information</h2>
        {!selectedPatient ? (
          <div className="relative">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-400">
              <FaSearch className="text-blue-300 mr-3" />
              <input type="text" placeholder="Search by Name or MR No..." className="flex-1 bg-transparent outline-none text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {loading && <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>}
            </div>
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                {searchResults.map(p => (
                  <div key={p.id} onClick={() => handleSelectPatient(p)} className="p-3 hover:bg-blue-600/50 cursor-pointer border-b border-white/5">
                    <div className="font-bold">{p.name}</div>
                    <div className="text-xs text-blue-200">MR: {p.mrNo} • {p.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-full text-white"><FaUserCircle size={32} /></div>
              <div>
                <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                <div className="text-sm text-blue-200 flex gap-4 mt-1">
                  <span className="bg-blue-900/50 px-2 rounded">MR: {selectedPatient.mrNo}</span>
                  <span>{selectedPatient.age} Yrs / {selectedPatient.gender}</span>
                  <span><FaPhone className="inline mr-1"/> {selectedPatient.phone}</span>
                </div>
              </div>
            </div>
            <button onClick={handleClearPatient} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-2"><FaTimes /> Change</button>
          </div>
        )}
      </div>

      {/* --- TABLE 1: GENERAL DATA --- */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">General Data</h2>
        <div className="hidden xl:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-900/40 text-blue-200 text-xs uppercase">
              <tr>{['S.No','Eye','Chief Complaint','Glass','Duration','Distance','Progression','Association','Others','Remove'].map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {generalDataRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-3 text-center text-blue-300 align-top pt-4">{index + 1}</td>
                  <td className="p-3 align-top"><TableSelect value={row.eye} options={options.eye} onChange={(e) => handleRowChange('general', row.id, 'eye', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableSelect value={row.complaint} options={options.complaint} onChange={(e) => handleRowChange('general', row.id, 'complaint', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableSelect value={row.glass} options={options.glass} onChange={(e) => handleRowChange('general', row.id, 'glass', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableSelect value={row.duration} options={options.duration} onChange={(e) => handleRowChange('general', row.id, 'duration', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableSelect value={row.distance} options={options.distance} onChange={(e) => handleRowChange('general', row.id, 'distance', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableSelect value={row.progression} options={options.progression} onChange={(e) => handleRowChange('general', row.id, 'progression', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableSelect value={row.association} options={options.association} onChange={(e) => handleRowChange('general', row.id, 'association', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableInput value={row.others} placeholder="Details" onChange={(e) => handleRowChange('general', row.id, 'others', e.target.value)} /></td>
                  <td className="p-3 text-center align-top pt-3"><button onClick={() => handleRemoveRow('general', row.id)} className="text-red-400 hover:text-white p-2"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View for General Data */}
        <div className="xl:hidden space-y-4">
           {generalDataRows.map((row, index) => (
             <div key={row.id} className="bg-white/5 p-4 rounded-xl space-y-3 relative border border-white/10">
               <div className="absolute top-2 right-2 text-xs text-blue-500">#{index+1}</div>
               <TableSelect value={row.eye} options={options.eye} onChange={(e) => handleRowChange('general', row.id, 'eye', e.target.value)} />
               <TableSelect value={row.complaint} options={options.complaint} onChange={(e) => handleRowChange('general', row.id, 'complaint', e.target.value)} />
               <TableInput value={row.others} placeholder="Others" onChange={(e) => handleRowChange('general', row.id, 'others', e.target.value)} />
               <button onClick={() => handleRemoveRow('general', row.id)} className="w-full bg-red-500/20 text-red-300 p-2 rounded text-sm"><FaTrash className="inline mr-2"/> Remove</button>
             </div>
           ))}
        </div>
        
        <button onClick={() => handleAddRow('general')} className="mt-4 flex items-center gap-2 text-blue-300 hover:text-white text-sm"><FaPlus className="bg-blue-500/20 p-1 rounded text-lg"/> Add Row</button>
      </div>

      {/* --- TABLE 2: PATIENT HEALTH CONDITIONS --- */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Patient Health Conditions</h2>
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-900/40 text-blue-200 text-xs uppercase">
              <tr>{['S.No','Condition','Duration','Recent Investigation','Remove'].map(h => <th key={h} className="p-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {healthConditionRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-3 text-center text-blue-300 align-top pt-4">{index + 1}</td>
                  <td className="p-3 align-top"><TableSelect value={row.condition} options={options.conditions} onChange={(e) => handleRowChange('health', row.id, 'condition', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableInput value={row.duration} placeholder="Duration" onChange={(e) => handleRowChange('health', row.id, 'duration', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableInput value={row.investigation} placeholder="Investigation" onChange={(e) => handleRowChange('health', row.id, 'investigation', e.target.value)} /></td>
                  <td className="p-3 text-center align-top pt-3"><button onClick={() => handleRemoveRow('health', row.id)} className="text-red-400 hover:text-white p-2"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View for Health */}
        <div className="md:hidden space-y-4">
           {healthConditionRows.map((row, index) => (
             <div key={row.id} className="bg-white/5 p-4 rounded-xl space-y-3 relative border border-white/10">
               <TableSelect value={row.condition} options={options.conditions} onChange={(e) => handleRowChange('health', row.id, 'condition', e.target.value)} />
               <TableInput value={row.duration} placeholder="Duration" onChange={(e) => handleRowChange('health', row.id, 'duration', e.target.value)} />
               <TableInput value={row.investigation} placeholder="Investigation" onChange={(e) => handleRowChange('health', row.id, 'investigation', e.target.value)} />
               <button onClick={() => handleRemoveRow('health', row.id)} className="w-full bg-red-500/20 text-red-300 p-2 rounded text-sm"><FaTrash className="inline mr-2"/> Remove</button>
             </div>
           ))}
        </div>

        <button onClick={() => handleAddRow('health')} className="mt-4 flex items-center gap-2 text-blue-300 hover:text-white text-sm"><FaPlus className="bg-blue-500/20 p-1 rounded text-lg"/> Add Row</button>
      </div>

      {/* --- TABLE 3: OCULAR HISTORY --- */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Ocular History</h2>
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-900/40 text-blue-200 text-xs uppercase">
              <tr>{['S.No','Eye','Condition','Duration','Recent Investigation','Remove'].map(h => <th key={h} className="p-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ocularRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-3 text-center text-blue-300 align-top pt-4">{index + 1}</td>
                  <td className="p-3 align-top"><TableSelect value={row.eye} options={options.eye} onChange={(e) => handleRowChange('ocular', row.id, 'eye', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableInput value={row.condition} placeholder="Condition" onChange={(e) => handleRowChange('ocular', row.id, 'condition', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableInput value={row.duration} placeholder="Duration" onChange={(e) => handleRowChange('ocular', row.id, 'duration', e.target.value)} /></td>
                  <td className="p-3 align-top"><TableInput value={row.investigation} placeholder="Investigation" onChange={(e) => handleRowChange('ocular', row.id, 'investigation', e.target.value)} /></td>
                  <td className="p-3 text-center align-top pt-3"><button onClick={() => handleRemoveRow('ocular', row.id)} className="text-red-400 hover:text-white p-2"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => handleAddRow('ocular')} className="mt-4 flex items-center gap-2 text-blue-300 hover:text-white text-sm"><FaPlus className="bg-blue-500/20 p-1 rounded text-lg"/> Add Ocular Row</button>
      </div>

      {/* --- TABLE 4: MEDICATIONS --- */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Current Medications</h2>
        <div className="space-y-3">
          {medicationRows.map((row, index) => (
            <div key={row.id} className="flex gap-2 items-center">
              <span className="text-blue-500/50 text-xs w-6">#{index+1}</span>
              <div className="flex-1"><TableInput value={row.medication} placeholder="Enter Medication" onChange={(e) => handleRowChange('medication', row.id, 'medication', e.target.value)} /></div>
              <button onClick={() => handleRemoveRow('medication', row.id)} className="bg-red-500/20 text-red-300 p-2 rounded"><FaTrash size={12}/></button>
            </div>
          ))}
        </div>
        <button onClick={() => handleAddRow('medication')} className="mt-4 flex items-center gap-2 text-blue-300 hover:text-white text-sm"><FaPlus className="bg-blue-500/20 p-1 rounded text-lg"/> Add Row</button>
      </div>

      {/* --- TABLE 5: BIRTH HISTORY --- */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Birth History & Allergies</h2>
        <div className="space-y-4">
          {birthRows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl relative border border-white/10">
               <button onClick={() => handleRemoveRow('birth', row.id)} className="absolute top-2 right-2 text-red-400 hover:text-white"><FaTrash size={12}/></button>
               <div><label className="text-xs text-blue-300 block mb-1">Birth History</label><TableInput value={row.birthHistory} placeholder="Details" onChange={(e) => handleRowChange('birth', row.id, 'birthHistory', e.target.value)} /></div>
               <div><label className="text-xs text-blue-300 block mb-1">Allergies</label><TableInput value={row.allergies} placeholder="Allergies" onChange={(e) => handleRowChange('birth', row.id, 'allergies', e.target.value)} /></div>
            </div>
          ))}
        </div>
        <button onClick={() => handleAddRow('birth')} className="mt-4 flex items-center gap-2 text-blue-300 hover:text-white text-sm"><FaPlus className="bg-blue-500/20 p-1 rounded text-lg"/> Add Row</button>
      </div>

      <div className="flex justify-end pb-20">
        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
          {saving ? 'Saving...' : <><FaSave /> Save Bill Data</>}
        </button>
      </div>

    </div>
  );
};

export default AddBill;