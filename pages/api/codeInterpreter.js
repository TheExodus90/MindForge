const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

console.log('Initializing OpenAI configuration...');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/api/codeInterpreter', upload.single('file'), async (req, res) => {
    console.log('Received request on /api/codeInterpreter');

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        console.log('Reading file from path:', req.file.path);
        const fileBuffer = fs.readFileSync(req.file.path);
        console.log('File read successfully, size:', fileBuffer.length);

        console.log('Creating file in OpenAI...');
        const uploadedFile = await openai.createFile({
            file: fileBuffer,
            purpose: 'answers',
        });
        console.log('File created in OpenAI, file ID:', uploadedFile.data.id);

        // Clean up the temporary file
        console.log('Deleting temporary file:', req.file.path);
        fs.unlinkSync(req.file.path);

        console.log('Creating assistant with OpenAI...');
        const assistant = await openai.createAssistant({
            model: "gpt-4-1106-preview",
            tools: [{"type": "code_interpreter"}],
            file_ids: [uploadedFile.data.id]
        });
        console.log('Assistant created, ID:', assistant.data.id);

        res.json({ assistantId: assistant.data.id });
    } catch (error) {
        console.error("Error in /api/codeInterpreter:", error);
        res.status(500).json({ message: "Internal Server Error" });

        // Clean up the temporary file in case of an error
        if (req.file && req.file.path) {
            console.log('Deleting temporary file due to error:', req.file.path);
            fs.unlinkSync(req.file.path);
        }
    }
});

module.exports = router;
