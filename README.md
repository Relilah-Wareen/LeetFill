<div align="center">

中文 | [English](./README_en.md)

</div>

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

⭐ **如果觉得好用，加个 star 吧，这对我真的很重要！**

---

<p align="center">v1.0.0 · MIT 协议 · <a href="https://github.com/Relilah-Wareen/LeetFill">GitHub</a></p>
