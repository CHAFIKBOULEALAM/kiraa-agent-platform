"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Upload, FileText, Image as ImageIcon, Loader2, File, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  files?: File[];
  isThinking?: boolean;
  metadata?: any;
};

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Bonjour ! Je suis Kiraa, votre assistant IA de location de véhicules. Comment puis-je vous aider aujourd'hui ? Vous pouvez m'envoyer votre permis de conduire pour une vérification rapide.",
    },
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      files: [...files],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setFiles([]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, role: "bot", content: "", isThinking: true },
    ]);

    try {
      const formData = new FormData();
      formData.append("message", userMessage.content);
      userMessage.files?.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: data.explanation || data.report || "Je n'ai pas pu générer de réponse.",
                isThinking: false,
                metadata: data,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: "Une erreur de connexion est survenue. Veuillez réessayer.",
                isThinking: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Kiraa Agent
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">DETERMINISTIC AI ENGINE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-400">En ligne</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "flex gap-4 max-w-4xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-md",
                  msg.role === "user"
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-indigo-500/10 border border-indigo-500/20"
                )}
              >
                {msg.role === "user" ? (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800" />
                ) : (
                  <ShieldCheck className="text-indigo-400 w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                {msg.files && msg.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {msg.files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/50 shadow-sm">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-xs font-medium truncate max-w-[150px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={cn(
                    "px-5 py-4 rounded-3xl shadow-sm leading-relaxed whitespace-pre-wrap text-[15px]",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm backdrop-blur-sm"
                  )}
                >
                  {msg.isThinking ? (
                    <div className="flex items-center gap-3 text-indigo-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium animate-pulse">Analyse en cours...</span>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Metadata Pills (Deterministic Results) */}
                {msg.metadata && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.metadata.intent && msg.metadata.intent !== "out_of_scope" && (
                      <span data-testid="intent-badge" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        INTENT: {msg.metadata.intent}
                      </span>
                    )}
                    
                    {msg.metadata.intent && msg.metadata.intent === "out_of_scope" && (
                      <span data-testid="intent-badge" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        INTENT: out_of_scope
                      </span>
                    )}

                    {msg.metadata.eligibilityResult && (
                      <span data-testid="validation-status" className={cn(
                        "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex items-center gap-1",
                        msg.metadata.eligibilityResult.eligible
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}>
                        {msg.metadata.eligibilityResult.eligible ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                        {msg.metadata.eligibilityResult.eligible ? "ELIGIBLE" : "REJECTED"}
                      </span>
                    )}
                    {msg.metadata.priceResult && (
                      <span data-testid="price-result" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {msg.metadata.priceResult.totalPrice} MAD
                      </span>
                    )}
                    {msg.metadata.priceResult?.discountAmount > 0 && (
                      <span data-testid="discount-result" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {msg.metadata.priceResult.discountCapped ? '15%' : `${Math.round(msg.metadata.priceResult.discountAmount / msg.metadata.priceResult.subtotal * 100)}%`} DISCOUNT{msg.metadata.priceResult.discountCapped ? ' (CAPPED)' : ''}
                      </span>
                    )}
                    {msg.metadata.needsHumanReview && (
                      <span data-testid="human-review-status" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        HITL REQUIRED
                      </span>
                    )}
                    {msg.metadata.bookingStatus === "PENDING_REVIEW" && (
                      <span data-testid="booking-status" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        PENDING_REVIEW
                      </span>
                    )}
                    {msg.metadata.pdfReportBase64 && (
                      <a
                        data-testid="pdf-download"
                        href={`data:application/pdf;base64,${msg.metadata.pdfReportBase64}`}
                        download={`Kiraa_Quote_${msg.id}.pdf`}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500/20 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        DOWNLOAD PDF
                      </a>
                    )}
                    {msg.metadata.ragPassages && msg.metadata.ragPassages.length > 0 && (
                       <span data-testid="rag-sources" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                         RAG SOURCES: {msg.metadata.ragPassages.length}
                       </span>
                    )}
                    {msg.metadata.ocr && msg.metadata.ocr.status && (
                       <span data-testid="ocr-status" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                         OCR: {msg.metadata.ocr.mode || msg.metadata.ocr.status}
                       </span>
                    )}
                  </div>
                )}
                
                {/* MISSING_DETAILS Chips for the latest message */}
                {msg.metadata?.bookingStatus === "MISSING_DETAILS" && msg.id === messages[messages.length - 1].id && msg.metadata?.params?.missingSlots && (
                   <div className="flex flex-wrap gap-2 mt-2" data-testid="missing-slots-chips">
                     {msg.metadata.params.missingSlots.map((slot: string, idx: number) => (
                       <button
                         key={idx}
                         onClick={() => setInput(prev => prev ? `${prev} ${slot}: ` : `${slot}: `)}
                         className="px-3 py-1.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full hover:bg-indigo-500/40 transition-colors"
                       >
                         Préciser {slot}
                       </button>
                     ))}
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div 
        className={cn(
          "p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 transition-colors",
          isDragging ? "bg-indigo-900/40 border-indigo-500/50" : ""
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
          }
        }}
      >
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-2">
              <AnimatePresence>
                {files.map((file, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={idx}
                    className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 max-w-[200px]"
                  >
                    <File className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-1 text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
                    >
                      &times;
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative flex items-end gap-2 bg-slate-950 border border-slate-800 p-2 rounded-3xl shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf,text/plain,application/json"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-2xl transition-colors"
                disabled={isLoading}
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question ou uploadez vos documents..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-slate-200 placeholder-slate-500 custom-scrollbar"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <button
                type="submit"
                disabled={isLoading || (!input.trim() && files.length === 0)}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 active:scale-95 shadow-md shadow-indigo-900/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Système hybride Kiraa: Extraction LLM + Logique Métier Déterministe (Python → TS)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
