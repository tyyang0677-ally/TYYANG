
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { SubmissionStatus } from '../types';

interface AssignmentUploadProps {
  onSuccess: (fileName: string) => void;
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const simulateUpload = () => {
    if (!selectedFile) return;
    setStatus(SubmissionStatus.UPLOADING);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      if (p >= 100) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setStatus(SubmissionStatus.SUCCESS);
          setTimeout(() => onSuccess(selectedFile.name), 1000);
        }, 500);
      } else {
        setProgress(p);
      }
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">提交作业：课程论文/报告</h2>
          <p className="text-sm text-gray-500">系统将自动对比您在“AI助手”中的交流记录，分析原创性与AI贡献度。</p>
        </div>

        {status === SubmissionStatus.IDLE && (
          <div className="space-y-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
            />
            
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-gray-400 group-hover:text-blue-500" size={32} />
                </div>
                <p className="font-medium text-gray-600">选择文件或拖拽到此处</p>
                <p className="text-xs text-gray-400 mt-2">支持扩展名：.pdf, .doc, .docx</p>
              </div>
            ) : (
              <div className="p-6 border border-blue-200 bg-blue-50/30 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-red-500 hover:underline"
                >
                  重新选择
                </button>
              </div>
            )}

            <button
              onClick={simulateUpload}
              disabled={!selectedFile}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md ${
                selectedFile ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              立即提交并生成分析报告
            </button>
          </div>
        )}

        {status === SubmissionStatus.UPLOADING && (
          <div className="p-8 border rounded-xl bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{selectedFile?.name}</span>
              </div>
              <span className="text-xs font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center mt-4 text-xs text-gray-500">
              <Loader2 size={14} className="animate-spin mr-2" />
              正在对比 AI 助手中的对话轨迹，计算参与比率...
            </div>
          </div>
        )}

        {status === SubmissionStatus.SUCCESS && (
          <div className="p-12 flex flex-col items-center justify-center bg-green-50 rounded-xl border border-green-100">
            <CheckCircle size={48} className="text-green-500 mb-4" />
            <h3 className="text-lg font-bold text-green-800">提交成功</h3>
            <p className="text-sm text-green-600">正在生成您的专属学习报告...</p>
          </div>
        )}

        <div className="mt-8 flex items-start space-x-3 p-4 bg-orange-50 rounded-lg text-orange-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>学术诚信提示：</strong> 提交后，系统将自动锁定本课程的AI对话记录作为诚信审计依据。
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentUpload;
