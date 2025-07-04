import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import './App.css';

function App() {
  const [category, setCategory] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [includeImages, setIncludeImages] = useState(false);
  const [worksheetQuestions, setWorksheetQuestions] = useState([]);
  const [questionImages, setQuestionImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState([]);
  const [loadingWorksheet, setLoadingWorksheet] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [promptError, setPromptError] = useState('');

  const handleGenerate = async () => {
    // Clear previous errors
    setCategoryError('');
    setPromptError('');
    
    // Validate category selection
    if (!category || category.trim() === '') {
      setCategoryError('Please select a category');
      return;
    }
    
    // Validate additional prompt
    if (!additionalPrompt || additionalPrompt.trim() === '') {
      setPromptError('Please enter additional details for the worksheet');
      return;
    }
    
    setLoadingWorksheet(true);
    try {
      // Combine category and additionalPrompt into a single prompt string
      const prompt = `Generate a worksheet for the category: ${category}. ${additionalPrompt}`;
      const response = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      let questionsArr = [];
      if (Array.isArray(data.questions)) {
        questionsArr = data.questions.map(q => (typeof q === 'string' ? q : q.question)).slice(0, 3);
      }
      setWorksheetQuestions(questionsArr);
      console.log('Worksheet response:', data);
    } catch (error) {
      console.error('Error generating worksheet:', error);
    } finally {
      setLoadingWorksheet(false);
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
        {categoryError && <div className="error-message">{categoryError}</div>}
        <label className="include-images-label">
          <input type="checkbox" checked={includeImages} onChange={e => {
            setIncludeImages(e.target.checked);
            if (!e.target.checked) {
              setQuestionImages([]);
              setLoadingImages([]);
            }
          }} /> Check to include images
        </label>
        <textarea className="additional-prompt" placeholder="Additional Prompt" value={additionalPrompt} onChange={e => setAdditionalPrompt(e.target.value)} />
        {promptError && <div className="error-message">{promptError}</div>}
        <button className="generate-btn" onClick={handleGenerate}>Generate</button>
      </aside>
      <main className="worksheet-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>GENERATED WORKSHEET</h2>
          <button className="print-btn" onClick={() => window.print()}>
            <span role="img" aria-label="print">🖨️</span> Print
          </button>
        </div>
        {loadingWorksheet ? (
          <div className="worksheet-loading">
            <CircularProgress size={40} />
            <div style={{ marginTop: '16px' }}>Generating worksheet...</div>
          </div>
        ) : (
          <div className="questions-list">
            {worksheetQuestions.map((q, idx) => (
              <div className="worksheet-question-card" key={idx}>
                {q}
                {includeImages && (
                  <>
                    <button className="generate-image-btn" onClick={() => handleGenerateImage(idx)} disabled={loadingImages[idx]}>
                      {loadingImages[idx] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CircularProgress size={16} />
                          Loading...
                        </div>
                      ) : questionImages[idx] ? 'Re-Generate Image' : 'Generate Image'}
                    </button>
                    {questionImages[idx] && (
                      <img src={questionImages[idx]} alt="Generated visual" className="worksheet-image" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
  );
}

export default App;
