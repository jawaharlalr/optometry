import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  FaSave, 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaNotesMedical, 
  FaGlasses, 
  FaClock, 
  FaRulerHorizontal, 
  FaChartLine, 
  FaLink 
} from 'react-icons/fa';

// --- Reusable Component for Each Section (The "Card") ---
const InputSection = ({ label, icon, items, onAdd, onChange, onRemove, placeholder }) => (
  <div className="glass-panel p-4 rounded-xl mb-4 border border-white/5">
    {/* Section Header */}
    <div className="flex items-center gap-2 mb-4 text-blue-200">
      {icon}
      <h4 className="font-semibold text-sm uppercase tracking-wider">{label}</h4>
    </div>

    {/* List of Inputs */}
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

    {/* Add Button */}
    <button
      type="button"
      onClick={onAdd}
      className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-900/50"
    >
      <FaPlus /> Add More
    </button>
  </div>
);

const AddGeneralData = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Independent State for each category
  const [formData, setFormData] = useState({
    eye: [''],
    complaint: [''],
    glass: [''],
    duration: [''],
    distance: [''],
    progression: [''],
    association: ['']
  });

  // Generic Handler to Add a new empty field
  const handleAdd = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Generic Handler to Remove a field
  const handleRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Generic Handler to Update text
  const handleChange = (field, index, value) => {
    const updatedList = [...formData[field]];
    updatedList[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: updatedList
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty strings before saving
      const cleanData = Object.keys(formData).reduce((acc, key) => {
        acc[key] = formData[key].filter(item => item.trim() !== '');
        return acc;
      }, {});

      await addDoc(collection(db, "general_data"), {
        ...cleanData,
        savedAt: serverTimestamp()
      });

      setSuccess('Data saved successfully!');
      
      // Reset Form to initial state
      setFormData({
        eye: [''],
        complaint: [''],
        glass: [''],
        duration: [''],
        distance: [''],
        progression: [''],
        association: ['']
      });

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
      
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-2xl font-bold text-white">Add Patient Health Data</h2>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200 flex items-center gap-2">
          <span>✅</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        
        {/* 1. Eye Section */}
        <InputSection 
          label="Eye" 
          icon={<FaEye />} 
          items={formData.eye} 
          placeholder="e.g. LE, RE, BE"
          onAdd={() => handleAdd('eye')}
          onRemove={(idx) => handleRemove('eye', idx)}
          onChange={(idx, val) => handleChange('eye', idx, val)}
        />

        {/* 2. Chief Complaint */}
        <InputSection 
          label="Chief Complaint" 
          icon={<FaNotesMedical />} 
          items={formData.complaint} 
          placeholder="e.g. Blurring of vision"
          onAdd={() => handleAdd('complaint')}
          onRemove={(idx) => handleRemove('complaint', idx)}
          onChange={(idx, val) => handleChange('complaint', idx, val)}
        />

        {/* 3. Glass */}
        <InputSection 
          label="Glass" 
          icon={<FaGlasses />} 
          items={formData.glass} 
          placeholder="e.g. Using for 2 years"
          onAdd={() => handleAdd('glass')}
          onRemove={(idx) => handleRemove('glass', idx)}
          onChange={(idx, val) => handleChange('glass', idx, val)}
        />

        {/* 4. Duration */}
        <InputSection 
          label="Duration" 
          icon={<FaClock />} 
          items={formData.duration} 
          placeholder="e.g. Since 2 months"
          onAdd={() => handleAdd('duration')}
          onRemove={(idx) => handleRemove('duration', idx)}
          onChange={(idx, val) => handleChange('duration', idx, val)}
        />

        {/* 5. Distance */}
        <InputSection 
          label="Distance" 
          icon={<FaRulerHorizontal />} 
          items={formData.distance} 
          placeholder="e.g. Near / Far"
          onAdd={() => handleAdd('distance')}
          onRemove={(idx) => handleRemove('distance', idx)}
          onChange={(idx, val) => handleChange('distance', idx, val)}
        />

        {/* 6. Progression */}
        <InputSection 
          label="Progression" 
          icon={<FaChartLine />} 
          items={formData.progression} 
          placeholder="e.g. Gradual / Sudden"
          onAdd={() => handleAdd('progression')}
          onRemove={(idx) => handleRemove('progression', idx)}
          onChange={(idx, val) => handleChange('progression', idx, val)}
        />

        {/* 7. Association */}
        <InputSection 
          label="Association" 
          icon={<FaLink />} 
          items={formData.association} 
          placeholder="e.g. Headache, Redness"
          onAdd={() => handleAdd('association')}
          onRemove={(idx) => handleRemove('association', idx)}
          onChange={(idx, val) => handleChange('association', idx, val)}
        />

        {/* Save Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all mt-8"
        >
          {loading ? (
             <span>Saving...</span>
          ) : (
             <><FaSave /> Save Health Data</>
          )}
        </button>

      </form>
    </div>
  );
};

export default AddGeneralData;