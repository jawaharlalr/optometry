import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaClipboardList, 
  FaUserMd, 
  FaFileInvoiceDollar, 
  FaDatabase, 
  FaHistory, 
  FaChevronDown, 
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Used to highlight the active link

  // State for mobile sidebar visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // State for managing open submenus (accordions)
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleSubMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  // Helper to handle navigation and close mobile menu
  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      setIsMobileOpen(false); // Close sidebar on mobile after clicking
    }
  };

  const menuStructure = [
    { 
      name: 'Dashboard', 
      icon: <FaClipboardList />, 
      path: '/dashboard' 
    },
    { 
      name: 'Patient', 
      icon: <FaUserMd />, 
      subItems: [
        { label: 'Add Patient', path: '/add-patient' },
        { label: 'Manage Patient', path: '/manage-patient' }
      ] 
    },
    { 
      name: 'Medical Bill', 
      icon: <FaFileInvoiceDollar />, 
      subItems: [
        { label: 'Add Bill', path: '/add-bill' },
        { label: 'Manage Bill', path: '/manage-bill' }
      ] 
    },
    { 
      name: 'Data', 
      icon: <FaDatabase />, 
      subItems: [
        { label: 'Add General Data', path: '/add-general-data' },
        { label: 'Manage General Data', path: '/manage-general-data' },
        { label: 'Add Health Data', path: '/add-health-data' },
        { label: 'Manage Health Data', path: '/manage-health-data' }
      ] 
    },
    { 
      name: 'History', 
      icon: <FaHistory />, 
      subItems: [
        { label: 'Patient History', path: '/patient-history' }
      ]
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        <FaBars size={24} />
      </button>

      {/* Mobile Overlay (Darkens background when sidebar is open) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 h-full flex flex-col
        glass-panel md:rounded-r-2xl border-r border-white/20
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header / Logo Section */}
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <FaTimes size={24} />
          </button>

          <div className="w-24 h-24 mb-4 bg-white/10 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
             {/* Ensure logo.png is inside your public folder */}
             <img 
               src="/logo.png" 
               alt="Healthy Eye Care" 
               className="w-full h-full object-contain"
               onError={(e) => {e.target.style.display='none'}} // Fallback if image missing
             /> 
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white text-center">Healthy Eye Care</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuStructure.map((item, index) => {
            // Check if this menu or any of its subitems is active
            const isParentActive = location.pathname === item.path;
            const isChildActive = item.subItems?.some(sub => sub.path === location.pathname);
            const isActive = isParentActive || isChildActive;
            
            const hasSubmenu = item.subItems && item.subItems.length > 0;

            return (
              <div key={index} className="flex flex-col">
                {/* Main Menu Item */}
                <div 
                  onClick={() => hasSubmenu ? toggleSubMenu(item.name) : handleNavigation(item.path)}
                  className={`
                    flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
                    ${isActive ? 'bg-blue-600/40 border border-blue-400/30' : 'hover:bg-white/10'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xl ${isActive ? 'text-blue-200' : 'text-blue-300'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-blue-50 text-sm tracking-wide">
                      {item.name}
                    </span>
                  </div>
                  
                  {/* Arrow Icon for Submenus */}
                  {hasSubmenu && (
                    <span className="text-blue-300 text-xs">
                      {isActive || activeMenu === item.name ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </div>

                {/* Submenu Items (Accordion) */}
                <div className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${(activeMenu === item.name || isChildActive) ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                `}>
                  <div className="flex flex-col space-y-1 ml-12 border-l border-white/20 pl-4">
                    {hasSubmenu && item.subItems.map((sub, subIndex) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <div 
                          key={subIndex}
                          onClick={() => handleNavigation(sub.path)}
                          className={`
                            py-2 px-2 text-sm transition-all cursor-pointer rounded-lg hover:bg-white/5
                            ${isSubActive ? 'text-white font-semibold bg-white/10 translate-x-1' : 'text-blue-200 hover:text-white hover:translate-x-1'}
                          `}
                        >
                          {sub.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 text-center text-xs text-blue-300/60 border-t border-white/10">
          v1.0.0 Admin Panel
        </div>
      </div>
    </>
  );
};

export default Sidebar;