import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Important to prevent Next.js from parsing the form data
  },
};

export default async (req, res) => {
  if (req.method === 'POST') {
    const form = formidable({ multiples: false }); // Initialize formidable to handle single file upload

    // Parse form data
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Error parsing the file' });
      }

      try {
        const { companyId, modelName } = fields;
        const file = files.file;

        if (!file) {
          return res.status(400).json({ error: 'File is missing' });
        }

        const filePath = file.filepath; // Access file path from formidable

        // Prepare form data for the external API
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath)); // Attach the file stream to formData

        // Fetch the external API URL from environment variables, fallback to default if undefined
        const apiUrl = process.env.EXTERNAL_API_URL || 'http://3.85.208.131';

        // Make the request to the external API
        const response = await fetch(`${apiUrl}/vectorize/${companyId}?model_name=${modelName}`, {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders(), // Set correct headers for form data
        });

        // Handle non-OK response from the external API
        if (!response.ok) {
          const errorResult = await response.json();
          return res.status(response.status).json({
            error: 'Error from external API',
            details: errorResult,
          });
        }

        const result = await response.json();

        // Clean up the temporary file after uploading it to the external API
        fs.unlinkSync(filePath); // Delete the temporary file

        return res.status(200).json(result);
      } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
};
