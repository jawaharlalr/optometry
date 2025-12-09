import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaUserPlus, FaSave, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaIdCard, FaPhone } from 'react-icons/fa';

// --- MOVE THIS COMPONENT OUTSIDE ---
const InputGroup = ({ label, icon, type = "text", name, value, onChange, placeholder, required = true, readOnly = false, options = null }) => (
  <div className="flex flex-col gap-2">
    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300 group-focus-within:text-white transition-colors">
        {icon}
      </div>
      
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl block pl-10 p-3 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all appearance-none cursor-pointer"
        >
          <option value="" className="bg-slate-800 text-gray-400">Select Gender</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-slate-800 text-white">{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={`w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl block pl-10 p-3 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all placeholder-blue-300/50 
            ${readOnly ? 'cursor-not-allowed opacity-70 bg-black/20' : ''}`}
        />
      )}
    </div>
  </div>
);
// -----------------------------------

const AddPatient = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    mrNo: '',
    name: '',
    phone: '',
    dob: '',
    gender: '',
    age: '',
    address: ''
  });

  // Auto-calculate Age when DOB changes
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      
      // Adjust if birthday hasn't occurred yet this year
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      // Prevent negative age
      setFormData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Add data to Firestore 'patients' collection
      await addDoc(collection(db, "patients"), {
        ...formData,
        age: Number(formData.age), 
        createdAt: serverTimestamp()
      });

      setSuccess('Patient added successfully!');
      // Reset form
      setFormData({
        mrNo: '', name: '', phone: '', dob: '', gender: '', age: '', address: ''
      });
    } catch (err) {
      console.error("Error adding patient: ", err);
      setError('Failed to save patient. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-500 p-3 rounded-xl shadow-lg shadow-blue-500/20 text-white">
          <FaUserPlus size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Add New Patient</h2>
          <p className="text-blue-200 text-sm">Enter patient details to register.</p>
        </div>
      </div>

      {/* Success/Error Notifications */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200 flex items-center gap-2 animate-pulse">
          <span>✅</span> {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl space-y-6">
        
        {/* Row 1: MR No & Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup 
            label="MR Number" 
            name="mrNo" 
            value={formData.mrNo} 
            onChange={handleChange} 
            placeholder="e.g. 2025-0001" 
            icon={<FaIdCard />} 
          />
          <InputGroup 
            label="Full Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="John Doe" 
            icon={<FaUserPlus />} 
          />
        </div>

        {/* Row 2: Phone & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup 
            label="Phone Number" 
            name="phone" 
            type="tel"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="+91 " 
            icon={<FaPhone />} 
          />
          <InputGroup 
            label="Gender" 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange} 
            icon={<FaVenusMars />} 
            options={['Male', 'Female', 'Other']}
          />
        </div>

        {/* Row 3: DOB & Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup 
            label="Date of Birth" 
            name="dob" 
            type="date"
            value={formData.dob} 
            onChange={handleChange} 
            icon={<FaCalendarAlt />} 
          />
          <InputGroup 
            label="Age (Auto)" 
            name="age" 
            type="number"
            value={formData.age} 
            readOnly={true}
            placeholder="0" 
            icon={<span className="font-bold text-xs">AGE</span>} 
          />
        </div>

        {/* Row 4: Address */}
        <div className="flex flex-col gap-2">
          <label className="text-blue-200 text-xs font-bold uppercase tracking-wider ml-1">Address</label>
          <div className="relative group">
            <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none text-blue-300 group-focus-within:text-white transition-colors">
              <FaMapMarkerAlt />
            </div>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter full residential address..."
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl block pl-10 p-3 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all placeholder-blue-300/50 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-4">
            <button 
                type="button"
                className="px-6 py-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setFormData({mrNo: '', name: '', phone: '', dob: '', gender: '', age: '', address: ''})}
            >
                Clear
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/50 transform active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Patient
                  </>
                )}
            </button>
        </div>

      </form>
    </div>
  );
};

export default AddPatient;