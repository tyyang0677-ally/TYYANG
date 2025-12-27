
import React from 'react';
import { LayoutDashboard, BookOpen, FileText, Bot, BarChart3, HelpCircle, Home } from 'lucide-react';

export const SIDEBAR_ITEMS = [
  { id: 'home', label: '首页', icon: <Home size={20} /> },
  { id: 'courses', label: '课程资料', icon: <BookOpen size={20} /> },
  { id: 'assignments', label: '作业', icon: <FileText size={20} /> },
  { id: 'ai', label: 'AI助手', icon: <Bot size={20} /> },
  { id: 'stats', label: '成绩', icon: <BarChart3 size={20} /> },
  { id: 'help', label: '帮助', icon: <HelpCircle size={20} /> },
];

export const MOCK_TIMELINE: any[] = [
  {
    id: '1',
    time: '19:10',
    type: 'user',
    label: '学生向AI提问',
    content: '如何理解“社会存在决定社会意识”？？',
    isAiAssisted: false
  },
  {
    id: '2',
    time: '19:12',
    type: 'ai',
    label: 'AI辅助说明',
    content: '给出三点解释，并举现实案例',
    isAiAssisted: true
  },
  {
    id: '3',
    time: '20:49',
    type: 'user',
    label: '学生自行总结',
    content: '社会存在决定社会意识，但有时意识也会反作用于存在',
    isAiAssisted: false,
    aiLabel: '未使用AI'
  },
  {
    id: '4',
    time: '21:06',
    type: 'auto',
    label: 'AI使用说明(自动生成)',
    content: '本节学习中，AI用于呈现解释与案例举例，最终成果由学生独立完成',
    isAiAssisted: true
  }
];
