import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { 
  FaUserPlus, 
  FaFileInvoiceDollar, 
  FaNotesMedical, 
  FaUsersCog 
} from 'react-icons/fa';

// --- Components ---

const StatCard = ({ title, value, subtext, icon }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-36 hover:bg-white/15 transition-all cursor-default relative overflow-hidden group">
    <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors text-8xl">
      {icon}
    </div>
    <div>
        <h3 className="text-blue-200 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <div className="text-3xl font-bold text-white mt-2">{value}</div>
    </div>
    <p className="text-xs text-blue-300 bg-blue-900/40 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
        {subtext}
    </p>
  </div>
);

// 2. Update ActionCard to accept onClick
const ActionCard = ({ label, icon, color, onClick }) => (
    <div 
      onClick={onClick} 
      className="glass-panel p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-white/20 hover:scale-[1.02] transition-all group"
    >
        <div className={`p-3 rounded-lg ${color} text-white group-hover:shadow-lg transition-all`}>
            {icon}
        </div>
        <span className="font-medium text-blue-50">{label}</span>
    </div>
);

const ActivityItem = ({ type, title, subtitle, time }) => {
    let icon, colorBg, colorText;

    if (type === 'patient') {
        icon = <FaUserPlus />;
        colorBg = 'bg-blue-500/20';
        colorText = 'text-blue-200'; 
    } else if (type === 'bill') {
        icon = <FaFileInvoiceDollar />;
        colorBg = 'bg-emerald-500/20';
        colorText = 'text-emerald-200';
    } else {
        icon = <FaNotesMedical />;
        colorBg = 'bg-purple-500/20';
        colorText = 'text-purple-200';
    }

    return (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition group border border-transparent hover:border-white/10">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${colorBg} flex items-center justify-center ${colorText} group-hover:text-white transition-all`}>
                    {icon}
                </div>
                <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="text-xs text-blue-300">{subtitle}</p>
                </div>
            </div>
            <span className="text-xs text-blue-200 bg-white/10 px-3 py-1 rounded-full">{time}</span>
        </div>
    );
};

// --- Main Dashboard Component ---

const Dashboard = () => {
  const navigate = useNavigate(); // 3. Initialize Hook
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    revenue: 0, 
    records: 0  
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const patientsQuery = query(
      collection(db, "patients"), 
      orderBy("createdAt", "desc"), 
      limit(50) 
    );

    const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStats(prev => ({
        ...prev,
        totalPatients: snapshot.size 
      }));

      const patientActivities = patients.slice(0, 5).map(p => ({
        id: p.id,
        type: 'patient',
        title: 'New Patient Registered',
        subtitle: `${p.name} (${p.gender}, ${p.age}y)`,
        time: formatTime(p.createdAt)
      }));

      setRecentActivity(patientActivities);
      setLoading(false);
    });

    return () => unsubscribePatients();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen custom-scrollbar">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 pt-12 md:pt-0 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Welcome, Dr. Nandhini</h2>
          <p className="text-blue-200 text-sm md:text-base">Daily Overview & Statistics</p>
        </div>
        
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 w-fit">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white/50"></div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-white rounded-full"></span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Dr. Nandhini</p>
            <p className="text-[10px] text-blue-200 leading-none">Healthy Eye Care</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Total Patients" 
            value={loading ? "..." : stats.totalPatients} 
            icon={<FaUserPlus />}
        />
        <StatCard 
            title="Revenue (Est)" 
            value="$0.00" 
            subtext="No bills generated yet" 
            icon={<FaFileInvoiceDollar />}
        />
        <StatCard 
            title="Health Records" 
            value="0" 
            subtext="Data entry pending" 
            icon={<FaNotesMedical />}
        />
      </div>

      {/* Quick Actions - NOW CLICKABLE */}
      <h3 className="text-lg font-semibold text-white mb-4 px-1">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* 1. Add Patient - Works */}
        <ActionCard 
          label="Add Patient" 
          icon={<FaUserPlus />} 
          color="bg-blue-500" 
          onClick={() => navigate('/add-patient')}
        />
        
        {/* 2. Manage Patients - Works */}
        <ActionCard 
          label="Manage Patients" 
          icon={<FaUsersCog />} 
          color="bg-orange-500" 
          onClick={() => navigate('/manage-patient')}
        />

        {/* 3. Future Link */}
        <ActionCard 
          label="New Bill" 
          icon={<FaFileInvoiceDollar />} 
          color="bg-emerald-500" 
          onClick={() => navigate('/add-bill')}
        />
        
        {/* 4. Future Link */}
        <ActionCard 
          label="Add Health Data" 
          icon={<FaNotesMedical />} 
          color="bg-purple-500" 
          onClick={() => navigate('/add-health-data')}
        />

      </div>

      {/* Recent Activity Section */}
      <div className="glass-panel rounded-2xl p-6 w-full">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            <button className="text-xs text-blue-300 hover:text-white transition-colors">View All</button>
        </div>
        
        <div className="space-y-4">
            {loading ? (
                <div className="text-center text-blue-300 py-4">Loading activity...</div>
            ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                    <ActivityItem 
                        key={activity.id}
                        type={activity.type}
                        title={activity.title}
                        subtitle={activity.subtitle}
                        time={activity.time}
                    />
                ))
            ) : (
                <div className="text-center text-blue-300 py-4 italic">No recent activity found.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;