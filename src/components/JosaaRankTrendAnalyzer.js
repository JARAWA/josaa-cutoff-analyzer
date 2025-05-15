import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

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
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Load and parse the CSV data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/josaa2024_cutoff.csv');
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
        setError(`Error loading file: ${error.message}`);
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
    return <div className="flex items-center justify-center h-64">
      <div className="text-xl font-semibold">Loading data...</div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p className="font-bold">Error:</p>
      <p>{error}</p>
    </div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">JoSAA 2024 Rank Trend Analyzer</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">How to use:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select a college type (IIT, NIT, etc.)</li>
          <li>Choose a specific institute</li>
          <li>Select an academic program</li>
          <li>Choose quota, category, and gender</li>
          <li>View the opening and closing rank trends across rounds</li>
          <li>Add multiple programs for comparison</li>
        </ol>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Filter dropdowns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College Type</label>
          <select
            name="collegeType"
            value={filters.collegeType}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="">All College Types</option>
            {options.collegeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
          <select
            name="institute"
            value={filters.institute}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            disabled={!filters.collegeType}
          >
            <option value="">Select Institute</option>
            {getFilteredOptions('institute').map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Program</label>
          <select
            name="program"
            value={filters.program}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            disabled={!filters.institute}
          >
            <option value="">Select Program</option>
            {getFilteredOptions('program').map(prog => (
              <option key={prog} value={prog}>{prog}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quota</label>
          <select
            name="quota"
            value={filters.quota}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            disabled={!filters.program}
          >
            <option value="">Select Quota</option>
            {getFilteredOptions('quota').map(quota => (
              <option key={quota} value={quota}>{quota}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            disabled={!filters.quota}
          >
            <option value="">Select Category</option>
            {getFilteredOptions('category').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            disabled={!filters.category}
          >
            <option value="">Select Gender</option>
            {getFilteredOptions('gender').map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-between mb-6">
        <button 
          onClick={resetFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Reset Filters
        </button>
        
        <button 
          onClick={addToComparison}
          disabled={!filters.institute || !filters.program || !filters.quota || !filters.category || !filters.gender}
          className={`font-semibold py-2 px-4 rounded ${
            (!filters.institute || !filters.program || !filters.quota || !filters.category || !filters.gender)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Add to Comparison
        </button>
      </div>
      
      {/* Single program view */}
      {!compareMode && hasTrendData() && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Rank Trends for {filters.institute} - {filters.program} ({filters.quota}, {filters.category}, {filters.gender})
          </h2>
          
          <div className="mb-6">
            {/* Combined Opening and Closing Rank Chart */}
            <div className="border p-4 rounded bg-white shadow">
              <h3 className="text-lg font-medium mb-2">Opening and Closing Rank Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareTrendData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} reversed={true} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="openingRank"
                      name="Opening Rank"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="closingRank"
                      name="Closing Rank"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Round-wise Cutoff Table */}
            <div className="mt-6 border rounded bg-white shadow overflow-x-auto">
              <h3 className="text-lg font-medium p-4 border-b">Round-wise Cutoff Table</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prepareTrendData().map((roundData) => (
                    <tr key={roundData.round}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{roundData.round}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roundData.openingRank?.toLocaleString() || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roundData.closingRank?.toLocaleString() || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Program Comparison</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Selected Programs:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedPrograms.map(program => (
                <div key={program.key} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: program.color }}></div>
                  <span className="mr-2 text-sm">{program.name}</span>
                  <button
                    onClick={() => removeFromComparison(program.key)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            {/* Combined Opening and Closing Rank Comparison Chart */}
            <div className="border p-4 rounded bg-white shadow">
              <h3 className="text-lg font-medium mb-2">Opening and Closing Rank Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareComparisonData('both')}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} reversed={true} />
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
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey={`${program.shortName}-closing`}
                          name={`${program.shortName} (Closing)`}
                          stroke={program.color}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Round-wise Cutoff Table for Comparison */}
            <div className="mt-6 border rounded bg-white shadow overflow-x-auto">
              <h3 className="text-lg font-medium p-4 border-b">Round-wise Cutoff Comparison</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round 1</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round 2</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round 3</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round 4</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round 5</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change (R1→R5)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPrograms.flatMap(program => [
                    <tr key={`${program.key}-opening`} className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" rowSpan="2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: program.color }}></div>
                          {program.shortName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Opening</td>
                      {[1, 2, 3, 4, 5].map(round => {
                        const roundData = program.data.find(d => d.Round === round);
                        return (
                          <td key={round} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {roundData ? roundData['Opening Rank']?.toLocaleString() : 'N/A'}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const round1 = program.data.find(d => d.Round === 1);
                          const round5 = program.data.find(d => d.Round === 5);
                          if (round1 && round5 && round1['Opening Rank'] && round5['Opening Rank']) {
                            const diff = round1['Opening Rank'] - round5['Opening Rank'];
                            const percentChange = ((diff / round1['Opening Rank']) * 100).toFixed(1);
                            return `${diff > 0 ? '+' : ''}${diff.toLocaleString()} (${diff > 0 ? '+' : ''}${percentChange}%)`;
                          }
                          return 'N/A';
                        })()}
                      </td>
                    </tr>,
                    <tr key={`${program.key}-closing`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Closing</td>
                      {[1, 2, 3, 4, 5].map(round => {
                        const roundData = program.data.find(d => d.Round === round);
                        return (
                          <td key={round} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {roundData ? roundData['Closing Rank']?.toLocaleString() : 'N/A'}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const round1 = program.data.find(d => d.Round === 1);
                          const round5 = program.data.find(d => d.Round === 5);
                          if (round1 && round5 && round1['Closing Rank'] && round5['Closing Rank']) {
                            const diff = round1['Closing Rank'] - round5['Closing Rank'];
                            const percentChange = ((diff / round1['Closing Rank']) * 100).toFixed(1);
                            return `${diff > 0 ? '+' : ''}${diff.toLocaleString()} (${diff > 0 ? '+' : ''}${percentChange}%)`;
                          }
                          return 'N/A';
                        })()}
                      </td>
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {(filters.institute && filters.program && filters.quota && filters.category && filters.gender) 
                  ? "No trend data available for the selected filters. Please try a different selection."
                  : "Please select all filters to view rank trends."}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {compareMode && selectedPrograms.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No programs selected for comparison. Use the "Add to Comparison" button after selecting a program.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p>Data source: JoSAA 2024 Cutoff Ranks</p>
        <p>Note: Lower rank number indicates better performance. Charts are plotted with reversed Y-axis so that higher position means better rank.</p>
      </div>
    </div>
  );
};

export default JosaaRankTrendAnalyzer;
