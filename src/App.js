import React from 'react';
import './App.css';
import CityData from './CityData.js';

function App() {
  return (
    <div id="content">
      <CityData city="Vienna" />
      <CityData city="Kunming" />
      <CityData city="London" />
    </div>
  );
}

export default App;
