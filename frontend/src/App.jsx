import { useState } from 'react';
import './App.css';

function App() {
  const [category, setCategory] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <select className="category-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="math">Math</option>
          <option value="science">Science</option>
          <option value="language-arts">Language Arts</option>
          <option value="history">History</option>
          <option value="social-sciences">Social Sciences</option>
          <option value="reading">Reading</option>
          <option value="geography">Geography</option>
          <option value="art">Art</option>
          <option value="music">Music</option>
          <option value="technology">Technology</option>
          <option value="health">Health</option>
        </select>
        <label className="include-images-label">
          <input type="checkbox" /> Check to include images
        </label>
        <textarea className="additional-prompt" placeholder="Additional Prompt" value={additionalPrompt} onChange={e => setAdditionalPrompt(e.target.value)} />
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
