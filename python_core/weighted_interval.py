import json
import sys
from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass
class Task:
    id: int
    start: int
    end: int
    profit: int


def validate_tasks(raw_tasks: List[Dict]) -> List[Task]:
    tasks: List[Task] = []
    for i, raw in enumerate(raw_tasks):
        try:
            start = int(raw["start"])
            end = int(raw["end"])
            profit = int(raw["profit"])
        except (KeyError, TypeError, ValueError):
            raise ValueError(f"Task at index {i} must include numeric start, end, and profit.")

        if start < 0 or end < 0:
            raise ValueError(f"Task at index {i} cannot have negative start or end time.")
        if end <= start:
            raise ValueError(f"Task at index {i} must satisfy end > start.")
        if profit < 0:
            raise ValueError(f"Task at index {i} cannot have negative profit.")

        task_id = int(raw.get("id", i + 1))
        tasks.append(Task(id=task_id, start=start, end=end, profit=profit))
    return tasks


def brute_force_weighted(tasks: List[Task]) -> Dict:
    n = len(tasks)
    best_profit = 0
    best_indices: List[int] = []

    sorted_idx = sorted(range(n), key=lambda i: tasks[i].end)

    def is_non_overlapping(selected_indices: List[int], new_index: int) -> bool:
        for idx in selected_indices:
            if not (tasks[idx].end <= tasks[new_index].start or tasks[new_index].end <= tasks[idx].start):
                return False
        return True

    def dfs(pos: int, selected_indices: List[int], current_profit: int) -> None:
        nonlocal best_profit, best_indices
        if pos == n:
            if current_profit > best_profit:
                best_profit = current_profit
                best_indices = selected_indices[:]
            return

        idx = sorted_idx[pos]

        # Exclude current task.
        dfs(pos + 1, selected_indices, current_profit)

        # Include current task if no overlap.
        if is_non_overlapping(selected_indices, idx):
            selected_indices.append(idx)
            dfs(pos + 1, selected_indices, current_profit + tasks[idx].profit)
            selected_indices.pop()

    dfs(0, [], 0)
    best_tasks = [tasks[i].__dict__ for i in sorted(best_indices, key=lambda i: tasks[i].end)]
    return {"max_profit": best_profit, "selected_tasks": best_tasks}


def compute_previous_indices(sorted_tasks: List[Task]) -> List[int]:
    prev = [-1] * len(sorted_tasks)
    end_times = [task.end for task in sorted_tasks]
    for i in range(len(sorted_tasks)):
        left, right = 0, i - 1
        best = -1
        while left <= right:
            mid = (left + right) // 2
            if end_times[mid] <= sorted_tasks[i].start:
                best = mid
                left = mid + 1
            else:
                right = mid - 1
        prev[i] = best
    return prev


def weighted_interval_dp(tasks: List[Task]) -> Dict:
    sorted_tasks = sorted(tasks, key=lambda t: t.end)
    n = len(sorted_tasks)

    prev = compute_previous_indices(sorted_tasks)
    dp = [0] * (n + 1)
    decisions = [""] * (n + 1)  # "include" or "exclude"

    dp_states: List[Dict] = []

    for i in range(1, n + 1):
        task = sorted_tasks[i - 1]
        include_profit = task.profit + dp[prev[i - 1] + 1]
        exclude_profit = dp[i - 1]

        if include_profit > exclude_profit:
            dp[i] = include_profit
            decisions[i] = "include"
        else:
            dp[i] = exclude_profit
            decisions[i] = "exclude"

        dp_states.append(
            {
                "step": i,
                "task": task.__dict__,
                "prev_index": prev[i - 1],
                "include_profit": include_profit,
                "exclude_profit": exclude_profit,
                "decision": decisions[i],
                "dp_snapshot": dp[: i + 1],
            }
        )

    selected: List[Task] = []
    i = n
    while i > 0:
        task = sorted_tasks[i - 1]
        include_profit = task.profit + dp[prev[i - 1] + 1]
        exclude_profit = dp[i - 1]
        if include_profit > exclude_profit:
            selected.append(task)
            i = prev[i - 1] + 1
        else:
            i -= 1

    selected.reverse()

    return {
        "max_profit": dp[n],
        "selected_tasks": [task.__dict__ for task in selected],
        "sorted_tasks": [task.__dict__ for task in sorted_tasks],
        "previous_compatible_index": prev,
        "dp_table": dp,
        "dp_states": dp_states,
        "complexity": {
            "brute_force": {"time": "O(2^n)", "space": "O(n)"},
            "dp": {"time": "O(n log n)", "space": "O(n)"},
        },
    }


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        tasks = validate_tasks(payload.get("tasks", []))

        if not tasks:
            print(json.dumps({"error": "Input must include at least one task."}))
            return

        brute = brute_force_weighted(tasks)
        dp_result = weighted_interval_dp(tasks)
        result = {
            "input_tasks": [task.__dict__ for task in tasks],
            "brute_force": brute,
            "dp_solution": dp_result,
        }
        print(json.dumps(result))
    except ValueError as exc:
        print(json.dumps({"error": str(exc)}))
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input."}))
    except Exception as exc:  # Defensive fallback for API consumers.
        print(json.dumps({"error": f"Unexpected error: {str(exc)}"}))


if __name__ == "__main__":
    main()
