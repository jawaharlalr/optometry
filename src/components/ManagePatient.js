import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FaTrash, FaEye, FaEdit, FaSave, FaTimes, FaSearch, FaUserMd } from 'react-icons/fa';

// --- SUB-COMPONENT: Patient Details Modal ---
const PatientModal = ({ patient, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...patient });
  const [saving, setSaving] = useState(false);

  // Update local form data when input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Save Logic
  const handleSave = async () => {
    setSaving(true);
    try {
      const patientRef = doc(db, "patients", patient.id);
      // Remove 'id' from data before sending to Firestore
      const { id, ...dataToUpdate } = formData; 
      
      // Auto-recalculate age if DOB changed (optional safety)
      if (dataToUpdate.dob) {
        const birthDate = new Date(dataToUpdate.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        dataToUpdate.age = age;
      }

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

  // Helper to render a field line
  const DetailRow = ({ label, name, type = "text", value }) => (
    <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-white/10 last:border-0">
      <span className="text-blue-300 font-semibold w-32 uppercase text-xs tracking-wider">{label}:</span>
      {isEditing && name !== 'mrNo' ? ( // Prevent editing MR No
        <input 
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span className="text-white flex-1 font-medium">{value || '-'}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-blue-600/20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
               <FaUserMd />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Patient Details' : 'Patient Details'}
              </h3>
              <p className="text-xs text-blue-200">{formData.mrNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-2">
           <DetailRow label="MR Number" name="mrNo" value={formData.mrNo} />
           <DetailRow label="Full Name" name="name" value={formData.name} />
           <DetailRow label="Phone" name="phone" type="tel" value={formData.phone} />
           <DetailRow label="Gender" name="gender" value={formData.gender} />
           <DetailRow label="DOB" name="dob" type="date" value={formData.dob} />
           <DetailRow label="Age" name="age" type="number" value={formData.age} />
           
           <div className="flex flex-col py-3">
              <span className="text-blue-300 font-semibold uppercase text-xs tracking-wider mb-2">Address:</span>
              {isEditing ? (
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-white/90 bg-white/5 p-3 rounded-lg border border-white/5">
                  {formData.address || 'No address provided.'}
                </p>
              )}
           </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setFormData(patient); }} 
                className="px-4 py-2 rounded-xl text-sm text-red-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg transition"
              >
                {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg transition"
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
      const patientsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      patient.mrNo?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="p-4 md:p-8 w-full h-full overflow-y-auto custom-scrollbar relative">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Patients</h2>
          <p className="text-blue-200 text-sm">View, Edit, or Delete patient records.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search Name or MR No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        {loading ? (
           <div className="flex-1 flex items-center justify-center text-blue-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-2"></div>
              Loading Records...
           </div>
        ) : filteredPatients.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-blue-300 opacity-60">
              <FaUserMd size={48} className="mb-2" />
              <p>No patients found.</p>
           </div>
        ) : (
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-900/40 text-blue-200 uppercase text-xs font-semibold sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="p-4 w-16 text-center">S.No</th>
                  <th className="p-4">MR Number</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4 text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-center text-blue-300/70 font-mono text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4 text-white font-medium">
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
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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