# 🚀 A4F Web Playground

A4F Web Playground is a cutting-edge, multi-modal AI chat and search platform. It offers web search, YouTube search, academic research, code analysis, and image generation—all seamlessly integrated into a sleek interface. Built with **React**, **Next.js**, and **TypeScript**, it emphasizes extensibility and developer friendliness.

---

## ✨ Features

- 🌐 **Web Search**: AI-powered web searches with citations and complex query handling.
- 📺 **YouTube Search**: Converts YouTube results into tutorial guides with timestamps.
- 📚 **Academic Search**: Finds scholarly articles with inline citations.
- 🧠 **Buddy (Memory)**: Personal notes storage and retrieval assistant.
- 📊 **Analysis**: Code interpretation, stock, and currency analysis with Python sandbox.
- 💬 **Chat**: Rich markdown chat supporting LaTeX and code snippets.
- 🎨 **Image Generation**: Create images from prompts via the A4F API.
- 🔊 **Speech Synthesis**: Text-to-speech using ElevenLabs API.
- 📎 **File Attachments**: Attach files in chat (excluding Image mode).
- 📱 **Responsive UI**: Optimized for desktops and mobile devices.
- 🛡️ **Type Safety**: Built with TypeScript for robust development.
- 🧩 **Extensible**: Easily add new features, tools, and groups.

---

## 🏁 Getting Started

### ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18+) recommended
- npm or yarn

### 📦 Installation

1. Clone the repo:

   ```bash
   git clone <your-repo-url>
   cd a4f-web-playground-main
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:

   Create a `.env.local` file and add necessary API keys:

   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   # Add additional keys as needed
   ```

4. Launch the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Access at [http://localhost:3000](http://localhost:3000).

### 🏗️ Building for Production

```bash
npm run build
npm start
```

---

## 🧑‍💻 Usage Guide

- Select groups like Web, Buddy, Academic, YouTube, Analysis, Chat, or Image using the group selector.
- For image generation, choose "Image", type a prompt, and submit.
- Attach files where applicable (not in Image mode).
- Use the speaker icon for speech synthesis (with API key).
- Manage API keys and account settings via the UI.
- Use markdown and LaTeX for formatted math and text.
- All information in search and analysis modes includes citations for accuracy.
- UI is mobile-friendly.

---

## 🗂️ Project Structure

```
app/              # Next.js pages, layouts, providers, actions, hooks
components/       # UI components (chat, markdown, forms, sidebar)
lib/              # Utilities and types
public/           # Static assets
styles/           # CSS styles
```

---

## 🔌 API Integrations

- **Web Search**: API key needed (add in settings)
- **Image Generation**: Uses [A4F Image API](https://api.a4f.co/v1/images/generations)

---

## 🛠️ Customization

- **Modify Groups**: Edit `lib/utils.ts` and `app/actions.ts`
- **Add Tools**: Extend `groupTools` and `groupInstructions`
- **UI Tweaks**: Adjust components in `components/ui/` and `components/core/`
- **Theme**: Change styles in `styles/`

---

## 📝 Development Notes

- TypeScript ensures type safety
- Errors surface clearly in the UI
- Markdown renderer handles unique keys
- Removed default Next.js logo
- File attachments disabled in Image mode
- Easily extend groups/tools via config files

---

## 🐞 Troubleshooting

- **Build Errors**: Ensure consistent keys in configs
- **API Keys**: Verify keys are correct
- **Type Issues**: Update types when adding groups
- **Image API**: Use descriptive prompts and valid API keys

---

## 📄 License

MIT License. See [LICENSE](LICENSE)

---

## 🙏 Credits & Tech Stack

- Built by the A4F team
- Uses [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- Thanks to open-source contributors and API providers

---

## 🤝 Contributing

Contributions welcome! Open issues or pull requests for bugs or features.

---

## 📬 Contact & Support

- Questions or requests? Open an issue.
- Business inquiries: [info@a4f.co](mailto:info@a4f.co)

---

> _Happy hacking!_ 🎉
