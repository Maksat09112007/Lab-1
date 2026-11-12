export default function Page({ kicker, title, lead, children }) {
  return (
    <div className="page">
      <header className="page__header">
        <p className="page__kicker">{kicker}</p>
        <h1>{title}</h1>
        <p className="page__lead">{lead}</p>
      </header>
      <main className="page__main">{children}</main>
    </div>
  );
}
