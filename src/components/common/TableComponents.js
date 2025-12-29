import React from 'react';

export const TableSelect = ({ value, onChange, options = [] }) => (
  <select 
    className="w-full bg-black/20 border border-white/10 text-white text-sm rounded p-2.5 outline-none focus:border-blue-400 appearance-none cursor-pointer min-h-[42px] min-w-[80px]" 
    value={value} 
    onChange={onChange}
  >
    <option value="" className="text-gray-400 bg-slate-800">Select</option>
    {options && options.map((opt, i) => <option key={i} value={opt} className="bg-slate-800">{opt}</option>)}
  </select>
);

export const TableInput = ({ value, onChange, placeholder = '', type = "text" }) => {
  if (type === "date") {
    return (
      <input 
        type="date"
        className="w-full bg-black/20 border border-white/10 text-white text-sm rounded p-2.5 outline-none focus:border-blue-400 placeholder-white/30 min-h-[42px]"
        value={value}
        onChange={onChange}
      />
    );
  }
  return (
    <textarea 
      className="w-full bg-black/20 border border-white/10 text-white text-sm rounded p-2.5 outline-none focus:border-blue-400 placeholder-white/30 resize-y min-h-[42px] overflow-hidden align-top whitespace-nowrap" 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
      rows={1}
      onInput={(e) => {
        e.target.style.height = 'auto'; 
        e.target.style.height = e.target.scrollHeight + 'px'; 
      }}
    />
  );
};