<style>
  .lang-tabs { display: flex; gap: 0; margin-bottom: 0; }
  .lang-tabs input { display: none; }
  .lang-tabs label {
    padding: 6px 18px; cursor: pointer; border: 1px solid #30363d;
    background: #0d1117; color: #8b949e; font-size: 14px; border-radius: 6px 6px 0 0;
    margin-right: -1px;
  }
  .lang-tabs input:checked + label { background: #1a1a2e; color: #e94560; border-bottom-color: #1a1a2e; font-weight: 600; }
  .lang-panel { display: none; border: 1px solid #30363d; border-radius: 0 6px 6px 6px; padding: 20px 24px; background: #0d1117; }
  #tab-en:checked ~ #panel-en,
  #tab-zh:checked ~ #panel-zh { display: block; }
  .lang-tabs label:hover { color: #e94560; }
</style>

<input type="radio" name="lang" class="lang-tabs" id="tab-en" checked>
<input type="radio" name="lang" class="lang-tabs" id="tab-zh">

<div class="lang-tabs">
  <label for="tab-en">English</label>
  <label for="tab-zh">中文</label>
</div>

<div class="lang-panel" id="panel-en">

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

---

<p style="color:#8b949e;font-size:13px">v1.0.0 · MIT License · <a href="https://github.com/Relilah-Wareen/LeetFill">GitHub</a></p>

</div>

<div class="lang-panel" id="panel-zh">

## LeetFill

为 LeetCode 代码编辑器提供 **上下文感知的自动补全**，支持 **C++、Java、Python** 三种语言。

### 功能一览

| 功能 | C++ | Java | Python |
|---|---|---|---|
| 容器方法补全（`.push_back`、`.add`、`.append` 等） | ✔ | ✔ | ✔ |
| 算法代码片段（`for`、`while`、`dfs`、`bfs`、`binary_search`） | ✔ | ✔ | ✔ |
| 变量类型追踪（输入 `nums.` 自动识别 `vector` 方法） | ✔ | ✔ | ✔ |
| 函数签名提示（括号内显示参数类型） | ✔ | — | ✔ |
| 鼠标悬停查看类型方法 | ✔ | ✔ | ✔ |

同时支持 **leetcode.com**（英文站）和 **leetcode.cn**（中文站）。

### 安装方法

**方法一：一键安装**

1. 安装浏览器扩展 [Tampermonkey（油猴）](https://www.tampermonkey.net/)
2. 点击 [leetfill.user.js](leetfill.user.js) → 油猴弹出安装窗口 → 点击 **安装**

**方法二：复制粘贴**

1. 打开油猴管理面板 → 点击 **"+（新建脚本）"**
2. 将 [leetfill.user.js](leetfill.user.js) 的全部内容复制粘贴到编辑器中
3. 按 **Ctrl+S** 保存

打开任意 LeetCode 题目页面，输入 `.` 或 `->` 即可看到提示。

> 无需任何配置，打开即生效。

---

<p style="color:#8b949e;font-size:13px">v1.0.0 · MIT 协议 · <a href="https://github.com/Relilah-Wareen/LeetFill">GitHub</a></p>

</div>
