import "./App.css";

function App() {
  return (
    <div className="app">
      <main className="antara-shell">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>ANTARA</span>
        </div>

        <section className="hero">
          <p className="eyebrow">YOUR PRIVATE SPACE</p>

          <h1>
            Your story.
            <br />
            <em>Your control.</em>
          </h1>

          <p className="hero-copy">
            A private space to record, preserve and prepare — at your pace.
          </p>

          <button className="primary-button">Enter ANTARA</button>
        </section>

        <p className="privacy-note">
          Nothing leaves this space without your choice.
        </p>
      </main>
    </div>
  );
}

export default App;