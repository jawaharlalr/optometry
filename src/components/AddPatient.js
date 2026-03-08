import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { FaUserPlus, FaSave, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaIdCard, FaPhone } from 'react-icons/fa';

// --- InputGroup Component ---
// Added `maxLength` to props to restrict phone number length
const InputGroup = ({ label, icon, type = "text", name, value, onChange, placeholder, required = true, readOnly = false, options = null, maxLength }) => (
  <div className="flex flex-col gap-2">
    <label className="ml-1 text-xs font-bold tracking-wider text-blue-200 uppercase">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-300 transition-colors pointer-events-none group-focus-within:text-white">
        {icon}
      </div>
      
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="block w-full p-3 pl-10 text-sm text-white transition-all border outline-none appearance-none cursor-pointer bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white/10"
        >
          <option value="" className="text-gray-400 bg-slate-800">Select Gender</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="text-white bg-slate-800">{opt}</option>
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
          maxLength={maxLength}
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

  // Fetch and generate the next MR Number automatically
  const generateNextMR = async () => {
    try {
      const currentYear = new Date().getFullYear().toString();
      const q = query(
        collection(db, "patients"),
        orderBy("mrNo", "desc"),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const lastMR = snapshot.docs[0].data().mrNo;
        // Check if the last MR is from the current year
        if (lastMR && lastMR.startsWith(currentYear)) {
          const lastSequence = parseInt(lastMR.split('-')[1], 10);
          const nextSequence = (lastSequence + 1).toString().padStart(4, '0');
          setFormData(prev => ({ ...prev, mrNo: `${currentYear}-${nextSequence}` }));
        } else {
          // New year, start over at 0001
          setFormData(prev => ({ ...prev, mrNo: `${currentYear}-0001` }));
        }
      } else {
        // No patients in DB at all
        setFormData(prev => ({ ...prev, mrNo: `${currentYear}-0001` }));
      }
    } catch (err) {
      console.error("Error fetching latest MR No:", err);
      // Fallback in case of error
      setFormData(prev => ({ ...prev, mrNo: `${new Date().getFullYear()}-0001` }));
    }
  };

  // Run generation on component mount
  useEffect(() => {
    generateNextMR();
  }, []);

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
    
    // Strict numeric formatting for Phone Number
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, ''); // Removes all non-numeric characters
      setFormData(prev => ({ ...prev, phone: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({ mrNo: '', name: '', phone: '', dob: '', gender: '', age: '', address: '' });
    generateNextMR(); // Re-fetch the MR Number
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Extra validation check just in case
    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      // Add data to Firestore 'patients' collection
      await addDoc(collection(db, "patients"), {
        ...formData,
        age: Number(formData.age), 
        createdAt: serverTimestamp()
      });

      setSuccess('Patient added successfully!');
      
      // Reset form but generate the next MR number immediately for the next patient
      setFormData({ mrNo: '', name: '', phone: '', dob: '', gender: '', age: '', address: '' });
      await generateNextMR();

    } catch (err) {
      console.error("Error adding patient: ", err);
      setError('Failed to save patient. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full max-w-4xl p-4 mx-auto overflow-y-auto md:p-8 custom-scrollbar">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 text-white bg-blue-500 shadow-lg rounded-xl shadow-blue-500/20">
          <FaUserPlus size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Add New Patient</h2>
          <p className="text-sm text-blue-200">Enter patient details to register.</p>
        </div>
      </div>

      {/* Success/Error Notifications */}
      {success && (
        <div className="flex items-center gap-2 p-4 mb-6 text-green-200 border animate-pulse rounded-xl bg-green-500/20 border-green-500/50">
          <span>✅</span> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 text-red-200 border rounded-xl bg-red-500/20 border-red-500/50">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 md:p-8 glass-panel rounded-2xl">
        
        {/* Row 1: MR No & Name */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputGroup 
            label="MR Number" 
            name="mrNo" 
            value={formData.mrNo} 
            onChange={handleChange} 
            placeholder="Generating..." 
            icon={<FaIdCard />} 
            readOnly={true} // Made readOnly to protect sequence integrity
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputGroup 
            label="Phone Number" 
            name="phone" 
            type="tel"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="+91  9876543210" 
            icon={<FaPhone />} 
            maxLength={10} // Enforces 10 character limit
          />
          <InputGroup 
            label="Gender" 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange} 
            icon={<FaVenusMars />} 
            options={['Male', 'Female', 'Transgender', 'Other']}
          />
        </div>

        {/* Row 3: DOB & Age */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputGroup 
            label="Date of Birth" 
            name="dob" 
            type="date"
            value={formData.dob} 
            onChange={handleChange} 
            icon={<FaCalendarAlt />} 
          />
          <InputGroup 
            label="Age" 
            name="age" 
            type="number"
            value={formData.age} 
            readOnly={true}
            placeholder="0" 
            icon={<span className="text-xs font-bold">AGE</span>} 
          />
        </div>

        {/* Row 4: Address */}
        <div className="flex flex-col gap-2">
          <label className="ml-1 text-xs font-bold tracking-wider text-blue-200 uppercase">Address</label>
          <div className="relative group">
            <div className="absolute left-0 flex items-center pl-3 text-blue-300 transition-colors pointer-events-none top-3 group-focus-within:text-white">
              <FaMapMarkerAlt />
            </div>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter full residential address..."
              className="block w-full p-3 pl-10 text-sm text-white transition-all border outline-none resize-none bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white/10 placeholder-blue-300/50"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
            <button 
                type="button"
                className="px-6 py-2 text-blue-200 transition-all rounded-xl hover:text-white hover:bg-white/10"
                onClick={handleClear}
            >
                Clear
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all transform shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl shadow-blue-900/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin border-white/30 border-t-white"></div>
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