
import React from 'react';
import { SIDEBAR_ITEMS } from '../constants';

interface SidebarProps {
  activeItem: string;
  onItemSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemSelect }) => {
  return (
    <aside className="w-20 md:w-24 bg-[#334155] h-screen flex flex-col items-center py-6 text-white fixed left-0 top-0 z-50">
      <div className="mb-8">
        <div className="w-10 h-10 bg-gray-400/30 rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
        </div>
      </div>
      
      <nav className="flex-1 w-full space-y-2">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={`w-full flex flex-col items-center py-4 transition-colors relative ${
              activeItem === item.id ? 'bg-[#1e293b] text-blue-400' : 'text-gray-400 hover:text-white hover:bg-[#3f4f6b]'
            }`}
          >
            {activeItem === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            )}
            {item.icon}
            <span className="text-[10px] md:text-xs mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
         <button className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m7 6H4" />
            </svg>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
