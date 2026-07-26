const nodemailer = require('nodemailer');
const Task = require('../models/Task');

const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const createMailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const portValue = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('Email reminders are disabled. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to enable them.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: portValue,
    secure: portValue === 465,
    auth: {
      user,
      pass
    }
  });
};

const mailTransporter = createMailTransporter();

const sendReminderEmail = async (task) => {
  if (!mailTransporter || !task.user) {
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const dueText = task.dueDate.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
  const safeTitle = escapeHtml(task.title);
  const safeDescription = escapeHtml(task.description || 'No description provided.');

  await mailTransporter.sendMail({
    from,
    to: task.user.email,
    subject: `Task reminder: ${task.title}`,
    text: `Reminder for your task: ${task.title}\n\n${task.description}\n\nDue: ${dueText}`,
    html: `
      <h2>Task reminder</h2>
      <p><strong>${safeTitle}</strong></p>
      <p>${safeDescription}</p>
      <p><strong>Due:</strong> ${dueText}</p>
    `
  });
};

const checkDueReminders = async () => {
  if (!mailTransporter) {
    return;
  }

  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await Task.find({
    completed: false,
    reminderSent: false,
    dueDate: {
      $gt: now,
      $lte: twentyFourHoursFromNow
    }
  })
    .populate('user', 'name email')
    .limit(25);

  for (const task of tasks) {
    try {
      if (!task.user?.email) {
        console.log(`Skipping reminder for task ${task._id}: owner email not found`);
        continue;
      }

      await sendReminderEmail(task);
      task.reminderSent = true;
      await task.save();
      console.log(`Reminder sent to ${task.user.email} for "${task.title}"`);
    } catch (error) {
      console.log(`Unable to send reminder for task ${task._id}:`, error.message);
    }
  }
};

const startReminderScheduler = () => {
  const reminderCheckIntervalMs = Number(process.env.REMINDER_CHECK_INTERVAL_MS) || 60000;

  setInterval(checkDueReminders, reminderCheckIntervalMs);
  checkDueReminders();
};

module.exports = startReminderScheduler;
