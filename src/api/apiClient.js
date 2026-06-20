const BASE_URL = '/api'

export const apiClient = {
    get: async (url) => {
        const response = await fetch('${BASE_URL}${url}');
        if(!response.ok) throw new Error('API Error: ${response.status}');
        return response.json();
    },
    post: async (url, body) => {
        const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
    },
    getBlob: async (url, body) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`API Blob Error: ${response.status}`);
    return response.blob();
  }
};
