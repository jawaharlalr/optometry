import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FaTrash, FaEye, FaEdit, FaSave, FaTimes, FaSearch, FaUserMd } from 'react-icons/fa';

// --- HELPER: Dynamically calculate age based on DOB ---
const calculateAge = (dobString) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  // Adjust if birthday hasn't occurred yet this year
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

// --- HELPER COMPONENT (Moved OUTSIDE to prevent focus loss during typing) ---
const DetailRow = ({ label, name, type = "text", value, editable = true, maxLength, isEditing, onChange }) => (
  <div className="flex flex-col py-3 border-b md:flex-row md:items-center border-white/10 last:border-0">
    <span className="w-32 text-xs font-semibold tracking-wider text-blue-300 uppercase">{label}:</span>
    {isEditing ? (
      editable && name !== 'mrNo' ? ( 
        // Editable Input
        <input 
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          maxLength={maxLength}
          className="flex-1 px-3 py-1 text-white border rounded outline-none bg-white/10 border-white/20 focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        // Read-Only Input for DOB, Age, Gender, MR No
        <input 
          type={type}
          name={name}
          value={value || ''}
          readOnly
          title={`${label} is non-editable`}
          className="flex-1 px-3 py-1 border rounded cursor-not-allowed bg-black/40 text-white/50 border-white/5 focus:outline-none"
        />
      )
    ) : (
      // View Mode Display
      <span className="flex-1 font-medium text-white">{value || '-'}</span>
    )}
  </div>
);

// --- SUB-COMPONENT: Patient Details Modal ---
const PatientModal = ({ patient, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...patient });
  const [saving, setSaving] = useState(false);

  // Update local form data when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Specifically handle phone to strictly allow numbers only
    if (name === 'phone') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle Save Logic
  const handleSave = async () => {
    setSaving(true);
    try {
      const patientRef = doc(db, "patients", patient.id);
      // Remove 'id' from data before sending to Firestore
      const { id, ...dataToUpdate } = formData; 

      await updateDoc(patientRef, dataToUpdate);
      onUpdate(formData); // Update parent state
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("Failed to update patient.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-fade-in custom-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-blue-600/20">
          <div className="flex items-center gap-3">
            <div className="p-2 text-white bg-blue-500 rounded-lg">
               <FaUserMd />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Patient Details' : 'Patient Details'}
              </h3>
              <p className="text-xs text-blue-200">{formData.mrNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 transition rounded-full text-white/70 hover:text-white hover:bg-white/10">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-2">
           <DetailRow label="MR Number" name="mrNo" value={formData.mrNo} editable={false} isEditing={isEditing} onChange={handleChange} />
           <DetailRow label="Full Name" name="name" value={formData.name} editable={true} isEditing={isEditing} onChange={handleChange} />
           <DetailRow label="Phone" name="phone" type="tel" value={formData.phone} editable={true} maxLength={10} isEditing={isEditing} onChange={handleChange} />
           
           {/* These fields are non-editable */}
           <DetailRow label="Gender" name="gender" value={formData.gender} editable={false} isEditing={isEditing} onChange={handleChange} />
           <DetailRow label="DOB" name="dob" type="date" value={formData.dob} editable={false} isEditing={isEditing} onChange={handleChange} />
           <DetailRow label="Age" name="age" type="number" value={formData.age} editable={false} isEditing={isEditing} onChange={handleChange} />
           
           <div className="flex flex-col py-3">
              <span className="mb-2 text-xs font-semibold tracking-wider text-blue-300 uppercase">Address:</span>
              {isEditing ? (
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 text-white border rounded outline-none bg-white/10 border-white/20 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="p-3 border rounded-lg text-white/90 bg-white/5 border-white/5">
                  {formData.address || 'No address provided.'}
                </p>
              )}
           </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/10 bg-black/20">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setFormData(patient); }} 
                className="px-4 py-2 text-sm text-red-300 transition rounded-xl hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 text-white transition bg-green-500 shadow-lg hover:bg-green-600 rounded-xl disabled:opacity-50"
              >
                {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-2 px-6 py-2 text-white transition bg-blue-500 shadow-lg hover:bg-blue-600 rounded-xl"
            >
              <FaEdit /> Edit Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT: Manage Patients ---
const ManagePatient = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null); // For Modal

  // Fetch Data
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "patients"));
      const patientsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Calculate exact age dynamically on fetch based on stored DOB
          age: data.dob ? calculateAge(data.dob) : data.age 
        };
      });
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    const results = patients.filter(patient => 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient record? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "patients", id));
        // Remove from local state to avoid refresh
        setPatients(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("Failed to delete patient");
      }
    }
  };

  // Handle Update from Modal
  const handleLocalUpdate = (updatedData) => {
    setPatients(prev => prev.map(p => (p.id === updatedData.id ? updatedData : p)));
  };

  return (
    <div className="relative w-full h-full p-4 overflow-y-auto md:p-8 custom-scrollbar">
      
      {/* Header & Search */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Patients</h2>
          <p className="text-sm text-blue-200">View, Edit, or Delete patient records.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-300 pointer-events-none">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search Name, Phone or MR No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2.5 pl-10 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-col overflow-hidden glass-panel rounded-2xl min-h-[400px]">
        {loading ? (
           <div className="flex items-center justify-center flex-1 text-blue-200">
              <div className="w-8 h-8 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
              Loading Records...
           </div>
        ) : filteredPatients.length === 0 ? (
           <div className="flex flex-col items-center justify-center flex-1 text-blue-300 opacity-60">
              <FaUserMd size={48} className="mb-2" />
              <p>No patients found.</p>
           </div>
        ) : (
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 text-xs font-semibold tracking-wide text-blue-200 uppercase backdrop-blur-md bg-blue-900/40">
                <tr>
                  <th className="w-16 p-4 text-center">S.No</th>
                  <th className="p-4">MR Number</th>
                  <th className="p-4">Patient Name</th>
                  <th className="w-32 p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id} className="transition-colors hover:bg-white/5 group">
                    <td className="p-4 font-mono text-sm text-center text-blue-300/70">
                      {index + 1}
                    </td>
                    <td className="p-4 font-medium text-white">
                      {patient.mrNo}
                    </td>
                    <td className="p-4 text-blue-100">
                      {patient.name}
                      <span className="block text-[10px] text-blue-400 md:hidden">{patient.phone}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          className="p-2 text-blue-300 transition-all rounded-lg shadow-sm bg-blue-500/20 hover:bg-blue-500 hover:text-white"
                          title="View/Edit Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 text-red-300 transition-all rounded-lg shadow-sm bg-red-500/20 hover:bg-red-500 hover:text-white"
                          title="Delete Record"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Render Modal if a patient is selected */}
      {selectedPatient && (
        <PatientModal 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
          onUpdate={handleLocalUpdate}
        />
      )}
    </div>
  );
};

export default ManagePatient;