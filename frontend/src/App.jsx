import './App.css';

function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <input type="text" placeholder="Select Category" className="category-input" />
        <label className="include-images-label">
          <input type="checkbox" /> Check to include images
        </label>
        <textarea className="additional-prompt" placeholder="Additional Prompt" />
        <button className="generate-btn">Generate</button>
      </aside>
      <main className="worksheet-area">
        <h2>GENERATED WORKSHEET</h2>
        <div className="questions-list">
          {/* Questions will be rendered here */}
        </div>
      </main>
    </div>
  );
}

export default App;
