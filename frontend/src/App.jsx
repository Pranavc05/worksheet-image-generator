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
      {/* Main worksheet area will go here */}
    </div>
  );
}

export default App;
