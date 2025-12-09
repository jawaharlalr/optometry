import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  FaTrash,  
  FaTimes, 
  FaCalendarAlt, 
  FaListUl, 
  FaHeartbeat, 
  FaEdit,
  FaSave
} from 'react-icons/fa';

// --- Helper: Detail Section (View/Edit) ---
const DetailSection = ({ title, icon, items, isEditing, category, onChange }) => {
  if ((!items || items.length === 0) && !isEditing) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all">
      <div className="flex items-center gap-2 mb-3 text-blue-200 border-b border-white/5 pb-2">
        {icon}
        <h4 className="font-bold text-sm uppercase tracking-wide">{title}</h4>
      </div>
      
      <div className="flex flex-col gap-2">
        {items && items.map((item, idx) => (
          <div key={idx} className="flex-1">
            {isEditing ? (
              <input 
                type="text" 
                value={item} 
                onChange={(e) => onChange(category, idx, e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            ) : (
              <span className="inline-block bg-blue-600/20 text-blue-100 text-sm px-3 py-1 rounded-lg border border-blue-500/30 mr-2 mb-2">
                {item}
              </span>
            )}
          </div>
        ))}
        {isEditing && items.length === 0 && <p className="text-white/30 text-xs italic">No items to edit.</p>}
      </div>
    </div>
  );
};

// --- Modal Component ---
const HealthModal = ({ data, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [saving, setSaving] = useState(false);

  // Handle changes in the conditions array
  const handleArrayChange = (category, index, value) => {
    const updatedArray = [...formData[category]];
    updatedArray[index] = value;
    setFormData({ ...formData, [category]: updatedArray });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Exclude UI-only fields like dateObj from Firestore update
      const { id, dateObj, ...dataToSave } = formData;
      
      await updateDoc(doc(db, "health_data", data.id), dataToSave);
      onUpdate(formData); 
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-blue-600/20">
          <div>
            <h3 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Health Record' : 'Health Record Details'}
            </h3>
            <p className="text-blue-200 text-xs flex items-center gap-2 mt-1">
              <FaCalendarAlt /> {data.dateObj?.toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
           <DetailSection 
             title="Patient Conditions" 
             icon={<FaHeartbeat />} 
             items={formData.conditions} 
             category="conditions"
             isEditing={isEditing} 
             onChange={handleArrayChange}
           />
           
           {/* Fallback if data is empty/old schema */}
           {!isEditing && (!formData.conditions || formData.conditions.length === 0) && (
              <div className="text-center text-white/40 py-8 italic">
                  No conditions recorded.
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => {setFormData(data); setIsEditing(false);}} 
                className="px-4 py-2 text-red-300 hover:text-white transition text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
              >
                {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
            >
              <FaEdit /> Edit Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const ManageHealthData = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "health_data"));
        const list = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp = data.savedAt;
          return {
            id: doc.id,
            ...data,
            dateObj: timestamp ? timestamp.toDate() : new Date()
          };
        });
        list.sort((a, b) => b.dateObj - a.dateObj);
        setRecords(list);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      await deleteDoc(doc(db, "health_data", id));
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdate = (updated) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  return (
    <div className="p-4 md:p-8 w-full h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Health Data</h2>
          <p className="text-blue-200 text-sm">View and edit patient medical conditions.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="p-8 text-center text-blue-200">Loading Records...</div>
        ) : records.length === 0 ? (
           <div className="p-20 text-center text-blue-300 opacity-60 flex flex-col items-center">
             <FaHeartbeat size={48} className="mb-4 text-white/20"/>
             <p>No health data records found.</p>
           </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-blue-900/40 text-blue-200 uppercase text-xs font-semibold sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-4">Date Recorded</th>
                <th className="p-4 hidden md:table-cell">Summary</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white">
                    <div className="font-medium">{rec.dateObj.toLocaleDateString()}</div>
                    <div className="text-xs text-white/50">{rec.dateObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </td>
                  
                  {/* Summary Column - Counts Conditions */}
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-2">
                       {rec.conditions?.length > 0 ? (
                         <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded border border-purple-500/30">
                           {rec.conditions.length} Condition(s) Recorded
                         </span>
                       ) : (
                         <span className="text-white/30 italic text-sm">No conditions</span>
                       )}
                    </div>
                  </td>
                  
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => setSelectedRecord(rec)} 
                      className="p-2 bg-blue-500/20 text-blue-300 hover:text-white rounded-lg hover:bg-blue-500 transition-all"
                    >
                      <FaListUl />
                    </button>
                    <button 
                      onClick={() => handleDelete(rec.id)} 
                      className="p-2 bg-red-500/20 text-red-300 hover:text-white rounded-lg hover:bg-red-500 transition-all"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedRecord && <HealthModal data={selectedRecord} onClose={() => setSelectedRecord(null)} onUpdate={handleUpdate} />}
    </div>
  );
};

export default ManageHealthData;