const path = require("path");
const dotenv = require("dotenv").config({ path: path.resolve(__dirname, '../../.env.local') });
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const filePath = path.join(__dirname, "audio.mp3");
const model = "whisper-1";

const formData = new FormData();
formData.append("model", model);
formData.append("file", fs.createReadStream(filePath));

console.log("Using API Key:", OPENAI_API_KEY);

axios
    .post("https://api.openai.com/v1/audio/transcriptions", formData, {
    headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        },
    })
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.error("Error:", error.message);
    });
