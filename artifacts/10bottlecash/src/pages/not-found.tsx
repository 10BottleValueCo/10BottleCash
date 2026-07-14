export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold tracking-widest mb-4">404</h1>
      <p className="text-zinc-400 mb-8 uppercase tracking-wider">Page Not Found</p>
      <a href="/" className="bg-primary text-black px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
        Return Home
      </a>
    </div>
  );
}