export default function Home() {
  return (
    <main className="h-screen w-full bg-slate-950 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto border-x border-slate-800/50 shadow-2xl bg-slate-950/50">
        <ChatUI />
      </div>
    </main>
  );
}

import { ChatUI } from "@/components/ChatUI";
