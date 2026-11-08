# Multi-Agent

[![License: CC BY-SA 4.0](https://img.shields.io/badge/content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE-CC-BY-SA-4.0.txt)
[![Network-service path: AGPL-3.0](https://img.shields.io/badge/network--service%20path-AGPL--3.0-blue.svg)](LICENSE-AGPL-3.0.txt)

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Agent Teams 的**项目经理 Lead + 自组织工人**插件，包含两个可安装的 bundle：

- **`agensh-skills`** —— 技能包：`agensh-lead`（项目经理协议）与 `agensh-worker`（工人自助循环），中英双语正文
- **`agensh-preset`** —— 预设包：基于 DSH 内置 `ptc` 预设的 **Agensh PM Lead** 预设（常驻 persona，无需触发词）

方法学来自 [Agensh](https://arxiv.org/abs/2609.26781)（Zhan et al., 2026：自助认领、共享任务板、无中央调度）与 [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) 的角色分工（主会话只对接用户与路由，执行者干活）。

## 用处（What it does）

选 **Agensh PM Lead** 预设新建会话后，你面对的是一位项目经理：

| 能力 | 说明 |
|---|---|
| **先问后排** | 动手前先用短问题面谈需求，一次性展示完整计划，确认后不再逐任务重复询问 |
| **Goal + Plan** | 跨回合目标用 `create_goal` 固化，自身计划用 `todo_write` 跟踪 |
| **对等协作** | 相互独立的并行子任务：互不重叠的写范围、无 owner、工人从共享任务板自助认领（CAS 竞态安全） |
| **流水线协作** | 分阶段交接：调研→方案→实现→验证→评审，用 `blocked_by` 串链，阶段产物落盘 `docs/pipeline/<目标>/` |
| **验证全部委托** | 每个交付物配验证任务与判定报告；Lead 不碰代码、不跑命令（提示词级硬规则） |
| **组长模式** | Worker-PM：工人可把认领的行当小项目带，用一次性组员（Sub-Sub-Agent）并行小项，只加一层、整行问责 |
| **跨 Agent 判定** | `subagent_claude_code`（Claude Code agent）与 `subagent_codex`（Codex agent）作为异 Agent 复审者——harness 与模型两条轴都独立 |
| **同伴直通** | 发现按影响面选信道：单同伴 1:1 直发 / 多同伴写 `TEAM-NOTES.md` / Lead 只收四类决策事项，绝不当传声筒 |
| **沙箱纪律** | 沙箱拒绝只分三类：预期拒绝→重构；沙箱缺陷→只给修复本身的权限；绝不提权推任务 |
| **创造模式** | 用户要求装插件/写 bundle 时：工人编写、Lead 单次 `install_bundle` 激活，逐次审批 |
| **不猜测规则** | 一切论断必须给出可指认证据（file:line / 命令输出 / 判定报告 / 用户原话） |
| **单车道也走团队** | 缩减仪式不缩减结构：单行板或单段流水线 + 一个工人 |

## 路径（Repository layout & install）

```
Multi-Agent/
├── agensh-skills/                  # 技能 bundle（安装后全局可用）
│   ├── assets/agensh-lead.md       #   项目经理 Lead 协议（§0 纪律 … §8 创造模式）
│   ├── assets/agensh-worker.md     #   工人自助循环 + 流水线交接 + 验收 + 组长 + 跨Agent + 沙箱
│   ├── index.js                    #   技能提供者（注册两个技能）
│   ├── cordis.patch.yml / package.json / locale/ / icon.svg
├── agensh-preset/                  # 预设 bundle
│   ├── cordis.patch.yml            #   preset-agensh 声明：ptc 插件列表 + PM persona + 插件工具
│   └── package.json
├── LICENSE-CC-BY-SA-4.0.txt
└── LICENSE-AGPL-3.0.txt
```

**安装**（前置：DSH 已启用 Agent Teams 实验层，即安装过 `dsh-experimental-agent-team-profile`）：

1. 克隆本仓库，然后在 DSH 会话里让 agent 执行（或用 Web 插件页安装本地目录）：
   - `plugin_manager install_bundle <本仓库路径>/agensh-skills`
   - `plugin_manager install_bundle <本仓库路径>/agensh-preset`
2. 新建会话，预设选 **Agensh PM Lead**（或在 设置 → General 设为默认预设）。
3. 用自然语言说目标即可——无需任何触发词。

升级已装 bundle：`remove_bundle` + `install_bundle` 成对执行（直接覆盖安装会报 `already-installed`）。

## 适用情况（When to use）

**适合**：
- 已在 DeepSeek Harness 上工作，且启用了 Agent Teams 实验层
- 目标可拆成多个能并行的子任务（对等），或后段依赖前段产出、需要阶段质量闸口（流水线）
- 想把 Lead 的上下文留给决策与对接用户，执行与验证全部下沉给工人
- 需要团队自我扩展 harness 能力（创造模式：编写并安装新 bundle）
- 想用异 Agent（Claude Code / Codex）做独立复审，打破"同一 Agent 既写又审"的盲区

**不适合**：
- 没有 DeepSeek Harness 或未启用 Agent Teams 层
- 需要**物理强制** Lead 零操作的场景——当前"全部委托"是提示词级硬规则，工具仍在（可自行在预设中移除 Shell/写文件/搜索工具行实现硬约束）
- 期望开箱即用的云端服务——本仓库是两个本地 bundle，不含任何服务端组件

## 来源与致谢

- Agensh：Zhan et al., 2026, [arXiv:2609.26781](https://arxiv.org/abs/2609.26781)
- [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)（角色分工、注意力纪律、先问后排、委托执行与验证）
- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（Agent Teams 基础设施）

## License

- **内容路径（默认）**：技能文本、persona、文档等适用 **[CC BY-SA 4.0](LICENSE-CC-BY-SA-4.0.txt)**——署名并以相同协议共享衍生内容。
- **网络服务提供路径**：若你以网络服务（如 SaaS / 托管服务）形式向他人提供本项目或其衍生版的功能，该路径适用 **[GNU AGPL-3.0](LICENSE-AGPL-3.0.txt)**——你需向网络用户开放对应源码（AGPL §13）。

两份许可证全文见仓库根目录；本段为便利性说明，不构成法律意见。

## English summary

A DeepSeek Harness Agent Teams plugin in two installable bundles: `agensh-skills` (bilingual `agensh-lead` / `agensh-worker` skills) and `agensh-preset` (an **Agensh PM Lead** preset based on the shipped `ptc` preset with an always-on project-manager persona — no trigger words). The Lead interviews the user first, sets Goal and Plan, then delegates everything: peer or pipeline collaboration picked from your intent, foreman-mode sub-sub-agents, cross-agent verdicts (Claude Code / Codex as independent reviewers), delegated verification via verdict reports, peer-to-peer findings, sandbox discipline (permissions only for repairing the sandbox itself), and a creation mode where workers author bundles and the Lead activates them one approved install at a time. Requires DSH with the experimental Agent Teams layer. Content under CC BY-SA 4.0; network-service provision paths under AGPL-3.0.

---

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
