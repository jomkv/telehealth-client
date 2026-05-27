export function Footer() {
  return (
    <footer className="mt-24 bg-[#141413] px-6 py-16 text-white sm:px-12 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-3xl sm:text-4xl text-white">
          Care that meets you where you are.
        </h2>
        <div className="mt-16 grid grid-cols-2 gap-10 sm:grid-cols-4">
          {[
            {
              h: "Patients",
              items: [
                "Find a doctor",
                "Book a visit",
                "My records",
                "Notifications",
              ],
            },
            {
              h: "Doctors",
              items: ["Manage availability", "Consultations", "Patient roster"],
            },
            { h: "Company", items: ["About", "Careers", "Press", "Contact"] },
            {
              h: "Need help?",
              items: ["Help center", "Privacy", "Terms", "Status"],
            },
          ].map((col) => (
            <div key={col.h}>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/60">
                {col.h}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/90">
                {col.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60">
          <span>
            © {new Date().getFullYear()} Telecare. Mock data for prototype.
          </span>
          <span>v0.1 · prototype</span>
        </div>
      </div>
    </footer>
  );
}
