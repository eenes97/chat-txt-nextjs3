export default async (req, res) => {
  if (req.method === 'POST') {
    const { companyId, model, chatInput } = req.body;

    // Check for missing required fields
    if (!companyId || !model || !chatInput) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      // Define the external API URL using an environment variable
      const apiUrl = process.env.EXTERNAL_API_URL || 'http://3.85.208.131';

      // Make the request to the external API with chat_input as a query parameter
      const response = await fetch(
        `${apiUrl}/chat/${model}/${companyId}?chat_input=${encodeURIComponent(chatInput)}&vectorizer_model=bge-m3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // If the response is not OK (status code 2xx), handle errors properly
      if (!response.ok) {
        const errorData = await response.json().catch(() => {
          return { message: 'Unknown error from external API' };
        });
        return res.status(response.status).json({ message: 'Error from external API', error: errorData });
      }

      // Parse the JSON result from the external API
      const result = await response.json();

      // Return the result to the client
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching from external API:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
