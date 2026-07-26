const Task = require('../models/Task');

const buildTaskFields = (body) => {
  const { title, description, dueDate, completed } = body;
  const fields = {};

  if (title !== undefined) {
    fields.title = title;
  }

  if (description !== undefined) {
    fields.description = description;
  }

  if (dueDate !== undefined) {
    fields.dueDate = dueDate;
    fields.reminderSent = false;
  }

  if (completed !== undefined) {
    fields.completed = completed;
  }

  return fields;
};

const isValidDate = (value) => {
  return value && !Number.isNaN(Date.parse(value));
};

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (!isValidDate(dueDate)) {
      return res.status(400).json({ message: 'Valid due date is required' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      user: req.user._id
    });

    return res.status(201).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unable to create task' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unable to load tasks' });
  }
};

const updateTask = async (req, res) => {
  try {
    if (req.body.dueDate !== undefined && !isValidDate(req.body.dueDate)) {
      return res.status(400).json({ message: 'Valid due date is required' });
    }

    const updateFields = buildTaskFields(req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateFields,
      { returnDocument: 'after', runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unable to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Unable to delete task' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};
