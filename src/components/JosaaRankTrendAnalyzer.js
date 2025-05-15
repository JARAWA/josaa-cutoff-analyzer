import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

// Custom styles
const styles = {
  container: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#1e3a8a',
    fontSize: '1.875rem',
    fontWeight: '700',
  },
  instructionsBox: {
    backgroundColor: '#eff6ff',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #dbeafe',
  },
  instructionsTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1e40af',
  },
  instructionsList: {
    listStyleType: 'decimal',
    paddingLeft: '1.5rem',
    margin: '0.5rem 0',
  },
  instructionsItem: {
    marginBottom: '0.25rem',
    color: '#1e3a8a',
  },
  filtersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  filterGroup: {
    marginBottom: '1rem',
  },
  filterLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
    color: '#374151',
  },
  filterSelect: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '0.875rem',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  resetButton: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  compareButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  chartContainer: {
    marginBottom: '2rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  chartWrapper: {
    height: '400px',
    width: '100%',
  },
  tableContainer: {
    marginTop: '1.5rem',
    overflow: 'auto',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  tableTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#111827',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableHeaderCell: {
    padding: '0.75rem 1rem',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #e5e7eb',
  },
  tableBody: {
    backgroundColor: 'white',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  footer: {
    marginTop: '2rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  errorContainer: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    borderRadius: '0.375rem',
    color: '#b91c1c',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '16rem',
  },
  loadingText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151',
  },
  warningContainer: {
    padding: '1rem',
    backgroundColor: '#fffbeb',
    borderLeft: '4px solid #f59e0b',
    marginBottom: '1rem',
  },
  warningText: {
    fontSize: '0.875rem',
    color: '#92400e',
  },
  programChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  programChip: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: '9999px',
    padding: '0.25rem 0.75rem',
  },
  colorDot: {
    width: '0.75rem',
    height: '0.75rem',
    borderRadius: '9999px',
    marginRight: '0.5rem',
  },
  chipText: {
    fontSize: '0.875rem',
    marginRight: '0.5rem',
  },
  removeButton: {
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
};

// Sample data for demo purposes (in case the CSV fetch fails)
const sampleData = [
  {
    "Institute": "Visvesvaraya National Institute of Technology, Nagpur",
    "Academic Program Name": "Mechanical Engineering (4 Years, Bachelor of Technology)",
    "Quota": "HS",
    "Category": "OBC-NCL",
    "Gender": "Gender-Neutral",
    "Round": 1,
    "Opening Rank": 5534,
    "Closing Rank": 7743
  },
  {
    "Institute": "Visvesvaraya National Institute of Technology, Nagpur",
    "Academic Program Name": "Mechanical Engineering (4 Years, Bachelor of Technology)",
    "Quota": "HS",
    "Category": "OBC-NCL",
    "Gender": "Gender-Neutral",
    "Round": 2,
    "Opening Rank": 6735,
    "Closing Rank": 8773
  },
  {
    "Institute": "Visvesvaraya National Institute of Technology, Nagpur",
    "Academic Program Name": "Mechanical Engineering (4 Years, Bachelor of Technology)",
    "Quota": "HS",
    "Category": "OBC-NCL",
    "Gender": "Gender-Neutral",
    "Round": 3,
    "Opening Rank": 6735,
    "Closing Rank": 8779
  },
  {
    "Institute": "Visvesvaraya National Institute of Technology, Nagpur",
    "Academic Program Name": "Mechanical Engineering (4 Years, Bachelor of Technology)",
    "Quota": "HS",
    "Category": "OBC-NCL",
    "Gender": "Gender-Neutral",
    "Round": 4,
    "Opening Rank": 6735,
    "Closing Rank": 8779
  },
  {
    "Institute": "Visvesvaraya National Institute of Technology, Nagpur",
    "Academic Program Name": "Mechanical Engineering (4 Years, Bachelor of Technology)",
    "Quota": "HS",
    "Category": "OBC-NCL",
    "Gender": "Gender-Neutral",
    "Round": 5,
    "Opening Rank": 6735,
    "Closing Rank": 8779
  }
];

