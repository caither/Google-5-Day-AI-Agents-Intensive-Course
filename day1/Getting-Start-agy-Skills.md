---
title: "開始使用 Google Antigravity"
source: "https://codelabs.developers.google.com/getting-started-google-antigravity?authuser=0#8"
author:
published:
created: 2026-07-11
description: "本 Codelab 將引導您安裝並體驗 Google Antigravity 的功能。Google Antigravity 是一個與可執行程式設計和非程式設計任務的 Agents 協作的平台。"
tags:
  - "clippings"
---

## 技能 (Skills)

雖然 Antigravity 的底層模型是強大的通用模型，但它們並不了解您的特定專案上下文或團隊規範。將每一條規則或工具都載入到 Agent 的上下文視窗中會導致工具膨脹（tool bloat）、更高的成本、延遲以及混亂。

技能（Skills）透過漸進式揭露（progressive disclosure）解決了這個問題。**技能**是一個專門的知識包，在需要之前保持休眠狀態。只有當您的特定請求與該技能的描述相匹配時，它才會被載入到 Agent 的上下文中。

## 結構與範圍 (Structure and Scope)

技能是基於目錄的套件。您可以根據需要，在兩種範圍中定義它們：

- 全域範圍（`~/.gemini/config/skills/`）：適用於所有 Antigravity 產品（Antigravity、Antigravity IDE、Antigravity CLI）和專案。
- 專案/工作區範圍（`<project-root>/.agents/skills/`）：這會使該技能僅在特定專案中可用。

## 技能的結構剖析 (The Anatomy of a Skill)

一個典型的技能目錄如下所示：

```
my-skill/
├── SKILL.md    #（必填）中繼資料與指令。
├── scripts/    #（選填）用於執行的 Python 或 Bash 腳本。
├── references/ #（選填）文字、文件或範本。
└── assets/     #（選填）圖片或標誌。
```

現在讓我們來新增一些技能。

## 程式碼審查技能 (Code Review Skill)

這是一個僅包含指令的技能，也就是說我們只需要建立 `SKILL.md` 檔案，其中將包含中繼資料和技能指令。讓我們建立一個技能，為 Agent 提供審查程式碼變更中的錯誤（bugs）、風格問題和最佳實踐的詳細資訊。

假設您在一個特定的專案資料夾中（例如 `my-skills-project`），第一步是在專案資料夾中建立一個將包含該技能的目錄。

```
mkdir -p .agents/skills/code-review
```

在我們剛建立的專案資料夾（例如 `.agents/skills/code-review`）中建立一個 `SKILL.md` 檔案，內容如下所示：

```markdown
---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
---

# Code Review Skill

When reviewing code, follow these steps:

## Review checklist

1. **Correctness**: Does the code do what it's supposed to?
2. **Edge cases**: Are error conditions handled?
3. **Style**: Does it follow project conventions?
4. **Performance**: Are there obvious inefficiencies?

## How to provide feedback

- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible
```

請注意，上述 `SKILL.md` 檔案在頂部包含中繼資料（名稱與描述），接著是指令。當 Agent 啟動時，它只會讀取技能的中繼資料，並僅在需要時才載入完整的技能指令。

讓我們來驗證 **Code Review 技能**。在您選擇的特定專案中開啟 Antigravity 對話，並輸入以下提示詞。

```
which skills are installed?
```

它應該會顯示 **code-review** 技能。

### 動手試試看

在 `$HOME/agy2-projects/my-skills-project` 中建立一個名為 `demo_bad_code.py` 的新檔案，內容如下所示：

```python
import time

def get_user_data(users, id):
   # 根據 ID 尋找使用者
   for u in users:
       if u['id'] == id:
            return u
   return None

def process_payments(items):
   total = 0
   for i in items:
       # 計算稅額
       tax = i['price'] * 0.1
       total = total + i['price'] + tax
       time.sleep(0.1) # 模擬緩慢的網路呼叫

   return total

def run_batch():
   users = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]
   items = [{'price': 10}, {'price': 20}, {'price': 100}]

   u = get_user_data(users, 3)
   print("User found: " + u['name']) # 如果為 None 將會崩潰

   print("Total: " + str(process_payments(items)))

if __name__ == "__main__":
   run_batch()
```

在 Antigravity 的特定專案中開啟一個新對話，並輸入以下提示詞：`review the @demo_bad_code.py file`。

Agent 應該會識別出 `code-review` 技能，載入詳細資訊，然後根據 `code-review/SKILL.md` 檔案中給出的指令執行操作。

範例輸出如下所示：

![a6e2b1b775feda28.png](https://codelabs.developers.google.com/static/getting-started-google-antigravity/img/a6e2b1b775feda28_2880.png?authuser=0)

## 10. 結論

恭喜！您現在已成功安裝 Antigravity、配置了您的環境，並學會了如何控制您的 Agents。

## 獲得您的 Kaggle 5-Day AI Agents 徽章

完成本實驗是作為 Kaggle **5-Day AI Agents: Intensive Vibe Coding Course with Google** 的一部分嗎？領取您的完成徽章：[取得 5-Day AI Agents 徽章](https://developers.google.com/profile/badges/events/cloud/five-day-ai-agents/award?authuser=0)。

**下一步？** 若要觀看 Antigravity 實際建構真實世界應用程式，您可以參考以下 Codelab：

- [使用 Antigravity 建構並部署至 Google Cloud](https://codelabs.developers.google.com/build-and-deploy-gcp-with-antigravity?authuser=0)：本 Codelab 顯示如何設計、建構並部署無伺服器應用程式至 Google Cloud。

## 參考文件

- 官方網站：[https://antigravity.google/](https://antigravity.google/?authuser=0)
- 說明文件：[https://antigravity.google/docs/home](https://antigravity.google/docs/home?authuser=0)
- 使用案例：[https://antigravity.google/use-cases](https://antigravity.google/use-cases?authuser=0)
- 下載：[https://antigravity.google/download](https://antigravity.google/download?authuser=0)
- Google Antigravity YouTube 頻道：[https://www.youtube.com/@googleantigravity](https://www.youtube.com/@googleantigravity?authuser=0)