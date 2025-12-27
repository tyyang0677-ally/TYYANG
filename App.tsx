
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import AssignmentUpload from './components/AssignmentUpload';
import DashboardStats from './components/DashboardStats';
import LearningTimeline from './components/LearningTimeline';
import { ViewType, ChatMessage, LearningSession } from './types';

const App: React.FC = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useState('ai');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [analysisView, setAnalysisView] = useState<ViewType>('stats');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [submittedFileName, setSubmittedFileName] = useState('');
  
  // Track events for delta calculations
  const sessionRef = useRef<LearningSession>({
    startTime: Date.now(),
    events: [{ type: 'OPEN_APP', time: Date.now() }]
  });

  // Track regular activity to simulate "writing" sessions
  useEffect(() => {
    const handleActivity = () => {
      const lastEvent = sessionRef.current.events[sessionRef.current.events.length - 1];
      const now = Date.now();
      if (now - lastEvent.time > 10000) { // Every 10 seconds of active use
        sessionRef.current.events.push({ type: 'ACTIVITY', time: now });
      }
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  const handleSidebarClick = (id: string) => {
    setActiveSidebarItem(id);
    sessionRef.current.events.push({ 
      type: 'SWITCH_TAB', 
      time: Date.now(), 
      metadata: { to: id } 
    });
  };

  const handleMessageUpdate = (role: 'user' | 'model', text: string) => {
    const now = Date.now();
    let intent: any = 'CONCEPT';
    if (text.length > 300) intent = 'GENERATION';
    else if (text.includes('如何') || text.includes('解释')) intent = 'METHOD';

    const newMessage: ChatMessage = {
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unixTime: now,
      intent
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    sessionRef.current.events.push({ 
      type: role === 'user' ? 'AI_ASK' : 'AI_REPLY', 
      time: now,
      metadata: { textLength: text.length, intent }
    });
  };

  const handleUploadSuccess = (fileName: string) => {
    sessionRef.current.submitTime = Date.now();
    sessionRef.current.events.push({ type: 'SUBMIT', time: Date.now() });
    setSubmittedFileName(fileName);
    setIsSubmitted(true);
  };

  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'ai':
        return <AIAssistant onMessageSent={handleMessageUpdate} history={chatHistory} />;
      case 'assignments':
        if (!isSubmitted) {
          return <AssignmentUpload onSuccess={handleUploadSuccess} />;
        }
        return (
          <div className="animate-in fade-in duration-700">
            <div className="flex space-x-1 mb-6 bg-gray-200/50 p-1 rounded-lg w-max mx-auto md:mx-0">
               <button 
                onClick={() => setAnalysisView('stats')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${analysisView === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 AI 参与度分析
               </button>
               <button 
                onClick={() => setAnalysisView('timeline')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${analysisView === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 学习过程记录
               </button>
            </div>
            {analysisView === 'stats' ? (
              <DashboardStats 
                history={chatHistory} 
                fileName={submittedFileName} 
                session={sessionRef.current} 
              />
            ) : (
              <LearningTimeline history={chatHistory} />
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
            <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full mb-4 flex items-center justify-center font-light text-2xl">?</div>
            <p className="text-sm">该功能模块暂未开放</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Sidebar activeItem={activeSidebarItem} onItemSelect={handleSidebarClick} />
      <div className="ml-20 md:ml-24">
        <Header />
        <main className="mt-16 pb-12">
          <div className="px-6 py-4 bg-white/50 border-b border-gray-200">
             <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="hover:text-blue-500 transition-colors cursor-default font-sans">eLearning</span>
                <span>/</span>
                <span className="text-gray-600 font-bold font-sans">{activeSidebarItem === 'ai' ? '学术AI助手' : (isSubmitted ? '作业审计报告' : '提交作业')}</span>
             </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
            {renderContent()}
          </div>
        </main>
      </div>
      {isSubmitted && activeSidebarItem === 'assignments' && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 text-xs font-black animate-bounce z-50 uppercase tracking-widest">
          <CheckCircle size={14} />
          <span>Report Generated</span>
        </div>
      )}
    </div>
  );
};

export default App;
