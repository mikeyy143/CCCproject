#include <iostream>
#include <fstream>
#include <algorithm>
using namespace std;

#define MAX 100
#define FILE_NAME "tasks.txt"

struct Task {
    int id;
    int start;
    int end;
    int profit;
};

Task tasks[MAX];
int n = 0;

int dp[MAX];
int parent[MAX];

int lastNonConflict(int i) {
    for (int j = i - 1; j >= 0; j--) {
        if (tasks[j].end <= tasks[i].start)
            return j;
    }
    return -1;
}

bool compare(Task a, Task b) {
    return a.end < b.end;
}

void saveTasks() {
    ofstream file(FILE_NAME);
    for (int i = 0; i < n; i++) {
        file << tasks[i].id << " "
             << tasks[i].start << " "
             << tasks[i].end << " "
             << tasks[i].profit << endl;
    }
    file.close();
}

void loadTasks() {
    ifstream file(FILE_NAME);
    n = 0;
    while (file >> tasks[n].id >> tasks[n].start >> tasks[n].end >> tasks[n].profit) {
        n++;
    }
    file.close();
}

void addTask() {
    if (n >= MAX) {
        cout << "Task limit reached.\n";
        return;
    }

    Task t;
    t.id = n + 1;

    cout << "Enter start time: ";
    cin >> t.start;

    cout << "Enter end time: ";
    cin >> t.end;

    cout << "Enter profit: ";
    cin >> t.profit;

    tasks[n++] = t;
    saveTasks();

    cout << "Task added.\n";
}

void showTasks() {
    if (n == 0) {
        cout << "No tasks.\n";
        return;
    }

    cout << "\nTasks:\n";
    for (int i = 0; i < n; i++) {
        cout << tasks[i].id << ") Start: " << tasks[i].start
             << " End: " << tasks[i].end
             << " Profit: " << tasks[i].profit << endl;
    }
}

void computeSchedule() {
    if (n == 0) {
        cout << "No tasks available.\n";
        return;
    }

    sort(tasks, tasks + n, compare);

    dp[0] = tasks[0].profit;
    parent[0] = -1;

    for (int i = 1; i < n; i++) {
        int incl = tasks[i].profit;
        int l = lastNonConflict(i);
        if (l != -1)
            incl += dp[l];

        if (incl > dp[i - 1]) {
            dp[i] = incl;
            parent[i] = l;
        } else {
            dp[i] = dp[i - 1];
            parent[i] = -2; 
        }
    }

    cout << "Optimal profit: " << dp[n - 1] << endl;
}

void showSelectedTasks() {
    if (n == 0) {
        cout << "No tasks.\n";
        return;
    }

    cout << "\nSelected Tasks:\n";

    int i = n - 1;
    while (i >= 0) {
        if (parent[i] == -2) {
            i--;
        } else {
            cout << "Task " << tasks[i].id
                 << " (Start: " << tasks[i].start
                 << ", End: " << tasks[i].end
                 << ", Profit: " << tasks[i].profit << ")\n";
            i = parent[i];
        }
    }
}

void clearTasks() {
    n = 0;
    ofstream file(FILE_NAME);
    file.close();
    cout << "All tasks cleared.\n";
}

void showMenu() {
    cout << "\n--- Task Scheduler ---\n";
    cout << "1) Add Task\n";
    cout << "2) Show Tasks\n";
    cout << "3) Compute Optimal Schedule\n";
    cout << "4) Show Selected Tasks\n";
    cout << "5) Clear Tasks\n";
    cout << "0) Exit\n";
    cout << "Choose: ";
}

int main() {
    loadTasks();

    int choice;

    while (true) {
        showMenu();
        cin >> choice;

        if (choice == 0) break;

        switch (choice) {
            case 1: addTask(); break;
            case 2: showTasks(); break;
            case 3: computeSchedule(); break;
            case 4: showSelectedTasks(); break;
            case 5: clearTasks(); break;
            default: cout << "Invalid choice.\n";
        }
    }

    cout << "Exiting...\n";
    return 0;
}