# 📅 Task Scheduler using Dynamic Programming (C++)

## 📌 Project Overview

This project implements a **Task Scheduler** using **Dynamic Programming (DP)** to solve the **Weighted Interval Scheduling Problem**.

The program allows users to input tasks with start time, end time, and profit, and then computes the **optimal set of non-overlapping tasks** that yields the **maximum total profit**.

---

## 🎯 Objectives

* Demonstrate the use of **Dynamic Programming**
* Solve a real-world optimization problem
* Provide a simple **menu-driven interface**
* Store and retrieve data using **file handling**

---

## 🧠 Problem Description

Given a set of tasks:

* Each task has:

  * Start time
  * End time
  * Profit

The goal is to:

> Select a subset of tasks such that no tasks overlap and the total profit is maximized.

---

## ⚙️ Features

* ➕ Add new tasks
* 📋 Display all tasks
* 🧮 Compute optimal schedule using DP
* 📊 Show selected tasks
* 💾 Save tasks to file
* 📂 Load tasks from file
* 🗑️ Clear all tasks

---

## 🏗️ Technologies Used

* Language: **C++**
* Concepts:

  * Dynamic Programming
  * Arrays
  * File Handling
  * Sorting Algorithms

---

## 🧮 Algorithm Used

### Weighted Interval Scheduling (DP)

For each task `i`:

```
DP[i] = max(
    profit[i] + DP[last_non_conflicting_task],
    DP[i-1]
)
```

Steps:

1. Sort tasks based on end time
2. For each task:

   * Include it (add profit + previous compatible task)
   * Exclude it
3. Take maximum of both choices

---

## 📂 File Structure

```
tasks.txt   → Stores task data
main.cpp    → Source code
README.md   → Project documentation
```

---

## 📄 Input Format

Each task includes:

```
Start Time
End Time
Profit
```

Example:

```
1 3 50
2 5 20
4 6 70
```

---

## 📊 Sample Output

```
Tasks:
1) Start: 1 End: 3 Profit: 50
2) Start: 2 End: 5 Profit: 20
3) Start: 4 End: 6 Profit: 70

Optimal profit: 120

Selected Tasks:
Task 3 (Start: 4, End: 6, Profit: 70)
Task 1 (Start: 1, End: 3, Profit: 50)
```

---

## 🚀 How to Run

1. Compile the program:

```
g++ main.cpp -o main
```

2. Run the program:

```
./main
```

3. Use the menu options to interact.

---

## 👨‍💻 Conclusion

This project demonstrates how **Dynamic Programming** can be applied to solve real-world optimization problems efficiently.

---
