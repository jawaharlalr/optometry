import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
      
      {/* Sidebar (Fixed on mobile, Static on Desktop) */}
      <Sidebar />
      
      {/* Main Content Area 
         - flex-1: Takes remaining width
         - overflow-hidden: Prevents double scrollbars
         - relative: Establishes stacking context
         - pt-16: Adds top padding ONLY on mobile so the content doesn't hide behind the Hamburger button
         - md:pt-0: Removes that padding on Desktop where the button isn't visible
      */}
      <div className="flex-1 overflow-hidden relative pt-16 md:pt-0"> 
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Patient */}
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/manage-patient" element={<ManagePatient />} />
          
          {/* General Data */}
          <Route path="/add-general-data" element={<AddGeneralData />} />
          <Route path="/manage-general-data" element={<ManageGeneralData />} />
          
          {/* Health Data */}
          <Route path="/add-health-data" element={<AddHealthData />} />
          <Route path="/manage-health-data" element={<ManageHealthData />} />
          
          {/* Billing */}
          <Route path="/add-bill" element={<AddBill />} />
          <Route path="/manage-bill" element={<ManageBill />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;