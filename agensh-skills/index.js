/**
 * Agensh self-organization skills for DeepSeek Harness Agent Teams.
 *
 * Bundled skill provider (Host half). Registers two skills on `ctx.skills`:
 * - `agensh-lead`   — bootstrap a self-assigning team (decompose, spawn, verify, merge)
 * - `agensh-worker` — the self-service task-allocation loop for teammates
 *
 * Model after arXiv:2609.26781 (Agensh: Scaling Organizational Intelligence
 * to 1,024 Agents): no central dispatcher; workers claim sub-tasks themselves
 * through the shared task board, share findings, verify, and merge progress.
 *
 * @module @local/agensh-skills
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PROVIDER_NAME = "agensh";

/** Matches @deepseek-ai/dsh-skill BUNDLED_SKILL_RANK; duplicated to stay dependency-free. */
const BUNDLED_SKILL_RANK = 600;

const RESOURCE_BASE = {
	kind: "directory",
	path: fileURLToPath(new URL("./assets/", import.meta.url))
};

/**
 * Static candidate catalog. `locator` is the opaque asset URL passed back to get().
 * Descriptions carry the trigger vocabulary (including Chinese) because they are
 * the only matching surface in the agent-facing skill catalog.
 */
const CANDIDATES = [
	{
		name: "agensh-lead",
		file: "agensh-lead.md",
		description:
			"Run a self-organized Agent Team as the project-manager Lead — the Agensh cooperation loop with the dsh-superagent role split: interview the user first (ask_user_question, a few short questions then show the full plan once), set Goal (create_goal) and Plan (todo_write), shape the shared task board for peer collaboration (对等协作: independent parallel lanes, disjoint write scopes, self-claiming) or pipeline collaboration (流水线协作: staged handoffs research→plan→implement→verify chained by blocked_by with artifacts under docs/pipeline/), spawn workers on the agensh-worker loop, delegate ALL coding and verification to verdict-report tasks, supervise without dispatching, and merge verdict reports into one user-facing result while never touching code yourself. Use when leading a multi-agent team, acting as project manager, leading without coding, 自组织多智能体协作, 自助任务分配, 项目经理, 询问用户需求, 先问后排, 设置计划和目标, 对等协作, 流水线协作, or scaling a team without a central orchestrator."
	},
	{
		name: "agensh-worker",
		file: "agensh-worker.md",
		description:
			"Self-service task allocation loop for a DeepSeek Harness Agent Teams worker (Agensh cooperation loop): gather context, self-claim one ready unowned task from the shared task board with compare-and-set (team_task_update claim), act within its write scopes, share findings via send_message and TEAM-NOTES.md, verify, complete, and repeat until no work remains. Works on flat peer boards (对等协作) and pipeline stages (流水线协作) alike: read the upstream artifact, write your stage deliverable before completing (completing unblocks the next stage), and take verification tasks that check a peer's deliverable and write a verdict report — never verifying your own work. Use when you are a spawned teammate looking for work, picking up or claiming tasks yourself, working from the shared task board, coordinating with peers without a dispatcher, 自助任务分配, 认领任务, 自组织协作, 阶段交接, 流水线, 验收任务, or 验证他人交付."
	}
].map((skill) => ({
	name: skill.name,
	description: skill.description,
	invocation: {
		modelInvocable: true,
		userInvocable: true
	},
	provider: PROVIDER_NAME,
	source: "bundled",
	resourceBase: RESOURCE_BASE,
	rank: BUNDLED_SKILL_RANK,
	locator: new URL(`./assets/${skill.file}`, import.meta.url)
}));

const provider = {
	name: PROVIDER_NAME,
	list: () => Promise.resolve(CANDIDATES),
	async get(candidate) {
		return {
			name: candidate.name,
			description: candidate.description,
			invocation: candidate.invocation,
			provider: candidate.provider,
			source: candidate.source,
			resourceBase: RESOURCE_BASE,
			content: await readFile(candidate.locator, "utf8")
		};
	}
};

/** Cordis plugin name. */
const name = "agensh-skills";
/** Service required by the bundled provider. */
const inject = ["skills"];
/** Register the Agensh skill provider on `ctx.skills`. */
function apply(ctx) {
	return ctx.skills.registerProvider(() => provider);
}

export { apply, inject, name };
