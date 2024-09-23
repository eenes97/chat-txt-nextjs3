export default async (req, res) => {
    if (req.method === 'POST') {
      const { companyId, model, chatInput } = req.body;
  
      // Make the request to the external API with chat_input as a query parameter
      const response = await fetch(
        `http://3.85.208.131/chat/${model}/${companyId}?chat_input=${encodeURIComponent(chatInput)}&vectorizer_model=bge-m3`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const result = await response.json();
      
      return res.status(response.status).json(result);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  };
  