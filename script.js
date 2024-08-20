document.addEventListener('DOMContentLoaded', function() {
    loadReminderList(); // Load saved reminders on page load

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
    });

    document.getElementById('homeworkForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const classInput = document.getElementById('classInput');
        const periodInput = document.getElementById('periodInput');
        const timeInput = document.getElementById('timeInput');

        const className = classInput.value.trim();
        const period = periodInput.value.trim();
        const notificationTime = timeInput.value;

        if (className !== '' && !isNaN(period) && period !== '' && notificationTime !== '') {
            addReminderToList(className, period, notificationTime);
            saveReminderToStorage(className, period, notificationTime);
            classInput.value = '';
            periodInput.value = '';
            timeInput.value = '';
            // Remove 'has-value' class after submission
            classInput.classList.remove('has-value');
            periodInput.classList.remove('has-value');
            timeInput.classList.remove('has-value');
        } else {
            alert('Please enter valid inputs. Period should be a number.');
        }
    });
});

function addReminderToList(className, period, notificationTime) {
    const reminderList = document.getElementById('reminderList');
    if (!reminderList) {
        console.error('Reminder list element not found!');
        return;
    }

    const li = document.createElement('li');
    li.textContent = `${className} Period ${period} - ${notificationTime}`;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', function() {
        reminderList.removeChild(li);
        removeReminderFromStorage(className, period, notificationTime);
    });

    li.appendChild(removeButton);
    reminderList.appendChild(li);

    scheduleNotification(className, period, notificationTime);
}

function scheduleNotification(className, period, time) {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);

    if (now > notificationTime) {
        notificationTime.setDate(now.getDate() + 1); // Schedule for the next day if time has passed
    }

    cordova.plugins.notification.local.schedule({
        title: 'Class Reminder',
        text: `${className} Period ${period}`,
        trigger: { at: notificationTime },
        foreground: true
    });
}

function saveReminderToStorage(className, period, notificationTime) {
    let reminderList = JSON.parse(localStorage.getItem('reminderList')) || [];
    reminderList.push({ className, period, notificationTime });
    localStorage.setItem('reminderList', JSON.stringify(reminderList));
}

function loadReminderList() {
    let reminderList = JSON.parse(localStorage.getItem('reminderList')) || [];
    reminderList.forEach(item => {
        addReminderToList(item.className, item.period, item.notificationTime);
    });
}

function removeReminderFromStorage(className, period, notificationTime) {
    let reminderList = JSON.parse(localStorage.getItem('reminderList')) || [];
    reminderList = reminderList.filter(item =>
        item.className !== className ||
        item.period !== period ||
        item.notificationTime !== notificationTime
    );
    localStorage.setItem('reminderList', JSON.stringify(reminderList));
}
