import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  if (req.method === 'POST') {
    const form = formidable({ multiples: true });  // Correct way to initialize the form
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing the file' });
      }

      const { companyId, modelName } = fields;
      const filePath = files.file.filepath;  // Accessing file from formidable

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await fetch(`http://3.85.208.131/vectorize/${companyId}?model_name=${modelName}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return res.status(response.status).json(result);
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