const JosaaRankTrendAnalyzer = () => {
  // State variables
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    institute: '',
    collegeType: '',
    program: '',
    quota: '',
    category: '',
    gender: ''
  });
  
  // Options for filters
  const [options, setOptions] = useState({
    institutes: [],
    collegeTypes: [],
    programs: [],
    quotas: [],
    categories: [],
    genders: []
  });
  
  // Selected programs for comparison
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  
  // Colors for different lines
  const colors = ['#FF5733', '#33A8FF', '#33FF57', '#FF33A8', '#A833FF', '#FFDD33', '#FF3333', '#33FFDD'];

  // Load and parse the CSV data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/josaa2024_cutoff.csv');
        
        if (!response.ok) {
          // If CSV fetch fails, use sample data as fallback
          setData(sampleData);
          
          // Extract options from sample data
          setOptions({
            institutes: ["Visvesvaraya National Institute of Technology, Nagpur"],
            collegeTypes: ["NIT"],
            programs: ["Mechanical Engineering (4 Years, Bachelor of Technology)"],
            quotas: ["HS"],
            categories: ["OBC-NCL"],
            genders: ["Gender-Neutral"]
          });
          
          setLoading(false);
          return;
        }
        
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (result) => {
            setData(result.data);
            
            // Extract unique values for filter options
            const extractOptions = (field) => [...new Set(result.data.map(row => row[field]))].filter(Boolean).sort();
            
            setOptions({
              institutes: extractOptions('Institute'),
              collegeTypes: extractOptions('College Type'),
              programs: extractOptions('Academic Program Name'),
              quotas: extractOptions('Quota'),
              categories: extractOptions('Category'),
              genders: extractOptions('Gender')
            });
            
            setLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setLoading(false);
          }
        });
      } catch (error) {
        // Fallback to sample data on error
        setData(sampleData);
        
        setOptions({
          institutes: ["Visvesvaraya National Institute of Technology, Nagpur"],
          collegeTypes: ["NIT"],
          programs: ["Mechanical Engineering (4 Years, Bachelor of Technology)"],
          quotas: ["HS"],
          categories: ["OBC-NCL"],
          genders: ["Gender-Neutral"]
        });
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter data based on selected filters
  useEffect(() => {
    if (data.length === 0) return;
    
    let filtered = [...data];
    
    // Apply filters
    if (filters.collegeType) {
      filtered = filtered.filter(row => row['College Type'] === filters.collegeType);
    }
    
    if (filters.institute) {
      filtered = filtered.filter(row => row.Institute === filters.institute);
    }
    
    if (filters.program) {
      filtered = filtered.filter(row => row['Academic Program Name'] === filters.program);
    }
    
    if (filters.quota) {
      filtered = filtered.filter(row => row.Quota === filters.quota);
    }
    
    if (filters.category) {
      filtered = filtered.filter(row => row.Category === filters.category);
    }
    
    if (filters.gender) {
      filtered = filtered.filter(row => row.Gender === filters.gender);
    }
    
    setFilteredData(filtered);
  }, [data, filters]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Reset subsequent filters when changing higher-level filters
    if (name === 'collegeType') {
      setFilters(prev => ({
        ...prev,
        collegeType: value,
        institute: '',
        program: '',
        quota: '',
        category: '',
        gender: ''
      }));
    } else if (name === 'institute') {
      setFilters(prev => ({
        ...prev,
        institute: value,
        program: '',
        quota: '',
        category: '',
        gender: ''
      }));
    }
  };
  
  // Add current selection to comparison
  const addToComparison = () => {
    // Create a unique identifier for the selected program
    const programKey = `${filters.institute} | ${filters.program} | ${filters.quota} | ${filters.category} | ${filters.gender}`;
    
    // Check if already in comparison
    if (!selectedPrograms.some(p => p.key === programKey) && 
        filters.institute && filters.program && filters.quota && filters.category && filters.gender) {
      
      // Get data for all rounds for this program
      const programData = data.filter(row =>
        row.Institute === filters.institute &&
        row['Academic Program Name'] === filters.program &&
        row.Quota === filters.quota &&
        row.Category === filters.category &&
        row.Gender === filters.gender
      ).sort((a, b) => a.Round - b.Round);
      
      // Only add if we have data for at least 2 rounds
      if (programData.length >= 2) {
        setSelectedPrograms(prev => [
          ...prev,
          {
            key: programKey,
            name: `${filters.institute.split(',')[0]} - ${filters.program.split('(')[0].trim()}`,
            shortName: filters.program.split('(')[0].trim(),
            data: programData,
            color: colors[selectedPrograms.length % colors.length]
          }
        ]);
        setCompareMode(true);
      }
    }
  };
  
  // Remove a program from comparison
  const removeFromComparison = (key) => {
    setSelectedPrograms(prev => prev.filter(p => p.key !== key));
    if (selectedPrograms.length <= 1) {
      setCompareMode(false);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      institute: '',
      collegeType: '',
      program: '',
      quota: '',
      category: '',
      gender: ''
    });
    setSelectedPrograms([]);
    setCompareMode(false);
  };
  
  // Prepare trend data for charts
  const prepareTrendData = () => {
    // Group filtered data by round
    const roundsData = {};
    
    filteredData.forEach(row => {
      if (!roundsData[row.Round]) {
        roundsData[row.Round] = {
          round: row.Round,
          openingRank: row['Opening Rank'],
          closingRank: row['Closing Rank']
        };
      }
    });
    
    // Convert to array and sort by round
    return Object.values(roundsData).sort((a, b) => a.round - b.round);
  };
  
  // Prepare comparison data for multiple programs
  const prepareComparisonData = (type) => {
    const rounds = [1, 2, 3, 4, 5];
    return rounds.map(round => {
      const point = { round };
      
      if (type === 'both') {
        selectedPrograms.forEach(program => {
          const roundData = program.data.find(d => d.Round === round);
          if (roundData) {
            point[`${program.shortName}-opening`] = roundData['Opening Rank'];
            point[`${program.shortName}-closing`] = roundData['Closing Rank'];
          }
        });
      } else {
        selectedPrograms.forEach(program => {
          const roundData = program.data.find(d => d.Round === round);
          if (roundData) {
            point[program.shortName] = roundData[type === 'opening' ? 'Opening Rank' : 'Closing Rank'];
          }
        });
      }
      
      return point;
    });
  };
  
  // Check if we have trend data
  const hasTrendData = () => {
    const trendData = prepareTrendData();
    return trendData.length >= 2;
  };
  
  // Get filtered options based on current selections
  const getFilteredOptions = (field) => {
    if (!data.length) return [];
    
    let filtered = [...data];
    
    // Apply existing filters to get relevant options
    if (filters.collegeType && field !== 'collegeType') {
      filtered = filtered.filter(row => row['College Type'] === filters.collegeType);
    }
    
    if (filters.institute && field !== 'institute' && field !== 'collegeType') {
      filtered = filtered.filter(row => row.Institute === filters.institute);
    }
    
    if (filters.program && field !== 'program' && field !== 'institute' && field !== 'collegeType') {
      filtered = filtered.filter(row => row['Academic Program Name'] === filters.program);
    }
    
    if (filters.quota && field !== 'quota' && field !== 'program' && field !== 'institute' && field !== 'collegeType') {
      filtered = filtered.filter(row => row.Quota === filters.quota);
    }
    
    if (filters.category && field !== 'category' && field !== 'quota' && field !== 'program' && field !== 'institute' && field !== 'collegeType') {
      filtered = filtered.filter(row => row.Category === filters.category);
    }
    
    // Extract unique values for the requested field
    return [...new Set(filtered.map(row => {
      switch(field) {
        case 'institute': return row.Institute;
        case 'collegeType': return row['College Type'];
        case 'program': return row['Academic Program Name'];
        case 'quota': return row.Quota;
        case 'category': return row.Category;
        case 'gender': return row.Gender;
        default: return '';
      }
    }))].filter(Boolean).sort();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={{fontWeight: 'bold'}}>Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>JoSAA 2024 Rank Trend Analyzer</h1>
      
      <div style={styles.instructionsBox}>
        <h2 style={styles.instructionsTitle}>How to use:</h2>
        <ol style={styles.instructionsList}>
          <li style={styles.instructionsItem}>Select a college type (IIT, NIT, etc.)</li>
          <li style={styles.instructionsItem}>Choose a specific institute</li>
          <li style={styles.instructionsItem}>Select an academic program</li>
          <li style={styles.instructionsItem}>Choose quota, category, and gender</li>
          <li style={styles.instructionsItem}>View the opening and closing rank trends across rounds</li>
          <li style={styles.instructionsItem}>Add multiple programs for comparison</li>
        </ol>
      </div>
      
      <div style={styles.filtersContainer}>
        {/* Filter dropdowns */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>College Type</label>
          <select
            name="collegeType"
            value={filters.collegeType}
            onChange={handleFilterChange}
            style={styles.filterSelect}
          >
            <option value="">All College Types</option>
            {options.collegeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Institute</label>
          <select
            name="institute"
            value={filters.institute}
            onChange={handleFilterChange}
            style={styles.filterSelect}
            disabled={!filters.collegeType}
          >
            <option value="">Select Institute</option>
            {getFilteredOptions('institute').map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Academic Program</label>
          <select
            name="program"
            value={filters.program}
            onChange={handleFilterChange}
            style={styles.filterSelect}
            disabled={!filters.institute}
          >
            <option value="">Select Program</option>
            {getFilteredOptions('program').map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Quota</label>
          <select
            name="quota"
            value={filters.quota}
            onChange={handleFilterChange}
            style={styles.filterSelect}
            disabled={!filters.program}
          >
            <option value="">Select Quota</option>
            {getFilteredOptions('quota').map(quota => (
              <option key={quota} value={quota}>{quota}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            style={styles.filterSelect}
            disabled={!filters.quota}
          >
            <option value="">Select Category</option>
            {getFilteredOptions('category').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Gender</label>
          <select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
            style={styles.filterSelect}
            disabled={!filters.category}
          >
            <option value="">Select Gender</option>
            {getFilteredOptions('gender').map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={styles.buttonsContainer}>
        <button 
          onClick={resetFilters}
          style={styles.resetButton}
        >
          Reset Filters
        </button>
        
        <button 
          onClick={addToComparison}
          disabled={!filters.institute || !filters.program || !filters.quota || !filters.category || !filters.gender}
          style={
            (!filters.institute || !filters.program || !filters.quota || !filters.category || !filters.gender)
              ? {...styles.compareButton, ...styles.disabledButton}
              : styles.compareButton
          }
        >
          Add to Comparison
        </button>
      </div>
      
      {/* Single program view */}
      {!compareMode && hasTrendData() && (
        <div style={{marginBottom: '2rem'}}>
          <h2 style={styles.sectionTitle}>
            Rank Trends for {filters.institute} - {filters.program} ({filters.quota}, {filters.category}, {filters.gender})
          </h2>
          
          <div style={{marginBottom: '1.5rem'}}>
            {/* Combined Opening and Closing Rank Chart */}
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Opening and Closing Rank Trends</h3>
              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareTrendData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="round" 
                      label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} 
                      reversed={true}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="openingRank"
                      name="Opening Rank"
                      stroke="#FF5733"
                      activeDot={{ r: 8 }}
                      strokeWidth={3}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="closingRank"
                      name="Closing Rank"
                      stroke="#33A8FF"
                      activeDot={{ r: 8 }}
                      strokeWidth={3}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Round-wise Cutoff Table */}
            <div style={styles.tableContainer}>
              <h3 style={styles.tableTitle}>Round-wise Cutoff Table</h3>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Round</th>
                    <th style={styles.tableHeaderCell}>Opening Rank</th>
                    <th style={styles.tableHeaderCell}>Closing Rank</th>
                    <th style={styles.tableHeaderCell}>Difference</th>
                  </tr>
                </thead>
                <tbody style={styles.tableBody}>
                  {prepareTrendData().map((roundData) => (
                    <tr key={roundData.round} style={styles.tableRow}>
                      <td style={styles.tableCell}>{roundData.round}</td>
                      <td style={styles.tableCell}>{roundData.openingRank?.toLocaleString() || "N/A"}</td>
                      <td style={styles.tableCell}>{roundData.closingRank?.toLocaleString() || "N/A"}</td>
                      <td style={styles.tableCell}>
                        {roundData.openingRank && roundData.closingRank 
                          ? Math.abs(roundData.closingRank - roundData.openingRank).toLocaleString() 
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Comparison view */}
      {compareMode && selectedPrograms.length > 0 && (
        <div style={{marginBottom: '2rem'}}>
          <h2 style={styles.sectionTitle}>Program Comparison</h2>
          
          <div style={{marginBottom: '1rem'}}>
            <h3 style={styles.chartTitle}>Selected Programs:</h3>
            <div style={styles.programChips}>
              {selectedPrograms.map(program => (
                <div key={program.key} style={styles.programChip}>
                  <div style={{...styles.colorDot, backgroundColor: program.color}}></div>
                  <span style={styles.chipText}>{program.name}</span>
                  <button
                    onClick={() => removeFromComparison(program.key)}
                    style={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{marginBottom: '1.5rem'}}>
            {/* Combined Opening and Closing Rank Comparison Chart */}
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Opening and Closing Rank Comparison</h3>
              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareComparisonData('both')}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="round" 
                      label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} 
                      reversed={true}
                    />
                    <Tooltip />
                    <Legend />
                    {selectedPrograms.map(program => (
                      <React.Fragment key={program.key}>
                        <Line
                          type="monotone"
                          dataKey={`${program.shortName}-opening`}
                          name={`${program.shortName} (Opening)`}
                          stroke={program.color}
                          strokeDasharray="3 3"
                          activeDot={{ r: 6 }}
                          strokeWidth={3}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey={`${program.shortName}-closing`}
                          name={`${program.shortName} (Closing)`}
                          stroke={program.color}
                          activeDot={{ r: 6 }}
                          strokeWidth={3}
                          connectNulls
                        />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Round-wise Cutoff Table for Comparison */}
            <div style={styles.tableContainer}>
              <h3 style={styles.tableTitle}>Round-wise Cutoff Comparison</h3>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Program</th>
                    <th style={styles.tableHeaderCell}>Type</th>
                    <th style={styles.tableHeaderCell}>Round 1</th>
                    <th style={styles.tableHeaderCell}>Round 2</th>
                    <th style={styles.tableHeaderCell}>Round 3</th>
                    <th style={styles.tableHeaderCell}>Round 4</th>
                    <th style={styles.tableHeaderCell}>Round 5</th>
                  </tr>
                </thead>
                <tbody style={styles.tableBody}>
                  {selectedPrograms.flatMap(program => [
                    <tr key={`${program.key}-opening`} style={{...styles.tableRow, backgroundColor: '#f9fafb'}}>
                      <td style={{...styles.tableCell, fontWeight: '500'}} rowSpan="2">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          <div style={{...styles.colorDot, backgroundColor: program.color}}></div>
                          {program.shortName}
                        </div>
                      </td>
                      <td style={styles.tableCell}>Opening</td>
                      {[1, 2, 3, 4, 5].map(round => {
                        const roundData = program.data.find(d => d.Round === round);
                        return (
                          <td key={round} style={styles.tableCell}>
                            {roundData ? roundData['Opening Rank']?.toLocaleString() : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>,
                    <tr key={`${program.key}-closing`} style={styles.tableRow}>
                      <td style={styles.tableCell}>Closing</td>
                      {[1, 2, 3, 4, 5].map(round => {
                        const roundData = program.data.find(d => d.Round === round);
                        return (
                          <td key={round} style={styles.tableCell}>
                            {roundData ? roundData['Closing Rank']?.toLocaleString() : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                  ])}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* No data message */}
      {!hasTrendData() && !compareMode && (
        <div style={styles.warningContainer}>
          <p style={styles.warningText}>
            {(filters.institute && filters.program && filters.quota && filters.category && filters.gender) 
              ? "No trend data available for the selected filters. Please try a different selection."
              : "Please select all filters to view rank trends."}
          </p>
        </div>
      )}
      
      {compareMode && selectedPrograms.length === 0 && (
        <div style={styles.warningContainer}>
          <p style={styles.warningText}>
            No programs selected for comparison. Use the "Add to Comparison" button after selecting a program.
          </p>
        </div>
      )}
      
      <div style={styles.footer}>
        <p>Data source: JoSAA 2024 Cutoff Ranks</p>
        <p>Note: Lower rank number indicates better performance. Charts are plotted with reversed Y-axis so that higher position means better rank.</p>
      </div>
    </div>
  );
};

export default JosaaRankTrendAnalyzer;
