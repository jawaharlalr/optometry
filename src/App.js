import React from 'react';
import { Routes, Route } from 'react-router-dom'; // 1. Import these
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddPatient from './components/AddPatient';
import ManagePatient from './components/ManagePatient';
import AddGeneralData from './components/AddGeneralData';
import ManageGeneralData from './components/ManageGeneralData';
import AddHealthData from './components/AddHealthData';
import ManageHealthData from './components/ManageHealthData';
import AddBill from './components/AddBill';
import ManageBill from './components/ManageBill';

function App() {
  return (
    <div className="flex h-screen p-2 overflow-hidden">
      <Sidebar />
      
      {/* 2. The main content area changes based on the URL */}
      <div className="flex-1 overflow-hidden"> 
        <Routes>
          {/* Default path shows Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Add Patient path */}
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/manage-patient" element={<ManagePatient />} />
          <Route path="/add-general-data" element={<AddGeneralData />} />
          <Route path="/manage-general-data" element={<ManageGeneralData />} />
          <Route path="/add-health-data" element={<AddHealthData />} />
          <Route path="/manage-health-data" element={<ManageHealthData />} />
          <Route path="/add-bill" element={<AddBill />} />
          <Route path="/manage-bill" element={<ManageBill />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;