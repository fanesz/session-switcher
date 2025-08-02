# 🔄 Session Switcher

**Session Switcher** is a browser extension that allows users to manage, save, and switch between multiple login sessions with ease and 100% free!.
It's especially useful for developers, testers, or anyone who frequently switches between accounts or environments.

https://github.com/user-attachments/assets/480baf62-3279-45be-8a30-88f76a90a5f8

---

## 🌍 Store Links

- **Chrome Web Store** → [Session Switcher](https://chromewebstore.google.com/detail/session-switcher/mgekglkbhkpphbnhkmlhlnehaplibleh)
- **Firefox Add-ons** → [Session Switcher](https://addons.mozilla.org/en-US/firefox/addon/session-switcher)
- **Edge Add-ons** → [Session Switcher](https://chromewebstore.google.com/detail/session-switcher/mgekglkbhkpphbnhkmlhlnehaplibleh) (use chrome webstore)

---

## 🚀 Features

- 🔐 **Save Login Sessions**  
  Capture and store cookies for the current session.

- 🔄 **Switch Between Sessions Instantly**  
  Load saved sessions with one click — no more logging in/out manually.

- 💾 **Persistent Storage**  
  All session data is stored locally and securely in your browser.

- 🌐 **Multi-Site Support**  
  Manage sessions for different websites independently.

---

## 🐞 Bug Report / Feature Request

Kindly create an issue [here](https://github.com/fanesz/session-switcher/issues).
<br>Write a descriptive problem, step-to-reproduce, web browser that you use, and the website url.

---

## 📦 Manual Installation

### Chrome / Edge

1. Download and extract from the [release tab](https://github.com/fanesz/session-switcher/releases).
2. Open `chrome://extensions/` in your browser.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the downloaded folder.

### Firefox

1. Open `about:debugging`.
2. Click **This Firefox** > **Load Temporary Add-on**.
3. Select the `manifest.json` file from the `dist` folder.

---

## 🛠️ Build Instructions

```bash
# Install dependencies (requires Bun)
bun install

# Dev the project
bun run dev:<firefox or chrome>

# Build the project
bun run build:<firefox or chrome>
```

---

## 🙌 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License

MIT License
