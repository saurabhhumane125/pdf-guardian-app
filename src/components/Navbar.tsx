export default function Navbar() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
        <img
          src="/logo.svg"
          alt="PDF Guardian logo"
          className="h-9 w-auto"
        />
        <span className="text-lg font-semibold text-slate-900">
          PDF Guardian
        </span>
      </div>
    </header>
  );
}
