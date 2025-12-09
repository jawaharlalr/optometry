import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaHeartbeat, 
  FaClipboardList
} from 'react-icons/fa';

// --- Reusable Input Section Component ---
const InputSection = ({ label, icon, items, onAdd, onChange, onRemove, placeholder }) => (
  <div className="glass-panel p-4 rounded-xl mb-4 border border-white/5">
    <div className="flex items-center gap-2 mb-4 text-blue-200">
      {icon}
      <h4 className="font-semibold text-sm uppercase tracking-wider">{label}</h4>
    </div>

    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder-blue-300/30"
          />
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white p-3 rounded-lg transition-colors"
            >
              <FaTrash size={14} />
            </button>
          )}
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={onAdd}
      className="mt-4 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
    >
      <FaPlus /> Add More
    </button>
  </div>
);

const AddHealthData = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Single State for Conditions list
  const [conditions, setConditions] = useState(['']);

  // Handlers
  const handleAdd = () => {
    setConditions([...conditions, '']);
  };

  const handleRemove = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleChange = (index, value) => {
    const updatedList = [...conditions];
    updatedList[index] = value;
    setConditions(updatedList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty strings
      const cleanConditions = conditions.filter(item => item.trim() !== '');

      if (cleanConditions.length === 0) {
        alert("Please enter at least one condition.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "health_data"), {
        conditions: cleanConditions,
        savedAt: serverTimestamp()
      });

      setSuccess('Conditions saved successfully!');
      setConditions(['']); // Reset form

    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-3xl mx-auto h-full overflow-y-auto custom-scrollbar">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg text-white">
          <FaClipboardList size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add Patient Health Conditions</h2>
          <p className="text-blue-200 text-sm">Record medical conditions (e.g., Diabetes, Allergies)</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200 flex items-center gap-2 animate-pulse">
          <span>✅</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Single Conditions Input Section */}
        <InputSection 
          label="Conditions" 
          icon={<FaHeartbeat />} 
          items={conditions} 
          placeholder="Enter condition (e.g. Diabetes, BP, Allergy)"
          onAdd={handleAdd}
          onRemove={handleRemove}
          onChange={handleChange}
        />

        {/* Save Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all mt-4"
        >
          {loading ? <span>Saving...</span> : <><FaSave /> Save Conditions</>}
        </button>

      </form>
    </div>
  );
};

export default AddHealthData;