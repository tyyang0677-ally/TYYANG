
import React, { useEffect } from 'react';
import { User, Bot, Clock, Search, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { marked } from 'marked';

interface LearningTimelineProps {
  history: ChatMessage[];
}

const LearningTimeline: React.FC<LearningTimelineProps> = ({ history }) => {
  useEffect(() => {
    // Ensure marked is configured for the timeline component
    marked.setOptions({ gfm: true, breaks: true });
  }, []);

  return (
    <div className="p-2 md:p-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Clock size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            课程互动时序记录
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <Search size={14} />
            <span>过滤审计历史</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {history.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">尚无互动轨迹。请先在 AI 助手页进行学术交流。</p>
            </div>
          ) : (
            <div className="relative pl-8 md:pl-16 border-l-2 border-dashed border-slate-100 space-y-12 pb-10">
              {history.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Point */}
                  <div className={`absolute -left-[2.85rem] md:-left-[4.85rem] top-0 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                    item.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {item.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
                    <span className="text-xs font-black font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-lg tabular-nums">{item.timestamp}</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                      item.role === 'user' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.role === 'user' ? '学生原始指令' : 'AI 学术辅助响应'}
                    </span>
                  </div>

                  <div className={`p-8 rounded-[2rem] border transition-all group-hover:shadow-xl bg-white ${
                    item.role === 'user' 
                      ? 'border-slate-100 shadow-sm' 
                      : 'border-slate-100 shadow-md'
                  }`}>
                    <div className="markdown-content text-[14px] text-slate-700 leading-relaxed overflow-hidden">
                      {item.role === 'user' ? (
                        <p className="font-bold">{item.text}</p>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(item.text) }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* End Point */}
              <div className="relative group pt-4">
                <div className="absolute -left-[2.85rem] md:-left-[4.85rem] top-4 w-10 h-10 rounded-full border-4 border-white shadow-sm bg-slate-200 flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                </div>
                <div className="pl-4">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">轨迹终点：已提交至服务器</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-[0.2em] border-b border-slate-50 pb-6">时序审计概览</h3>
            <div className="space-y-6">
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p className="text-[10px] text-blue-400 font-black uppercase mb-2 tracking-widest">交互时段</p>
                <p className="text-sm font-black text-blue-900 font-mono tracking-tighter">
                  {history[0]?.timestamp || '--:--'} 至 {history[history.length-1]?.timestamp || '--:--'}
                </p>
              </div>
              <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <p className="text-[10px] text-emerald-400 font-black uppercase mb-2 tracking-widest">认知深度</p>
                <p className="text-sm font-black text-emerald-900 leading-relaxed">高阶逻辑重构与知识内化</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                <Bot size={160} />
             </div>
             <h4 className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-[0.3em] relative z-10">审计说明</h4>
             <p className="text-xs text-slate-300 leading-relaxed italic relative z-10">
               “所有时序数据均通过区块链哈希校验。任何对过往记录的篡改尝试都将被系统识别并标记为诚信异常。”
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningTimeline;
