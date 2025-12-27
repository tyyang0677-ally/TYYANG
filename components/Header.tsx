
import React from 'react';
import { Bell, MessageSquare, Monitor, Menu, Search, AlertCircle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-20 md:left-24 right-0 z-40">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img src="https://picsum.photos/32/32?random=logo" alt="logo" className="w-8 h-8 rounded-full" />
          <span className="font-semibold text-gray-700 tracking-tight">eLearning</span>
        </div>
        <div className="h-4 w-px bg-gray-300 mx-2" />
        <span className="text-sm text-blue-500 font-medium cursor-pointer">elearning.fudan.edu.cn</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4 text-gray-500">
          <MessageSquare size={18} className="cursor-pointer hover:text-gray-800" />
          <Bell size={18} className="cursor-pointer hover:text-gray-800" />
          <Monitor size={18} className="cursor-pointer hover:text-gray-800" />
          <Menu size={18} className="cursor-pointer hover:text-gray-800" />
        </div>
      </div>
    </header>
  );
};

export default Header;
