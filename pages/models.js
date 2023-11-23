// pages/models.js

import { useEffect, useState } from 'react';

export default function ModelsPage() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    async function fetchModels() {
      const response = await fetch('/api/listModels');
      const data = await response.json();
      setModels(data.data); // Access the 'data' property of the response
    }
  
    fetchModels();
  }, []);
  
  return (
    <div>
      <h1>Available Models</h1>
      <ul>
        {Array.isArray(models) && models.map(model => (
          <li key={model.id}>{model.id}</li>
        ))}
      </ul>
    </div>
  );
}
