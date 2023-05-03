# MindForge

MindForge is a web application that utilizes OpenAI's GPT-3 and ElevenLabs' text-to-speech API to generate human-like text and speech based on user input. This project is built using Next.js.

## Getting Started

### Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm or yarn (package manager)

### Installation

1. Clone the repository:
   
git clone https://github.com/TheExodus90/MindForge.git --branch 0.14


2. Navigate to the project directory:

cd MindForge


3. Install the required dependencies:

npm install

or
yarn install


4. Create a `.env.local` file at the root of the project and add the necessary API keys:


OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GOOGLE_APPLICATION_CREDENTIALS= Relative Path of your Google Service Account JSON File (Download it from Google Console and paste into root folder or wherever you want.)


5. Running the Development Server

To start the development server, run:

npm run dev

or
yarn dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Generate human-like text responses based text and speech based on user input. 

This project is built using Next.js.
