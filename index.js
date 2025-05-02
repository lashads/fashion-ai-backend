require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get('/', (req, res) => {
  res.send('✅ Fashion AI Backend is running.');
});

app.post('/generate', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Cloudinary upload failed' });
      }

      const imageUrl = result.secure_url;

      const response = await axios.post(
        'https://api.freepik.com/v1/ai/image-to-video/kling-pro',
        {
          prompt: "A fashion model walking through a futuristic runway",
          image_url: imageUrl,
          duration: 4,
          cfg_scale: 0.5
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-freepik-api-key': process.env.FREEPIK_API_KEY
          }
        }
      );

      res.json({ video_url: response.data.video_url });
    });

    req.file.stream.pipe(uploadStream);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
