import ChatWidget from './components/ChatWidget';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-100 rounded-md ${className}`} />
);

export default function App() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full border-b border-zinc-100 px-8 py-3 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900">Platform.</span>
          </div>
          <div className="hidden md:flex gap-6 text-[13px] font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">Overview</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Integrations</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Deployment</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-8" />
          <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300" />
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-8">
        <header className="mb-10">
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-64 h-4" />
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 p-6 border border-zinc-100 rounded-xl bg-zinc-50/50">
                <Skeleton className="w-12 h-4 mb-4" />
                <Skeleton className="w-full h-8" />
              </div>
              <div className="col-span-1 p-6 border border-zinc-100 rounded-xl">
                <Skeleton className="w-12 h-4 mb-4" />
                <Skeleton className="w-full h-8" />
              </div>
              <div className="col-span-1 p-6 border border-zinc-100 rounded-xl">
                <Skeleton className="w-12 h-4 mb-4" />
                <Skeleton className="w-full h-8" />
              </div>
            </div>
            
            <div className="h-[400px] border border-zinc-100 rounded-2xl p-8">
              <Skeleton className="w-1/3 h-6 mb-8" />
              <div className="space-y-4">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-full h-4" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="p-6 border border-zinc-100 rounded-2xl bg-white">
              <Skeleton className="w-24 h-5 mb-6" />
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-full h-3" />
                      <Skeleton className="w-2/3 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}