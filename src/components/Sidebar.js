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
  const location = useLocation();

  // State for mobile sidebar visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // State for managing open submenus
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleSubMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
      setIsMobileOpen(false);
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
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        <FaBars size={24} />
      </button>

      {/* Mobile Overlay (Backdrop) - Increased Z-Index to 90 */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container - Increased Z-Index to 100 to sit above everything */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-[100]
        w-72 h-full flex flex-col
        glass-panel md:rounded-r-2xl border-r border-white/20
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header / Logo Section */}
        <div className="p-6 flex flex-col items-center">
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <FaTimes size={24} />
          </button>

          {/* Updated Logo: Removed rounded/bg, made bigger */}
          <div className="w-36 mb-6 flex items-center justify-center">
             <img 
               src="/logo.png" 
               alt="Healthy Eye Care" 
               className="w-full h-auto object-contain drop-shadow-lg"
               onError={(e) => {e.target.style.display='none'}}
             /> 
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white text-center">Healthy Eye Clinic</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuStructure.map((item, index) => {
            const isParentActive = location.pathname === item.path;
            const isChildActive = item.subItems?.some(sub => sub.path === location.pathname);
            const isActive = isParentActive || isChildActive;
            
            const hasSubmenu = item.subItems && item.subItems.length > 0;

            return (
              <div key={index} className="flex flex-col">
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
                  
                  {hasSubmenu && (
                    <span className="text-blue-300 text-xs">
                      {isActive || activeMenu === item.name ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </div>

                {/* Submenu Items */}
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
          &copy; {new Date().getFullYear()} Healthy Eye Clinic. All rights reserved.
        </div>
      </div>
    </>
  );
};

export default Sidebar;