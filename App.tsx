import React, { useState, useRef, DragEvent } from 'react';
import { Button } from './components/Button';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeImageForAIArtifacts, fileToBase64 } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, ImageFile } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAnalyzing = status === AnalysisStatus.ANALYZING;

  // File processing logic
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg("检测到非图片文件，请上传 JPG, PNG 或 WEBP。");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImageFile({
        file,
        previewUrl: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });
      // Reset previous results when new file is uploaded
      setErrorMsg(null);
      setResult(null);
      setStatus(AnalysisStatus.IDLE);
    } catch (err) {
      setErrorMsg("图片处理失败，请重试。");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only set dragging to false if we are leaving the window or the main container
    if (e.currentTarget.contains(e.relatedTarget as Node) === false) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setStatus(AnalysisStatus.ANALYZING);
    try {
      const analysisResult = await analyzeImageForAIArtifacts(imageFile.base64, imageFile.mimeType);
      setResult(analysisResult);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err) {
      console.error(err);
      setErrorMsg("AI 分析服务暂时不可用，请稍后重试。");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="min-h-screen bg-main text-gray-300 font-sans relative overflow-x-hidden transition-colors duration-500"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Full Screen Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-main/90 backdrop-blur-sm flex items-center justify-center animate-fade-in border-4 border-gold-500/30 m-4 rounded-[3rem]">
          <div className="flex flex-col items-center gap-6 p-20 rounded-[3rem] shadow-neu">
            <svg className="w-24 h-24 text-gold-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <h2 className="text-4xl font-sans text-gold-gradient font-bold">释放图片以上传</h2>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed w-full z-40 top-0 pt-6 px-6">
        <div className="max-w-7xl mx-auto bg-main/80 backdrop-blur-xl rounded-2xl shadow-neu px-6 py-4 flex justify-between items-center border border-white/5">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-main shadow-neu flex items-center justify-center text-gold-500 border border-white/5">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-sans font-bold text-lg text-gold-gradient tracking-wide">黑蜂AI鉴别大师</h1>
                <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase hidden sm:block">AI Forensics Unit</p>
              </div>
            </div>
            <div className="flex gap-4">
               {/* Decorative Indicators */}
               <div className="hidden sm:flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                 <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
               </div>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-12 flex flex-col items-center min-h-screen">
        
        {/* Intro - Only show if no image yet to reduce clutter when working */}
        {!imageFile && (
          <div className="text-center mt-6 mb-12 max-w-2xl mx-auto space-y-6">
            <h2 className="text-5xl md:text-7xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-br from-gold-300 to-gold-600 drop-shadow-lg tracking-tight pb-2">
              AI图片鉴别神器
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              将任何图像拖入此区域。黑蜂的高级神经网络将分析光影、透视与纹理，揭示伪造的痕迹。
            </p>
          </div>
        )}

        {/* Main Interface Area */}
        <div className="w-full max-w-5xl transition-all duration-500 space-y-10">
          
          {/* Permanent Upload Widget */}
          <div 
            className="group relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
             {/* Dynamic Style: Compact if file exists, Large if not */}
            <div className={`bg-main rounded-[3rem] shadow-neu flex flex-col items-center justify-center border border-white/5 transition-all duration-500 group-hover:shadow-neu-sm group-active:shadow-neu-pressed ${imageFile ? 'p-8 min-h-[150px]' : 'p-20 min-h-[300px]'}`}>
              
              <div className="flex flex-col items-center gap-4 transition-all duration-300">
                <div className={`rounded-full bg-main shadow-neu flex items-center justify-center text-gray-500 group-hover:text-gold-500 transition-colors duration-500 ${imageFile ? 'w-16 h-16' : 'w-24 h-24'}`}>
                  {imageFile ? (
                    // Replace Icon
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                  ) : (
                    // Upload Icon
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>

                <div className="text-center">
                   <h3 className={`font-sans text-gray-300 transition-all ${imageFile ? 'text-lg' : 'text-2xl mb-2'}`}>
                     {imageFile ? '点击或拖拽以更换图片' : '点击或拖拽上传图像'}
                   </h3>
                   {!imageFile && (
                     <p className="font-mono text-xs text-gray-600 tracking-widest uppercase">Supported Formats: JPG / PNG / WEBP</p>
                   )}
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>

          {/* Analysis View - Visible when file exists */}
          {imageFile && (
             <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start animate-fade-in-up">
               
               {/* Left Column: Image Card & Action Button */}
               <div className="w-full lg:w-2/3 flex flex-col gap-6">
                 {/* Image Container */}
                 <div className="bg-main rounded-[2.5rem] p-6 shadow-neu border border-white/5 relative">
                    <div className="relative rounded-[2rem] overflow-hidden bg-black/40 min-h-[400px] flex items-center justify-center">
                      <img 
                        src={imageFile.previewUrl} 
                        alt="Preview" 
                        className={`max-h-[60vh] max-w-full object-contain transition-all duration-700 ${isAnalyzing ? 'opacity-50 scale-95 blur-sm' : ''}`} 
                      />
                      
                      {/* Scanner UI Overlay */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <div className="w-24 h-24 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-6"></div>
                          <div className="text-gold-500 font-mono text-sm tracking-widest animate-pulse">ANALYZING ARTIFACTS...</div>
                        </div>
                      )}

                      {/* Scan Line */}
                      {isAnalyzing && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gold-500/50 shadow-[0_0_20px_#D4AF37] animate-scan"></div>
                      )}
                    </div>
                 </div>

                 {/* Action Button - Yellow Long Bar */}
                 {!isAnalyzing && !result && (
                   <Button 
                    onClick={handleAnalyze} 
                    variant="gold"
                    className="w-full text-lg py-6 shadow-neu-flat hover:translate-y-[-2px]"
                   >
                     启动AI分析
                   </Button>
                 )}
               </div>

               {/* Right Column: Control Panel & Info */}
               <div className="w-full lg:w-1/3 flex flex-col gap-6">
                 
                 {/* Info Widget */}
                 <div className="bg-main rounded-[2rem] p-8 shadow-neu border border-white/5">
                    <h4 className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-6">文件信息</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">格式</span>
                        <span className="text-gold-500 font-mono text-xs bg-main shadow-neu-pressed px-3 py-1 rounded-lg">
                          {imageFile.mimeType.split('/')[1].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">大小</span>
                        <span className="text-gold-500 font-mono text-xs bg-main shadow-neu-pressed px-3 py-1 rounded-lg">
                          {(imageFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                 </div>
                 
                 {/* Result Actions */}
                 {result && !isAnalyzing && (
                    <div className="space-y-4">
                       <div className="p-6 bg-main shadow-neu-pressed rounded-2xl text-center">
                         <span className="text-gold-500 font-sans text-xl">分析完成</span>
                       </div>
                       <Button onClick={handleAnalyze} variant="secondary" className="w-full">
                         重新分析
                       </Button>
                    </div>
                 )}

                 {isAnalyzing && (
                   <div className="bg-main rounded-[2rem] p-8 shadow-neu-pressed flex items-center justify-center text-gray-500 text-sm font-mono animate-pulse">
                     PROCESSING...
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* Results Area */}
          {result && (
             <ResultDisplay result={result} onReset={handleReset} />
          )}

          {/* Error Toast */}
          {errorMsg && (
            <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-main shadow-neu rounded-2xl border border-red-500/20 text-red-400 flex items-center gap-4 animate-fade-in-up z-50">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              {errorMsg}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;