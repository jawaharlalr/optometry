import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFileInvoiceDollar, 
  FaTimes, 
  FaUser, 
  FaCalendarAlt, 
  FaNotesMedical, 
  FaPills,
  FaBaby,
  FaEye as FaEyeIcon,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaBirthdayCake
} from 'react-icons/fa';

// ---> NEW: Import the PDF Generator <---
import { generateBillPDF } from '../utils/generatePDF'; 

// --- Sub-Component: Bill Details Modal ---
const BillModal = ({ bill, onClose }) => {
  if (!bill) return null;

  // Extract Patient Details safely from nested objects or flat fields
  const pDetails = bill.patient || bill.patientDetails || {};
  
  const pName = bill.patientName || pDetails.name || 'Unknown';
  const pMR = bill.mrNo || bill.patientMR || pDetails.mrNo || 'N/A';
  const pPhone = pDetails.phone || 'N/A';
  const pAge = pDetails.age || 'N/A';
  const pGender = pDetails.gender || 'N/A';
  const pAddress = pDetails.address || 'N/A';

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const SectionTable = ({ title, icon, columns, data }) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className="flex items-center gap-2 pb-2 mb-3 text-sm font-bold tracking-wide text-blue-300 uppercase border-b border-white/10">
          {icon} {title}
        </h4>
        <div className="overflow-x-auto border bg-white/5 rounded-xl border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="text-blue-200 bg-black/20">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3 font-semibold whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {data.map((row, idx) => (
                <tr key={idx} className="transition-colors hover:bg-white/5">
                  {title === 'General Data' && (
                    <>
                      <td className="p-3">{row.eye}</td>
                      <td className="p-3">{row.complaint}</td>
                      <td className="p-3">{row.glass}</td>
                      <td className="p-3">{row.duration}</td>
                      <td className="p-3">{row.distance}</td>
                    </>
                  )}
                  {title === 'Health Conditions' && (
                    <>
                      <td className="p-3">{typeof row === 'string' ? row : row.condition}</td>
                      <td className="p-3">{row.duration}</td>
                      <td className="p-3">{row.investigation}</td>
                    </>
                  )}
                  {title === 'Ocular History' && (
                    <>
                      <td className="p-3">{row.eye}</td>
                      <td className="p-3">{row.condition}</td>
                      <td className="p-3">{row.duration}</td>
                      <td className="p-3">{row.investigation}</td>
                    </>
                  )}
                  {title === 'Medications' && (
                    <td className="p-3">{row.medication}</td>
                  )}
                  {title === 'Birth History' && (
                    <>
                      <td className="p-3">{row.birthHistory}</td>
                      <td className="p-3">{row.allergies}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl flex flex-col border border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/40 to-blue-800/40">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white">
              <FaFileInvoiceDollar className="text-blue-400"/> Medical Bill Details
            </h3>
            <p className="flex items-center gap-2 mt-1 text-xs text-blue-200">
              <FaCalendarAlt /> Generated on: {formatDate(bill.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 transition-all rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20"><FaTimes size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* --- FULL PATIENT DETAILS CARD --- */}
          <div className="p-6 border bg-white/5 border-white/10 rounded-2xl">
            <h4 className="pb-2 mb-4 text-xs font-bold tracking-wider text-blue-300 uppercase border-b border-white/5">Patient Information</h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              
              {/* Column 1: Identity */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 text-blue-300 rounded-lg bg-blue-500/20"><FaUser /></div>
                  <div>
                    <p className="text-xs text-blue-400">Name</p>
                    <p className="text-lg font-bold text-white">{pName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 font-mono text-sm text-purple-300 rounded-lg bg-purple-500/20">MR</div>
                  <div>
                    <p className="text-xs text-blue-400">MR Number</p>
                    <p className="font-mono text-white">{pMR}</p>
                  </div>
                </div>
              </div>

              {/* Column 2: Demographics */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaBirthdayCake className="text-blue-500/50" />
                  <span className="text-white">{pAge} Years Old</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaVenusMars className="text-blue-500/50" />
                  <span className="text-white">{pGender}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-blue-500/50" />
                  <span className="font-mono text-white">{pPhone}</span>
                </div>
              </div>

              {/* Column 3: Address */}
              <div>
                 <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="mt-1 text-red-400" />
                    <div>
                      <p className="mb-1 text-xs text-blue-400">Address</p>
                      <p className="p-3 text-sm leading-relaxed border rounded-lg text-white/80 bg-black/20 border-white/5">
                        {pAddress}
                      </p>
                    </div>
                 </div>
              </div>

            </div>
          </div>

          {/* --- CLINICAL DATA TABLES --- */}
          <div>
            <SectionTable title="General Data" icon={<FaEyeIcon />} columns={['Eye', 'Complaint', 'Glass', 'Duration', 'Distance']} data={bill.generalData || bill.generalDataSnapshot} />
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionTable title="Health Conditions" icon={<FaNotesMedical />} columns={['Condition', 'Duration', 'Inv.']} data={bill.healthConditions || bill.healthDataSnapshot} />
              <SectionTable title="Ocular History" icon={<FaEyeIcon />} columns={['Eye', 'Condition', 'Duration', 'Inv.']} data={bill.ocularHistory} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionTable title="Medications" icon={<FaPills />} columns={['Medication Name']} data={bill.medications} />
              <SectionTable title="Birth History" icon={<FaBaby />} columns={['History', 'Allergies']} data={bill.birthHistory} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10 bg-black/30">
          <button onClick={onClose} className="px-6 py-2 text-white transition-all bg-white/10 hover:bg-white/20 rounded-xl">Close</button>
          
          {/* ---> UPDATED: Trigger PDF Download onClick <--- */}
          <button 
            onClick={() => generateBillPDF(bill)} 
            className="flex items-center gap-2 px-6 py-2 text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-500 rounded-xl"
          >
            <FaFileInvoiceDollar /> Print Bill
          </button>

        </div>
      </div>
    </div>
  );
};

// --- Main Manage Bill Component ---
const ManageBill = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bills"), (snapshot) => {
      const billList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          normalizedName: data.patientName || data.patient?.name || '',
          normalizedMR: data.mrNo || data.patientMR || data.patient?.mrNo || ''
        };
      });
      billList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBills(billList);
      setFilteredBills(billList);
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    const results = bills.filter(bill => 
      bill.normalizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.normalizedMR.toString().includes(searchTerm.toLowerCase())
    );
    setFilteredBills(results);
  }, [searchTerm, bills]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete record?")) await deleteDoc(doc(db, "bills", id));
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto md:p-8 custom-scrollbar">
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="p-3 text-white bg-blue-500 shadow-lg rounded-xl"><FaFileInvoiceDollar size={24} /></div>
          <div><h2 className="text-2xl font-bold text-white md:text-3xl">Manage Bills</h2><p className="text-sm text-blue-200">View patient invoices.</p></div>
        </div>
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute text-blue-300 left-3 top-3" />
          <input type="text" placeholder="Search MR No or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 p-2.5 focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden min-h-[400px]">
        {loading ? <div className="p-10 text-center text-blue-200">Loading...</div> : 
         filteredBills.length === 0 ? <div className="p-20 text-center text-blue-300 opacity-60">No bills found.</div> : (
         <>
           <div className="hidden overflow-x-auto md:block">
             <table className="w-full text-left border-collapse">
               <thead className="sticky top-0 text-xs font-semibold text-blue-200 uppercase bg-blue-900/40 backdrop-blur-md">
                 <tr><th className="w-16 p-4 text-center">S.No</th><th className="p-4">Date</th><th className="p-4">MR No</th><th className="p-4">Patient Name</th><th className="w-40 p-4 text-center">Actions</th></tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {filteredBills.map((bill, index) => (
                   <tr key={bill.id} className="transition-colors hover:bg-white/5 group">
                     <td className="p-4 font-mono text-sm text-center text-blue-300/70">{index + 1}</td>
                     <td className="p-4 text-sm text-white">{bill.createdAt?.toDate ? bill.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                     <td className="p-4 font-mono text-sm text-blue-200">{bill.normalizedMR}</td>
                     <td className="p-4 font-medium text-white">{bill.normalizedName}</td>
                     <td className="flex justify-center gap-2 p-4">
                       <button onClick={() => setSelectedBill(bill)} className="p-2 text-blue-300 rounded-lg bg-blue-500/20 hover:text-white"><FaEye /></button>
                       <button onClick={() => handleDelete(bill.id)} className="p-2 text-red-300 rounded-lg bg-red-500/20 hover:text-white"><FaTrash /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="p-4 space-y-4 md:hidden">
             {filteredBills.map((bill, index) => (
               <div key={bill.id} className="relative p-4 border bg-white/5 border-white/10 rounded-xl">
                 <div className="flex items-start justify-between mb-2">
                   <div><h3 className="text-lg font-bold text-white">{bill.normalizedName}</h3><span className="text-blue-300 text-xs font-mono bg-blue-900/40 px-2 py-0.5 rounded">MR: {bill.normalizedMR}</span></div>
                   <span className="text-xs font-bold text-blue-500/50">#{index + 1}</span>
                 </div>
                 <div className="flex items-center gap-2 mb-4 text-sm text-blue-200/70"><FaCalendarAlt size={12}/> {bill.createdAt?.toDate ? bill.createdAt.toDate().toLocaleDateString() : 'N/A'}</div>
                 <div className="flex gap-2 pt-3 border-t border-white/5">
                   <button onClick={() => setSelectedBill(bill)} className="flex items-center justify-center flex-1 gap-2 py-2 text-blue-300 rounded-lg bg-blue-500/20"><FaEye /> View</button>
                   <button onClick={() => handleDelete(bill.id)} className="flex items-center justify-center flex-1 gap-2 py-2 text-red-300 rounded-lg bg-red-500/20"><FaTrash /> Delete</button>
                 </div>
               </div>
             ))}
           </div>
         </>
        )}
      </div>
      {selectedBill && <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />}
    </div>
  );
};

export default ManageBill;