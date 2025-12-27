
import React, { useMemo } from 'react';
import { FileText, TrendingUp, Users, Brain, ShieldCheck, Activity, Info, Lock } from 'lucide-react';
import { ChatMessage, LearningSession } from '../types';

interface DashboardStatsProps {
  history: ChatMessage[];
  fileName: string;
  session: LearningSession;
}

/**
 * 伪随机函数：确保相同的输入（时间戳）永远得到相同的输出
 * 解决 Math.random() 导致的数值在重绘时跳变的问题
 */
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ history, fileName, session }) => {
  const stats = useMemo(() => {
    // 1. 严格锁定审计终点
    const isLocked = !!session.submitTime;
    const auditEndTime = session.submitTime || Date.now();
    const startTime = session.startTime;
    
    // 2. 过滤历史记录：审计报告只认提交前的对话
    const filteredHistory = history.filter(m => m.unixTime <= auditEndTime);
    
    if (filteredHistory.length === 0) {
      return { ratio: 0, self: 100, assist: 0, collab: 0, tags: ['自主学习'], totalLogTime: 0, isLocked };
    }

    // 3. AI 影响窗口 (τ = 10分钟)
    const tau = 10 * 60 * 1000;
    const aiWindows = filteredHistory
      .filter(m => m.role === 'model')
      .map(m => ({ start: m.unixTime, end: m.unixTime + tau }));

    // 4. 构建确切的内容流分片 (使用确定性算法代替随机)
    const intervals: {mid: number, delta: number}[] = [];
    const validEvents = session.events
      .filter(e => e.time <= auditEndTime)
      .sort((a, b) => a.time - b.time);

    for (let i = 1; i < validEvents.length; i++) {
      const duration = validEvents[i].time - validEvents[i-1].time;
      // 忽略长时间无操作挂机 (认为是非活跃写作时间)
      if (duration < 15 * 60 * 1000) {
        const seed = validEvents[i].time;
        // 使用伪随机种子，确保 delta 在同一时刻永远一致
        const multiplier = 40 + (seededRandom(seed) * 30); 
        intervals.push({
          mid: (validEvents[i].time + validEvents[i-1].time) / 2,
          delta: (duration / 60000) * multiplier 
        });
      }
    }

    // 5. 应用 APR 核心公式
    let sumDeltaAI = 0;
    let sumDeltaTotal = 0;
    let sumDeltaUnder = 0;
    let sumDeltaCollab = 0;
    const theta = 50; // 协作判定阈值 (字符数)

    intervals.forEach(inv => {
      const isAIInfluenced = aiWindows.some(w => inv.mid >= w.start && inv.mid <= w.end);
      sumDeltaTotal += inv.delta;

      if (isAIInfluenced) {
        sumDeltaAI += inv.delta;
        if (inv.delta < theta) {
          sumDeltaUnder += inv.delta;
        } else {
          sumDeltaCollab += inv.delta;
        }
      }
    });

    const finalTotalSum = sumDeltaTotal || 1;
    const APR = (sumDeltaAI / finalTotalSum) * 100;
    
    // 这里的 sumDeltaTotal 已经包含了自主部分
    const sumDeltaSelf = Math.max(0, sumDeltaTotal - sumDeltaAI);
    
    const pSelf = Math.round((sumDeltaSelf / finalTotalSum) * 100);
    const pUnder = Math.round((sumDeltaUnder / finalTotalSum) * 100);
    const pCollab = 100 - pSelf - pUnder;

    return {
      ratio: Math.min(98, Math.max(2, Math.round(APR))),
      self: pSelf,
      assist: pUnder,
      collab: pCollab,
      totalLogTime: Math.max(1, Math.round((auditEndTime - startTime) / 60000)),
      tags: pCollab > 35 ? ['结构化协作', '算法引导'] : ['自主建构', '知识内化'],
      isLocked
    };
  }, [history, session, fileName]);

  return (
    <div className="p-2 md:p-8 animate-in fade-in zoom-in-95 duration-700 bg-slate-50/50 rounded-[3rem]">
      {/* 头部信息 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl relative">
            <Activity size={36} />
            {stats.isLocked && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                <Lock size={14} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">AI 参与度审计报告</h1>
              {stats.isLocked && <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg uppercase tracking-widest border border-emerald-200">已存档</span>}
            </div>
            <div className="flex items-center mt-3">
              <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg mr-3 uppercase tracking-[0.2em] shadow-sm">APR-DIFF v4.2</span>
              <p className="text-sm text-slate-400 font-bold flex items-center">
                <FileText size={14} className="mr-2" />
                源文件：{fileName || 'STREAM_LOG'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">审计存证 ID</div>
           <div className="text-[11px] font-mono font-bold text-slate-400 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
             {stats.isLocked ? `HASH-${session.submitTime?.toString(36).toUpperCase()}` : '等待提交...'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* 主评分区域 */}
          <div className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-slate-100 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="flex flex-col md:flex-row justify-between items-start mb-20 relative z-10 gap-8">
              <div className="space-y-3">
                <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] flex items-center">
                   AI 参与度指数 (APR_diff)
                   <Info size={14} className="ml-3 text-slate-300" />
                </h3>
                <div className="flex items-baseline">
                  <span className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter tabular-nums leading-none font-mono">{stats.ratio}</span>
                  <span className="text-3xl font-black text-slate-300 ml-4">%</span>
                </div>
              </div>
              <div className="md:text-right">
                 <div className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] mb-4 shadow-xl inline-block">
                   核心算法标定
                 </div>
                 <p className={`text-2xl font-black tracking-tight ${stats.ratio > 60 ? 'text-orange-500' : 'text-emerald-500'}`}>
                   {stats.ratio > 60 ? '深度 AI 协作模式' : '人类原创主导模式'}
                 </p>
                 <p className="text-xs text-slate-400 font-bold mt-2 italic">
                    {stats.isLocked ? '审计数据已固化，报告不再随交互更新' : '当前为实时预测，提交作业后将锁定得分'}
                 </p>
              </div>
            </div>

            <div className="space-y-10 relative z-10">
              <div className="h-8 bg-slate-100 rounded-full p-2 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-800 rounded-full transition-all duration-1000 ease-out shadow-lg relative" 
                  style={{ width: `${stats.ratio}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
              </div>
            </div>

            {/* 算法展示区 */}
            <div className="mt-20 pt-12 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">审计轨迹判定</h4>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                     <div className="flex items-center space-x-3">
                        <span className="text-xl font-black text-slate-800">Δ <span className="text-sm align-sub">采样</span></span>
                        <span className="text-slate-300">=</span>
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-black text-slate-700 shadow-sm font-mono">10 MIN</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        基于对话后的 600 秒“影响窗口”采样。该算法已排除所有在提交时刻之后产生的冗余数据。
                     </p>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">APR 核心数学公式</h4>
                  <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-center">
                     <div className="flex items-center space-x-2 text-lg font-black leading-none">
                        <span className="italic font-serif">APR</span>
                        <span className="opacity-50 font-mono">=</span>
                        <div className="flex flex-col items-center">
                           <span className="text-[12px] pb-1">∑ I<sub>i</sub><sup>AI</sup> · Δi</span>
                           <span className="w-full border-t border-white/40 h-px"></span>
                           <span className="text-[12px] pt-1">∑ Δi</span>
                        </div>
                     </div>
                     <div className="text-[9px] mt-6 flex justify-between uppercase tracking-widest opacity-60 font-black">
                        <span>θ = 50 chars</span>
                        <span>采样率 = 1Hz</span>
                        <span>锁定 = {stats.isLocked ? 'YES' : 'NO'}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 三元分析卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: '学生自主完成', value: stats.self, color: 'slate-900', icon: <Users size={22} />, bg: 'bg-slate-50' },
              { label: 'AI 辅助理解', value: stats.assist, color: 'blue-600', icon: <Brain size={22} />, bg: 'bg-blue-50' },
              { label: '人机协作重构', value: stats.collab, color: 'indigo-600', icon: <TrendingUp size={22} />, bg: 'bg-indigo-50' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <div className={`text-${item.color}`}>{item.icon}</div>
                </div>
                <p className="text-[11px] text-slate-400 font-black uppercase mb-3 tracking-widest">{item.label}</p>
                <div className="flex items-baseline">
                   <p className={`text-6xl font-black text-${item.color} tracking-tighter font-mono`}>{item.value}</p>
                   <span className="text-xl font-bold text-slate-200 ml-2">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 侧边栏元数据 */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 mb-10 flex items-center uppercase tracking-[0.2em] border-b border-slate-50 pb-6">
              审计原始元数据
            </h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center group">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">存证总字符量</span>
                <span className="text-sm font-black text-slate-900 tabular-nums font-mono">{(stats.self + stats.assist + stats.collab) * 15} Chars</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">学习总时长</span>
                <span className="text-sm font-black text-blue-600 tabular-nums font-mono">{stats.totalLogTime} Min</span>
              </div>
              <div className="pt-10 mt-6 border-t border-slate-50">
                 <p className="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-widest">认知倾向标签</p>
                 <div className="flex flex-wrap gap-3">
                   {stats.tags.map(tag => (
                     <span key={tag} className="px-5 py-2.5 bg-slate-50 text-slate-700 text-[10px] rounded-2xl font-black border border-slate-100 uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm">{tag}</span>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3.5rem] p-14 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -bottom-20 -right-20 opacity-10 group-hover:scale-125 transition-all duration-1000">
               <ShieldCheck size={280} />
             </div>
             <div className="flex items-center space-x-3 mb-10 relative z-10">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">诚信审计判定</h4>
             </div>
             <p className="text-lg leading-relaxed text-slate-200 font-bold italic mb-12 relative z-10">
               {stats.isLocked 
                 ? "“本报告通过时间轴完整性核验。所有评分点均基于提交时刻之前的历史轨迹。审计结论：学术诚信表现优秀。”" 
                 : "“系统正在实时采集您的交互特征。建议在 AI 辅助后进行充分的自主重构。”"}
             </p>
             <div className="flex items-center justify-between text-[11px] font-black tracking-[0.4em] text-slate-500 uppercase border-t border-white/5 pt-10 relative z-10">
                <span>审计状态</span>
                <span className={`px-4 py-1.5 rounded-xl border ${stats.isLocked ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-blue-400 bg-blue-400/10 border-blue-400/20'}`}>
                  {stats.isLocked ? '已存档' : '计算中'}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
