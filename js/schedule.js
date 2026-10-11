const SEMESTER_START = new Date(2026, 8, 14);
const SEMESTER_END = new Date(2026, 11, 14);

const filterButtons = document.querySelectorAll(".schedule-filter");
const scheduleClasses = document.querySelectorAll(".schedule-class");
const scheduleEmpty = document.getElementById("schedule-empty");

const scheduleStatus = document.getElementById("schedule-status");

const semesterProgress = document.getElementById("semester-progress");
const semesterStatus = document.getElementById("semester-status");


function filterSchedule(event) {
    const clickedButton = event.currentTarget;
    const selectedFilter = clickedButton.dataset.filter;

    for (const button of filterButtons) {
        button.classList.remove("active");
    }

    clickedButton.classList.add("active");

    let visibleCount = 0;

    for (const cell of scheduleClasses) {
        const shouldShow =
            selectedFilter === "all" ||
            cell.classList.contains(selectedFilter);

        cell.classList.toggle("filtered-out", !shouldShow);

        if (shouldShow) {
            visibleCount++;
        }
    }

    scheduleEmpty.hidden = visibleCount > 0;
}


function timeToMinutes(time) {
    const parts = time.split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    return hours * 60 + minutes;
}


function updateScheduleStatus() {
    if (!scheduleStatus) {
        return;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let currentClass = null;

    for (const cell of scheduleClasses) {
        const row = cell.closest("tr");
        const day = Number(row.dataset.day);
        const start = timeToMinutes(cell.dataset.start);
        const end = timeToMinutes(cell.dataset.end);

        if (
            day === currentDay &&
            currentTime >= start &&
            currentTime < end
        ) {
            currentClass = cell;
        }
    }

    if (currentClass) {
        currentClass.classList.add("current-class");

        const subject = currentClass.querySelector("strong").textContent;

        scheduleStatus.textContent =
            "Práve prebieha: " + subject + ".";

        return;
    }

    let nextClass = null;
    let shortestWait = Infinity;

    for (const cell of scheduleClasses) {
        const row = cell.closest("tr");
        const day = Number(row.dataset.day);
        const start = timeToMinutes(cell.dataset.start);

        const daysAhead = (day - currentDay + 7) % 7;
        let wait = daysAhead * 24 * 60 + start - currentTime;

        if (wait <= 0) {
            wait += 7 * 24 * 60;
        }

        if (wait < shortestWait) {
            shortestWait = wait;
            nextClass = cell;
        }
    }

    if (nextClass) {
        const subject = nextClass.querySelector("strong").textContent;
        const row = nextClass.closest("tr");
        const dayName = row.querySelector("th").textContent;
        const startTime = nextClass.dataset.start;

        scheduleStatus.textContent =
            "Momentálne nemám výučbu. Najbližšia hodina: " +
            subject + " — " + dayName + " o " + startTime + ".";
    } else {
        scheduleStatus.textContent =
            "V rozvrhu nie je žiadna výučba.";
    }
}


function updateSemesterProgress() {
    if (!semesterProgress || !semesterStatus) {
        return;
    }

    const today = new Date();

    const totalDuration =
        SEMESTER_END.getTime() - SEMESTER_START.getTime();

    const elapsedDuration =
        today.getTime() - SEMESTER_START.getTime();

    const percentage = elapsedDuration / totalDuration * 100;
    const limitedPercentage = Math.max(0, Math.min(100, percentage));
    const roundedPercentage = Math.round(limitedPercentage);

    semesterProgress.value = roundedPercentage;
    semesterProgress.textContent = roundedPercentage + " %";

    semesterStatus.textContent =
        "Uplynulo " + roundedPercentage + " % semestra. " +
        "Semester trvá od 14. 9. 2026 do 14. 12. 2026.";
}


for (const button of filterButtons) {
    button.addEventListener("click", filterSchedule);
}

updateScheduleStatus();
updateSemesterProgress();