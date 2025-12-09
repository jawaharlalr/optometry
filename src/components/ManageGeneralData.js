import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  FaTrash, 
  FaEye, 
  FaTimes, 
  FaCalendarAlt, 
  FaListUl, 
  FaNotesMedical, 
  FaGlasses, 
  FaClock, 
  FaRulerHorizontal, 
  FaChartLine, 
  FaLink,
  FaEdit,
  FaSave
} from 'react-icons/fa';

// --- Helper: Detail Card for Modal (Handles Display & Editing) ---
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
        {/* Show message if empty in edit mode */}
        {isEditing && items.length === 0 && (
            <p className="text-white/30 text-xs italic">No items to edit.</p>
        )}
      </div>
    </div>
  );
};

// --- Modal for Viewing & Editing Details ---
const DataViewModal = ({ data, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [saving, setSaving] = useState(false);

  if (!data) return null;

  // Handle Input Changes in Array
  const handleArrayChange = (category, index, value) => {
    const updatedArray = [...formData[category]];
    updatedArray[index] = value;
    setFormData({ ...formData, [category]: updatedArray });
  };

  // Save Changes to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "general_data", data.id);
      
      // Create a clean object to save (exclude ID and DateObj)
      const { id, dateObj, ...dataToSave } = formData;
      
      await updateDoc(docRef, dataToSave);
      
      // Update parent state
      onUpdate(formData); 
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...data }); // Reset changes
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl animate-fade-in flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-purple-600/20">
          <div>
            <h3 className="text-xl font-bold text-white">
              {isEditing ? 'Edit General Record' : 'General Data Record'}
            </h3>
            <p className="text-blue-200 text-xs flex items-center gap-2 mt-1">
              <FaCalendarAlt /> 
              {data.dateObj?.toLocaleString() || 'Unknown Date'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar flex-1">
           <DetailSection 
             title="Eye" 
             icon={<FaEye />} 
             items={formData.eye} 
             category="eye"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           <DetailSection 
             title="Chief Complaint" 
             icon={<FaNotesMedical />} 
             items={formData.complaint} 
             category="complaint"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           <DetailSection 
             title="Glass" 
             icon={<FaGlasses />} 
             items={formData.glass} 
             category="glass"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           <DetailSection 
             title="Duration" 
             icon={<FaClock />} 
             items={formData.duration} 
             category="duration"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           <DetailSection 
             title="Distance" 
             icon={<FaRulerHorizontal />} 
             items={formData.distance} 
             category="distance"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           <DetailSection 
             title="Progression" 
             icon={<FaChartLine />} 
             items={formData.progression} 
             category="progression"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           <DetailSection 
             title="Association" 
             icon={<FaLink />} 
             items={formData.association} 
             category="association"
             isEditing={isEditing}
             onChange={handleArrayChange}
           />
           
           {/* Fallback if no data */}
           {!isEditing && Object.keys(data).length <= 2 && (
             <div className="col-span-full text-center text-white/50 py-8">
               No detailed data fields found.
             </div>
           )}
        </div>

        {/* Modal Footer (Action Buttons) */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-red-300 hover:bg-white/5 transition text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition"
              >
                {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition"
            >
              <FaEdit /> Edit Record
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// --- Main Manage Component ---
const ManageGeneralData = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "general_data"));
      const list = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.savedAt || data.visitDate;
        return {
          id: doc.id,
          ...data,
          dateObj: timestamp ? timestamp.toDate() : new Date()
        };
      });
      
      list.sort((a, b) => b.dateObj - a.dateObj);
      setRecords(list);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this health record?")) {
      try {
        await deleteDoc(doc(db, "general_data", id));
        setRecords(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert("Error deleting record");
      }
    }
  };

  // Handle update from modal
  const handleLocalUpdate = (updatedRecord) => {
    setRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
  };

  return (
    <div className="p-4 md:p-8 w-full h-full overflow-y-auto custom-scrollbar">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage General Data</h2>
          <p className="text-blue-200 text-sm">View recorded complaints.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="p-8 text-center text-blue-200 flex flex-col items-center gap-2">
             <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
             Loading Records...
           </div>
        ) : records.length === 0 ? (
           <div className="p-20 text-center text-blue-300 opacity-60 flex flex-col items-center">
             <FaNotesMedical size={48} className="mb-4 text-white/20"/>
             <p>No health records found.</p>
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-purple-900/40 text-purple-200 uppercase text-xs font-semibold sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-4 w-48">Date Recorded</th>
                <th className="p-4 hidden md:table-cell">Data Summary</th>
                <th className="p-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors group">
                  
                  {/* Date Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3 text-white font-medium">
                      <div className="bg-blue-500/20 p-2 rounded-lg text-blue-300">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <div>{rec.dateObj.toLocaleDateString()}</div>
                        <div className="text-xs text-white/50">{rec.dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                    </div>
                  </td>

                  {/* Summary Column */}
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-2">
                      {rec.complaint?.length > 0 && (
                        <span className="bg-purple-500/20 text-purple-200 text-xs px-2 py-1 rounded border border-purple-500/30">
                           {rec.complaint.length} Complaint(s)
                        </span>
                      )}
                      {rec.eye?.length > 0 && (
                        <span className="bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded border border-blue-500/30">
                           {rec.eye.length} Eye Info
                        </span>
                      )}
                      {rec.glass?.length > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-200 text-xs px-2 py-1 rounded border border-emerald-500/30">
                           Glass Info
                        </span>
                      )}
                       {!rec.complaint?.length && !rec.eye?.length && (
                         <span className="text-white/30 italic text-sm">No data details</span>
                       )}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => setSelectedRecord(rec)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-900/20"
                        title="View Full Details"
                      >
                        <FaListUl />
                      </button>
                      <button 
                        onClick={() => handleDelete(rec.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/20"
                        title="Delete Record"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Render Modal */}
      {selectedRecord && (
        <DataViewModal 
          data={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onUpdate={handleLocalUpdate}
        />
      )}
    </div>
  );
};

export default ManageGeneralData;