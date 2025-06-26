import { useState } from 'react';
import './App.css';

function App() {
  const [category, setCategory] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [includeImages, setIncludeImages] = useState(false);
  const [worksheetQuestions, setWorksheetQuestions] = useState([]);
  const [questionImages, setQuestionImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState([]);

  const handleGenerate = async () => {
    try {
      // Combine category and additionalPrompt into a single prompt string
      const prompt = `Generate a worksheet for the category: ${category}. ${additionalPrompt}`;
      const response = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      // Assume questions is a string, split into array by newlines or numbers
      const questionsArr = data.questions
        ? data.questions.split(/\n\d+\.\s|\n(?=\d+\.)/).filter(q => q.trim())
        : [];
      setWorksheetQuestions(questionsArr);
      console.log('Worksheet response:', data);
    } catch (error) {
      console.error('Error generating worksheet:', error);
    }
  };

  const handleGenerateImage = async (idx) => {
    const newLoading = [...loadingImages];
    newLoading[idx] = true;
    setLoadingImages(newLoading);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: worksheetQuestions[idx] }),
      });
      const data = await response.json();
      const newImages = [...questionImages];
      newImages[idx] = data.imageUrl;
      setQuestionImages(newImages);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      const newLoadingDone = [...loadingImages];
      newLoadingDone[idx] = false;
      setLoadingImages(newLoadingDone);
    }
  };

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
          <input type="checkbox" checked={includeImages} onChange={e => setIncludeImages(e.target.checked)} /> Check to include images
        </label>
        <textarea className="additional-prompt" placeholder="Additional Prompt" value={additionalPrompt} onChange={e => setAdditionalPrompt(e.target.value)} />
        <button className="generate-btn" onClick={handleGenerate}>Generate</button>
      </aside>
      <main className="worksheet-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>GENERATED WORKSHEET</h2>
          <button className="print-btn" onClick={() => window.print()}>
            <span role="img" aria-label="print">🖨️</span> Print
          </button>
        </div>
        <div className="questions-list">
          {worksheetQuestions.map((q, idx) => (
            <div className="worksheet-question-card" key={idx}>
              {q}
              <button className="generate-image-btn" onClick={() => handleGenerateImage(idx)} disabled={loadingImages[idx]}>
                {loadingImages[idx] ? 'Loading...' : 'Generate Image'}
              </button>
              {questionImages[idx] && (
                <img src={questionImages[idx]} alt="Generated visual" className="worksheet-image" />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
