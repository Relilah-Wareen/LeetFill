<div align="center">

[中文](./README.md) | English

</div>

## LeetFill

Tampermonkey userscript that adds **context-aware autocompletion** to LeetCode's code editor for **C++, Java, and Python**.

### What it does

| Feature | C++ | Java | Python |
|---|---|---|---|
| Container methods (`.push_back`, `.add`, `.append`...) | ✔ | ✔ | ✔ |
| Algorithm snippets (`for`, `while`, `dfs`, `bfs`, `binary_search`) | ✔ | ✔ | ✔ |
| Variable type tracking (`vector<int> nums; nums.` → vector methods) | ✔ | ✔ | ✔ |
| Function signature hints (parameter types inside parentheses) | ✔ | — | ✔ |
| Hover to see type methods | ✔ | ✔ | ✔ |

Supports both **leetcode.com** and **leetcode.cn**.

### Install

**Method 1 — Click to install**

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click [leetfill.user.js](leetfill.user.js) → Tampermonkey will pop up an install dialog → click **Install**

**Method 2 — Copy & paste**

1. Open Tampermonkey dashboard → click **"+ (Create script)"**
2. Copy all content from [leetfill.user.js](leetfill.user.js) and paste into the editor
3. Press **Ctrl+S** to save

Open any LeetCode problem page, type `.` or `->` to see suggestions.

> No configuration needed.

⭐ **If you find LeetFill helpful, a star would mean a lot!**

---

<p align="center">v1.0.0 · MIT License · <a href="https://github.com/Relilah-Wareen/LeetFill">GitHub</a></p>
