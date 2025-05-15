// Replace the current fetchData function with this:
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
