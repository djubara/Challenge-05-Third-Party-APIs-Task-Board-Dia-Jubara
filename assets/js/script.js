let taskList = JSON.parse(localStorage.getItem("tasks")) ?? [];



function createTaskCard(task) {
    const taskCard = $('<div>')
        .addClass('card task-card draggable my-3')
        .attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
    const cardBody = $('<div>').addClass('card-body');

    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('data-task-id', task.id);
    cardDeleteBtn.on('click', handleDeleteTask);


    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');


        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }


    cardBody.append(cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    return taskCard;

}


function renderTaskList() {
    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();


    for (let task of taskList) {
        if (task.status === 'to-do') {
            todoList.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneList.append(createTaskCard(task));
        }
    }


    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,

        helper: function (e) {

            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');

            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

function handleAddTask(event) {
    event.preventDefault();

    const name = event.target.name.value.trim();

    const dueDate = event.target.dueDate.value; // yyyy-mm-dd format

    const newTask = {
        name: name,
        id: crypto.randomUUID(),
        dueDate: dueDate,
        status: 'to-do',
    };


    taskList.push(newTask);

    localStorage.setItem('tasks', JSON.stringify(taskList));

    renderTaskList();

    event.target.reset();
    $("#formModal").dialog("close");

}

function handleDeleteTask(event) {
    const taskId = $(this).attr('data-task-id');


    taskList.forEach((task, index) => {
        if (task.id === taskId) {
            taskList.splice(index, 1);
        }
    });

    localStorage.setItem('tasks', JSON.stringify(taskList));

    renderTaskList();

}

function handleDrop(event, ui) {


    const taskId = ui.draggable[0].dataset.taskId;

    const newStatus = event.target.id;

    for (let task of taskList) {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    }
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

$(document).ready(function () {
    renderTaskList();
    $("#new-task-form").on("submit", handleAddTask);

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
    $("#formModal").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 300,
        minHeight: 300,
    });
    $("#new-task-btn").on("click", function () {
        $("#formModal").dialog("open");
    });
});
