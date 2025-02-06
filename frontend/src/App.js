import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';

function App() {
  const [allCandidates, setAllCandidates] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filterType, setFilterType] = useState("top-candidates");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/candidates")
      .then(response => response.json())
      .then(data => setAllCandidates(data))
      .catch(error => console.error("Error fetching all candidates:", error));

    fetch(`http://127.0.0.1:5000/${filterType}`)
      .then(response => response.json())
      .then(data => setTopCandidates(data))
      .catch(error => console.error("Error fetching top candidates:", error));
  }, [filterType]);

  const handleToggleView = () => {
    setShowAll(prevShowAll => !prevShowAll);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const candidatesToDisplay = showAll ? allCandidates : topCandidates;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<CandidateListMain 
            candidates={candidatesToDisplay} 
            showAll={showAll} 
            handleToggleView={handleToggleView}
            handleFilterChange={handleFilterChange}
            filterType={filterType}
          />} 
        />
        <Route path="/candidate/:candidateId" element={<CandidateDetails />} />
      </Routes>
    </Router>
  );
}

function CandidateListMain({ candidates, showAll, handleToggleView, handleFilterChange, filterType }) {
  return (
    <div className="container">
      <button className="toggle-button" onClick={handleToggleView}>
        {showAll ? "Show Top Candidates" : "Show All Candidates"}
      </button>

      {!showAll && (
        <div className="filter-section">
          <select value={filterType} onChange={handleFilterChange}>
            <option value="top-candidates">Top 5 Candidates</option>
            <option value="top-education">Top 5 Education</option>
            <option value="top-work">Top 5 Work Experience</option>
          </select>
        </div>
      )}

      <ul className="candidate-list">
        {candidates.map((candidate) => (
          <li key={candidate.id} className="candidate-item">
            <Link to={`/candidate/${candidate.name}`} className="candidate-link">
              {candidate.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CandidateDetails() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const { candidateId } = useParams();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/candidates/${candidateId}`)
      .then(response => response.json())
      .then(data => setCandidate(data))
      .catch(error => {
        console.error("Error fetching candidate details:", error);
        navigate("/");
      });
  }, [candidateId, navigate]);

  if (!candidate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="candidate-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &lt; Back to List
      </button>
      <h2>{candidate.name}</h2>
      <p>Email: {candidate.email || 'N/A'}</p>
      <p>Phone: {candidate.phone || 'N/A'}</p>
      <p>Location: {candidate.location || 'N/A'}</p>
      <p>Submitted At: {candidate.submitted_at || 'N/A'}</p>
      <p>
        Work Availability:{' '}
        {candidate.work_availability ? candidate.work_availability.join(', ') : 'N/A'}
      </p>
      <p>
        Annual Salary Expectation:{' '}
        {candidate.annual_salary_expectation?.['full-time'] || 'N/A'}
      </p>
      <p>Skills: {candidate.skills ? candidate.skills.join(', ') : 'N/A'}</p>
      <p>Education: {candidate.education?.highest_level || 'N/A'}</p>
      <p>Work Experience:</p>
      <ul>
        {candidate.work_experiences && candidate.work_experiences.length > 0 ? (
          candidate.work_experiences.map((exp, index) => (
            <li key={index}>{exp.roleName} at {exp.company}</li>
          ))
        ) : (
          <li>N/A</li>
        )}
      </ul>
    </div>
  );
}

export default App;
