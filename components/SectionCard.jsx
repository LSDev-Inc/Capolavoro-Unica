export default function SectionCard({ id, title, description, children }) {
  return (
    <section id={id} className="glass rounded-3xl p-6 shadow-soft">
      <div className="mb-4">
        <h2 className="font-display text-xl text-white">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
