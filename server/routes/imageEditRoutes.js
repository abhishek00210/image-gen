// server/routes/imageEditRoutes.js

import express from 'express';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();

router.post('/edit', async (req, res) => {
  try {
    const { image, mask, prompt, n = 1, size = '1024x1024' } = req.body;

    if (!image || !mask || !prompt) {
      return res.status(400).json({ error: 'Image, mask, and prompt are required.' });
    }

    // Decode Base64 image and mask
    const imageBuffer = Buffer.from(image, 'base64');
    const maskBuffer = Buffer.from(mask, 'base64');

    // Prepare form data
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'image.png',
      contentType: 'image/png',
    });
    form.append('mask', maskBuffer, {
      filename: 'mask.png',
      contentType: 'image/png',
    });
    form.append('prompt', prompt);
    form.append('n', n);
    form.append('size', size);

    // Make request to OpenAI Image Edit API
    const response = await axios.post('https://api.openai.com/v1/images/edits', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    // Respond with the data from OpenAI
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in Image Edit Route:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to edit image.' });
  }
});

export default router;
