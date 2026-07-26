# Automate a weekly chore: Claude vs ChatGPT

**Lab · Automation** · Tested on 26 July 2026

Two AI tools, one real task, the same prompt to both. You read both answers,
score them against a simple checklist, and decide which one you would actually
use. The skill you are practising is judgement: knowing which tool did the
better job on a task you already understand.

## The task

You manage a team of twelve at a housing association. Every Friday afternoon
you open the spreadsheet where the team log their hours, work out who has not
filled theirs in, and email each of them a reminder. It takes half an hour and
you dread it. You have never written a line of code in your life, and nobody at
work is going to help you. You ask two AI tools to set it up so it happens on
its own, and to tell you exactly what to click. One gives you something you
could finish this afternoon. The other gives you something that will still be
working next year. You decide which one you would actually attempt.

## The matchup

- **Claude**: Claude Opus 5, run on 26 July 2026 with no web search. It
  answered from what it already knew.
- **ChatGPT**: OpenAI GPT-5.6 (model id gpt-5.6-sol), run on 26 July 2026 in
  its most careful answer mode. It read Google's Apps Script documentation
  before answering.

## The prompt (the same words to both)

Both tools were given this exact prompt, word for word.

```text
I manage a team of twelve at a housing association. Every Friday afternoon I open a Google Sheet where the team log the hours they have worked that week, I work out who has not filled theirs in, and I email each of those people a reminder. It takes me about half an hour and I dread it.

Can you set this up so it happens on its own every Friday at 4pm? I have never written a line of code in my life, and nobody at work is going to help me. Tell me exactly what to click, exactly what I need to change to make it work with my sheet, and anything that could go wrong. Use British English.
```

## The two answers

Both answers below are quoted exactly as each tool produced them. Nothing has
been tidied, shortened or corrected, so the spelling, punctuation and layout you
see are each tool's own, not ours.

### Claude's answer

```text
Yes, this is very doable, and you do not need to understand the code to make it work. Google Sheets has a built in automation tool called Apps Script. You paste in a block of instructions, change a few lines to match your sheet, and tell Google to run it every Friday at 4pm. It runs on Google's computers, so your laptop can be shut and you can be on a train.

Before we start, one promise: the version below will not email a single colleague until you switch it on deliberately. It emails only you first, so you can see exactly what your team would have received.

WHAT YOUR SHEET NEEDS TO LOOK LIKE

The script needs three things in the tab where people log their hours: a column with each person's name, a column with their work email address, and the column where they type their hours for this week. They can be any columns, in any order, and you can have as many other columns as you like. You just have to tell the script which is which, and that is the only editing you will do.

If you do not currently keep email addresses in the sheet, add a column now and fill it in. Take the addresses from your Outlook or Gmail contacts so there are no typos.

STEP BY STEP

1. Open the Google Sheet the team fill in.
2. In the menu at the top, click Extensions, then Apps Script. A new tab opens with a code editor. Do not worry about how it looks.
3. You will see a small amount of text already there, usually "function myFunction() { }". Select all of it and delete it, so the page is empty.
4. Copy everything in the grey box below and paste it into that empty page.
5. Change only the seven lines in the SETTINGS section at the very top. They are explained underneath.
6. Click the floppy disk Save icon.
7. At the top there is a dropdown that says "Function". Choose "chaseMissingTimesheets", then click Run.
8. Google will ask for permission. This bit looks alarming and is normal. Click Review permissions, choose your work Google account, then click Advanced, then "Go to Untitled project (unsafe)", then Allow. The word unsafe means Google has not reviewed the script, not that anything is wrong. You wrote it, or rather you pasted it, so you know what it does.
9. Check your inbox. You will have one email showing exactly who would have been chased and what they would have been sent. Nobody else has been emailed.
10. When you are happy, come back to the script, change the line that says TEST_MODE: true to TEST_MODE: false, and Save.
11. Now set it to run by itself. In the left hand sidebar of the script editor, click the alarm clock icon (Triggers), then the blue "Add Trigger" button at the bottom right. Set: function to run = chaseMissingTimesheets, event source = Time driven, type of time based trigger = Week timer, day of week = Friday, time of day = 4pm to 5pm. Click Save.

That is it. It will now run every Friday afternoon without you.

THE CODE

  const SETTINGS = {
    TAB_NAME: 'Sheet1',
    FIRST_DATA_ROW: 2,
    NAME_COLUMN: 'A',
    EMAIL_COLUMN: 'B',
    HOURS_COLUMN: 'C',
    TEST_MODE: true,
    YOUR_EMAIL: 'you@yourhousingassociation.org.uk'
  };

  function chaseMissingTimesheets() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS.TAB_NAME);
    if (!sheet) {
      throw new Error('No tab called ' + SETTINGS.TAB_NAME + '. Check the tab name at the bottom of your sheet.');
    }

    const nameCol = letterToNumber(SETTINGS.NAME_COLUMN);
    const emailCol = letterToNumber(SETTINGS.EMAIL_COLUMN);
    const hoursCol = letterToNumber(SETTINGS.HOURS_COLUMN);
    const rows = sheet.getDataRange().getValues();

    const chased = [];

    for (let i = SETTINGS.FIRST_DATA_ROW - 1; i < rows.length; i++) {
      const name = String(rows[i][nameCol - 1]).trim();
      const email = String(rows[i][emailCol - 1]).trim();
      const hours = String(rows[i][hoursCol - 1]).trim();

      if (!name || !email) continue;
      if (hours !== '') continue;

      const subject = 'Your timesheet for this week';
      const body = 'Hello ' + name.split(' ')[0] + ',\n\n'
        + 'Your hours for this week have not been logged yet. When you have five minutes, please fill them in here:\n\n'
        + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '\n\n'
        + 'Thank you,\n'
        + 'This is an automatic reminder.';

      if (SETTINGS.TEST_MODE) {
        chased.push(name + ' (' + email + ')');
      } else {
        MailApp.sendEmail(email, subject, body);
        chased.push(name + ' (' + email + ')');
      }
    }

    if (SETTINGS.TEST_MODE) {
      MailApp.sendEmail(
        SETTINGS.YOUR_EMAIL,
        'TEST: timesheet chaser found ' + chased.length + ' people',
        'No emails were sent to anyone. These are the people who would have been chased:\n\n'
          + (chased.join('\n') || 'Nobody. Everyone has filled theirs in.')
      );
    }
  }

  function letterToNumber(letter) {
    let number = 0;
    const upper = letter.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      number = number * 26 + (upper.charCodeAt(i) - 64);
    }
    return number;
  }

WHAT TO CHANGE, LINE BY LINE

TAB_NAME: the name on the tab at the bottom of your sheet. If the tab is called Hours, put 'Hours'. Keep the quote marks.
FIRST_DATA_ROW: the row number where your first real person appears. If row 1 is your headings and Adam is in row 2, leave it as 2.
NAME_COLUMN, EMAIL_COLUMN, HOURS_COLUMN: the letters at the top of those three columns.
TEST_MODE: leave as true until you have seen a test email you are happy with.
YOUR_EMAIL: your own work email address.

WHAT COULD GO WRONG

It chases people who have genuinely nothing to log. Someone on annual leave has an empty cell and gets a nudge. Ask the team to type 0, or the word Leave, in the hours box rather than leaving it blank. Anything typed in the box counts as filled in.

The hours column is the wrong one. If you point it at a column that is always full, nobody is ever chased, and if you point it at one that is always empty, everyone is chased every week. The test email catches both, which is why step 9 matters.

Your sheet has one column per week. Very common, and this script does not handle it, because "this week" moves along one column every Friday. If that is your layout, either add a single "This week" column that you point the script at, or tell me your layout and I will adjust the script.

The reminder goes out at the wrong time. Apps Script uses the time zone set on the script, not on your computer. In the script editor click the cog icon for Project Settings and check the time zone says London. Google also treats 4pm as "some time between 4pm and 5pm", which is fine for this.

Somebody leaves or joins. The script reads the sheet each time, so a new starter is chased automatically once they are in it, and a leaver stops being chased when you remove their row. Nothing else to update.

Google sending limits. A free Gmail account can send around 100 emails a day and a Google Workspace account around 1,500. You are sending twelve, so this will never trouble you.

The email lands in junk. Send yourself a real one after you turn TEST_MODE off, and if it lands in spam, ask your IT contact to allow it, or ask two colleagues to mark it as not junk.

It stops working silently. If the script errors on a Friday, Google emails you a failure notice. Do not ignore those. The most common cause is somebody renaming the tab or deleting the email column.

ONE THING WORTH DOING

Run it in TEST_MODE for one Friday before you switch it on properly. You will get the list you would normally work out by hand, you can compare the two, and you will know it is right before your team ever sees an automatic email from you.
```

### ChatGPT's answer

````text
Yes. The simplest dependable option is Google Apps Script. It is built into Google Workspace, costs nothing for this volume, and can send from your work account.

This setup:

- checks the sheet every Friday at approximately 4pm;
- emails only people whose hours are blank;
- sends you a summary;
- keeps an audit log;
- avoids sending the same reminder twice;
- lets you preview the result without emailing anybody.

Google only guarantees the trigger within about 15 minutes of the chosen time, so “4pm” means roughly 3.45–4.15pm. [Google documents this timing limitation here.](https://developers.google.com/apps-script/reference/script/clock-trigger-builder)

## 1. Check which sheet layout you have

This script supports either of these layouts.

### Layout A: one column per week

Use this if your sheet resembles:

| Name | 24/07/2026 | 31/07/2026 |
|---|---:|---:|
| Aisha Khan | 37 | |
| Ben Davies | 35 | 35 |

A blank weekly cell means the person has not completed their hours.

### Layout B: one row per weekly submission

Use this if it resembles:

| Name | Date | Hours |
|---|---|---:|
| Aisha Khan | 24/07/2026 | 37 |
| Ben Davies | 24/07/2026 | 35 |

Use this only when each row represents a complete weekly submission. It is not suitable if people add one row per day.

If neither example resembles your sheet, do not install the trigger yet. The checking rule would need adjusting to match your layout.

## 2. Add the team list

Open the Google Sheet.

1. At the bottom left, click the **+** button.
2. Double-click the new tab’s name.
3. Rename it exactly:

   `Team`

4. Enter these four headings in row 1:

| Cell | Enter |
|---|---|
| A1 | Name |
| B1 | Email |
| C1 | Active |
| D1 | Pause until |

5. Put your twelve team members underneath.
6. The names must be written the same way as they are in the hours sheet.
7. Put `TRUE` in the **Active** column for current team members.
8. Leave **Pause until** blank normally.

For somebody on leave, enter the Friday date in **Pause until**. They will not be reminded that week. For a permanent leaver, change **Active** to `FALSE`.

Do not include yourself unless you also submit hours and should receive reminders.

## 3. Copy your spreadsheet ID

Look at the address at the top of your browser. It will resemble:

```text
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
```

Copy only the part between `/d/` and `/edit`:

```text
1AbCdEfGhIjKlMnOpQrStUvWxYz
```

## 4. Create the private automation

Do this from your work Google account.

1. Open [script.google.com](https://script.google.com).
2. Click **New project**.
3. At the top, click **Untitled project**.
4. Rename it:

   `Weekly timesheet reminders`

5. On the left, click **Editor** if it is not already selected.
6. Click inside `Code.gs`.
7. Press **Ctrl+A**, then **Backspace**.
8. Paste all of the following code:

```javascript
const CONFIG = {
  // CHANGE THESE FIVE SETTINGS.
  spreadsheetId: 'PASTE_SPREADSHEET_ID_HERE',
  layout: 'WEEK_COLUMNS', // Use 'WEEK_COLUMNS' or 'ROW_LOG'.
  hoursSheet: 'Hours',    // The exact name of your existing hours tab.
  managerEmail: 'your.name@organisation.org.uk',
  signOffName: 'Your name',

  // Normally leave everything below this line unchanged.
  teamSheet: 'Team',
  auditSheet: 'Reminder audit',
  timeZone: 'Europe/London',

  teamHeaders: {
    name: 'Name',
    email: 'Email',
    active: 'Active',
    pauseUntil: 'Pause until'
  },

  // Settings for WEEK_COLUMNS.
  weeklyHeaderRow: 1,
  weeklyNameHeader: 'Name',

  // Settings for ROW_LOG.
  rowLogHeaders: {
    name: 'Name',
    date: 'Date',
    hours: 'Hours'
  },

  // TRUE means an entered zero counts as having completed the sheet.
  zeroCountsAsComplete: true
};


/**
 * STEP 1: Run this first. It sends no email.
 * Look at the "Reminder audit" tab afterwards.
 */
function previewMissingTimesheets() {
  const result = checkTimesheets_();
  writeAudit_('PREVIEW — NO EMAIL SENT', result, []);

  console.log(
    result.missing.length
      ? 'Would remind: ' +
          result.missing.map(person => person.name).join(', ')
      : 'Nobody would be reminded.'
  );
}


/**
 * STEP 2: Sends one example reminder to the manager only.
 */
function sendTestReminderToMe() {
  validateEmail_(CONFIG.managerEmail, 'managerEmail');

  const spreadsheet = getSpreadsheet_();
  const week = currentWeek_();

  MailApp.sendEmail({
    to: CONFIG.managerEmail,
    subject:
      'TEST — Reminder: please complete your hours for week ending ' +
      britishDate_(week.end),
    body: reminderBody_(
      'Example team member',
      week,
      spreadsheet.getUrl(),
      true
    ),
    name: CONFIG.signOffName
  });
}


/**
 * STEP 3: Run this once to schedule the Friday automation.
 * Running it again replaces the old schedule instead of creating duplicates.
 */
function installFridayTrigger() {
  validateConfiguration_();

  ScriptApp.getProjectTriggers()
    .filter(trigger =>
      trigger.getHandlerFunction() === 'sendTimesheetReminders'
    )
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('sendTimesheetReminders')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(16)
    .nearMinute(0)
    .everyWeeks(1)
    .inTimezone(CONFIG.timeZone)
    .create();
}


/**
 * Runs automatically each Friday.
 */
function sendTimesheetReminders() {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    throw new Error(
      'Another reminder check is already running. No second run was started.'
    );
  }

  try {
    validateConfiguration_();

    const result = checkTimesheets_();
    const properties = PropertiesService.getScriptProperties();

    const peopleToEmail = result.missing.filter(person => {
      return !properties.getProperty(reminderKey_(result.week, person.email));
    });

    // Include one recipient for the manager's summary.
    const recipientsNeeded = peopleToEmail.length + 1;
    const quotaRemaining = MailApp.getRemainingDailyQuota();

    if (quotaRemaining < recipientsNeeded) {
      throw new Error(
        'Not enough email allowance remains today. Needed ' +
          recipientsNeeded +
          ', but only ' +
          quotaRemaining +
          ' recipients remain.'
      );
    }

    const spreadsheet = getSpreadsheet_();
    const sent = [];

    peopleToEmail.forEach(person => {
      MailApp.sendEmail({
        to: person.email,
        subject:
          'Reminder: please complete your hours for week ending ' +
          britishDate_(result.week.end),
        body: reminderBody_(
          person.name,
          result.week,
          spreadsheet.getUrl(),
          false
        ),
        name: CONFIG.signOffName
      });

      properties.setProperty(
        reminderKey_(result.week, person.email),
        new Date().toISOString()
      );

      sent.push(person);
    });

    writeAudit_('LIVE', result, sent);
    sendManagerSummary_(result, sent, spreadsheet.getUrl());
  } finally {
    lock.releaseLock();
  }
}


function checkTimesheets_() {
  validateConfiguration_();

  const spreadsheet = getSpreadsheet_();
  const week = currentWeek_();
  const team = readTeam_(spreadsheet, week);

  const completed =
    CONFIG.layout === 'WEEK_COLUMNS'
      ? readWeeklyColumns_(spreadsheet, week)
      : readRowLog_(spreadsheet, week);

  return {
    week: week,
    missing: team.filter(person => !completed.has(normalise_(person.name)))
  };
}


function readTeam_(spreadsheet, week) {
  const sheet = requiredSheet_(spreadsheet, CONFIG.teamSheet);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    throw new Error('The Team tab does not contain any team members.');
  }

  const headings = values[0];
  const nameColumn = findHeader_(headings, CONFIG.teamHeaders.name);
  const emailColumn = findHeader_(headings, CONFIG.teamHeaders.email);
  const activeColumn = findHeader_(headings, CONFIG.teamHeaders.active);
  const pauseColumn = findHeader_(headings, CONFIG.teamHeaders.pauseUntil);

  const people = [];
  const namesSeen = new Set();

  for (let row = 1; row < values.length; row++) {
    const name = String(values[row][nameColumn] || '').trim();
    const email = String(values[row][emailColumn] || '').trim();

    if (!name && !email) {
      continue;
    }

    if (!name || !email) {
      throw new Error(
        'Team row ' + (row + 1) + ' needs both a name and an email address.'
      );
    }

    if (!isActive_(values[row][activeColumn])) {
      continue;
    }

    const pauseUntil = dateKey_(values[row][pauseColumn]);

    // A pause date during or after this week suppresses the reminder.
    if (pauseUntil && pauseUntil >= week.start) {
      continue;
    }

    validateEmail_(email, 'email in Team row ' + (row + 1));

    const normalisedName = normalise_(name);

    if (namesSeen.has(normalisedName)) {
      throw new Error(
        'The name "' + name + '" appears more than once on the Team tab.'
      );
    }

    namesSeen.add(normalisedName);
    people.push({ name: name, email: email });
  }

  return people;
}


function readWeeklyColumns_(spreadsheet, week) {
  const sheet = requiredSheet_(spreadsheet, CONFIG.hoursSheet);
  const values = sheet.getDataRange().getValues();
  const headerIndex = CONFIG.weeklyHeaderRow - 1;

  if (headerIndex < 0 || headerIndex >= values.length) {
    throw new Error('weeklyHeaderRow does not point to a valid row.');
  }

  const headings = values[headerIndex];
  const nameColumn = findHeader_(headings, CONFIG.weeklyNameHeader);

  const currentWeekColumns = [];

  headings.forEach((heading, column) => {
    const date = dateKey_(heading);

    if (date && date >= week.start && date <= week.end) {
      currentWeekColumns.push(column);
    }
  });

  if (!currentWeekColumns.length) {
    throw new Error(
      'No date heading for the current week was found on "' +
        CONFIG.hoursSheet +
        '". The date must be in row ' +
        CONFIG.weeklyHeaderRow +
        '.'
    );
  }

  const completed = new Set();

  for (let row = headerIndex + 1; row < values.length; row++) {
    const name = String(values[row][nameColumn] || '').trim();

    if (!name) {
      continue;
    }

    if (
      currentWeekColumns.some(column =>
        hasEntry_(values[row][column])
      )
    ) {
      completed.add(normalise_(name));
    }
  }

  return completed;
}


function readRowLog_(spreadsheet, week) {
  const sheet = requiredSheet_(spreadsheet, CONFIG.hoursSheet);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return new Set();
  }

  const headings = values[0];
  const nameColumn = findHeader_(headings, CONFIG.rowLogHeaders.name);
  const dateColumn = findHeader_(headings, CONFIG.rowLogHeaders.date);
  const hoursColumn = findHeader_(headings, CONFIG.rowLogHeaders.hours);

  const completed = new Set();

  for (let row = 1; row < values.length; row++) {
    const name = String(values[row][nameColumn] || '').trim();
    const date = dateKey_(values[row][dateColumn]);

    if (
      name &&
      date &&
      date >= week.start &&
      date <= week.end &&
      hasEntry_(values[row][hoursColumn])
    ) {
      completed.add(normalise_(name));
    }
  }

  return completed;
}


function reminderBody_(name, week, spreadsheetUrl, isTest) {
  const testNotice = isTest
    ? 'THIS IS A TEST. No team member has been emailed.\n\n'
    : '';

  return (
    testNotice +
    'Hello ' +
    name +
    ',\n\n' +
    'This is an automatic reminder that I cannot yet see your hours for ' +
    'the week ending Friday ' +
    britishDate_(week.end) +
    '.\n\n' +
    'Please complete them here:\n' +
    spreadsheetUrl +
    '\n\n' +
    'If you have already completed them, or you were not expected to submit ' +
    'hours this week, please reply to this email.\n\n' +
    'Thank you,\n' +
    CONFIG.signOffName
  );
}


function sendManagerSummary_(result, sent, spreadsheetUrl) {
  const lines = sent.length
    ? sent.map(person => '• ' + person.name + ' <' + person.email + '>')
    : ['No new reminders were sent.'];

  const alreadySentCount = result.missing.length - sent.length;

  MailApp.sendEmail({
    to: CONFIG.managerEmail,
    subject:
      'Timesheet reminder summary — ' + britishDate_(result.week.end),
    body:
      'The Friday timesheet check has completed.\n\n' +
      'New reminders sent:\n' +
      lines.join('\n') +
      '\n\n' +
      'Missing entries found: ' +
      result.missing.length +
      '\n' +
      'Previously reminded this week: ' +
      alreadySentCount +
      '\n\n' +
      'Sheet:\n' +
      spreadsheetUrl,
    name: CONFIG.signOffName
  });
}


function writeAudit_(mode, result, sent) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(CONFIG.auditSheet);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.auditSheet);
    sheet.appendRow([
      'Run at',
      'Mode',
      'Week starting',
      'Week ending',
      'Missing found',
      'Reminders sent',
      'People found missing'
    ]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    mode,
    result.week.start,
    result.week.end,
    result.missing.length,
    sent.length,
    result.missing
      .map(person => person.name + ' <' + person.email + '>')
      .join(', ')
  ]);
}


function currentWeek_() {
  const todayKey = Utilities.formatDate(
    new Date(),
    CONFIG.timeZone,
    'yyyy-MM-dd'
  );

  const today = new Date(todayKey + 'T12:00:00Z');
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;

  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - daysSinceMonday);

  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);

  return {
    start: isoDate_(monday),
    end: isoDate_(friday)
  };
}


function dateKey_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, CONFIG.timeZone, 'yyyy-MM-dd');
  }

  const text = String(value || '').trim();

  let match = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (match) {
    return match[1] + '-' + pad_(match[2]) + '-' + pad_(match[3]);
  }

  match = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (match) {
    return match[3] + '-' + pad_(match[2]) + '-' + pad_(match[1]);
  }

  return '';
}


function hasEntry_(value) {
  if (value === '' || value === null) {
    return false;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }

  if (!CONFIG.zeroCountsAsComplete && Number(value) === 0) {
    return false;
  }

  return true;
}


function isActive_(value) {
  return !['false', 'no', 'n', '0', 'inactive'].includes(
    normalise_(value)
  );
}


function requiredSheet_(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    throw new Error(
      'Could not find a sheet tab named "' +
        name +
        '". Check spelling, spaces and capital letters.'
    );
  }

  return sheet;
}


function findHeader_(headings, requiredHeading) {
  const wanted = normalise_(requiredHeading);
  const index = headings.findIndex(
    heading => normalise_(heading) === wanted
  );

  if (index === -1) {
    throw new Error(
      'Could not find the heading "' + requiredHeading + '".'
    );
  }

  return index;
}


function validateConfiguration_() {
  if (
    !CONFIG.spreadsheetId ||
    CONFIG.spreadsheetId === 'PASTE_SPREADSHEET_ID_HERE'
  ) {
    throw new Error('Paste your spreadsheet ID into CONFIG.spreadsheetId.');
  }

  if (!['WEEK_COLUMNS', 'ROW_LOG'].includes(CONFIG.layout)) {
    throw new Error(
      "CONFIG.layout must be 'WEEK_COLUMNS' or 'ROW_LOG'."
    );
  }

  validateEmail_(CONFIG.managerEmail, 'managerEmail');

  if (!CONFIG.signOffName || CONFIG.signOffName === 'Your name') {
    throw new Error('Change CONFIG.signOffName to your name.');
  }
}


function validateEmail_(email, description) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || '').trim())) {
    throw new Error('Invalid ' + description + ': "' + email + '".');
  }
}


function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.spreadsheetId);
}


function reminderKey_(week, email) {
  return 'reminded|' + week.end + '|' + normalise_(email);
}


function normalise_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}


function isoDate_(date) {
  return (
    date.getUTCFullYear() +
    '-' +
    pad_(date.getUTCMonth() + 1) +
    '-' +
    pad_(date.getUTCDate())
  );
}


function britishDate_(isoDate) {
  const parts = isoDate.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}


function pad_(value) {
  return String(value).padStart(2, '0');
}
```

## 5. Change the five settings

Near the top of the code, change:

```javascript
spreadsheetId: 'PASTE_SPREADSHEET_ID_HERE',
```

Paste the ID you copied, keeping the quote marks.

Change:

```javascript
layout: 'WEEK_COLUMNS',
```

Use:

- `'WEEK_COLUMNS'` for Layout A; or
- `'ROW_LOG'` for Layout B.

Change:

```javascript
hoursSheet: 'Hours',
```

Replace `Hours` with the exact name written on your existing hours tab.

Change:

```javascript
managerEmail: 'your.name@organisation.org.uk',
signOffName: 'Your name',
```

Use your work email address and name.

If your existing headings are not called `Name`, `Date` and `Hours`, change the relevant heading names in the configuration section. Do not change anything else.

Click the **Save project** icon.

## 6. Set the time zone

1. On the left, click the cog labelled **Project Settings**.
2. Find **Time zone**.
3. Select **(GMT+00:00) London** or **Europe/London**.
4. Return to **Editor**.

The code also explicitly uses `Europe/London`, which handles the switch between GMT and British Summer Time.

## 7. Preview without emailing anybody

At the top of the editor:

1. Open the function drop-down.
2. Select `previewMissingTimesheets`.
3. Click **Run**.

The first time, Google will request permission:

1. Click **Review permissions**.
2. Choose your work account.
3. Read the permissions.
4. Click **Allow** or **Continue**.

The script uses `MailApp`, which can send email but cannot read your Gmail inbox. [Google explains that distinction here.](https://developers.google.com/apps-script/reference/mail/mail-app)

If Google says your organisation has blocked Apps Script or the application, only your Google Workspace administrator can enable it. Do not use a personal account as a workaround for work data.

Return to your spreadsheet. A new tab called **Reminder audit** should have appeared. Check its newest row carefully:

- Is the week correct?
- Are the right people listed?
- Is anybody incorrectly listed?
- Is anybody missing from the list?

Do not continue until the preview agrees with the check you would have made manually.

## 8. Send a test only to yourself

Back in Apps Script:

1. Select `sendTestReminderToMe` from the function drop-down.
2. Click **Run**.
3. Check your inbox.
4. Check the wording and spreadsheet link.

The subject begins with `TEST`, and no team member is contacted.

## 9. Switch on the weekly automation

1. Select `installFridayTrigger`.
2. Click **Run**.
3. On the left, click the alarm-clock icon labelled **Triggers**.
4. Confirm there is one row for `sendTimesheetReminders`.
5. Its event source should be **Time-driven**.

That completes the setup. The trigger runs as the Google account that created it, and the reminders will come from that account. [Google confirms that installable triggers run under their creator’s account.](https://developers.google.com/apps-script/guides/triggers/installable)

## Things that could go wrong

- **Names do not match.** Capital letters and spare spaces are ignored, but `Liz Jones` and `Elizabeth Jones` are different people.
- **The weekly heading is not a date.** Use a genuine date such as `31/07/2026`, not `Week 31`.
- **A formula produces zero for an empty entry.** Zero currently counts as completed. If zero always means missing in your organisation, change `zeroCountsAsComplete: true` to `false`.
- **Someone legitimately records zero hours.** Leave the setting as `true`, or that person will receive a reminder.
- **A tab or heading is renamed.** Update the corresponding name near the top of the code.
- **People complete their hours after 4pm.** They may already have been reminded.
- **Annual leave and bank holidays.** The automation still runs. Use **Pause until**, or temporarily delete the trigger.
- **Your access changes.** If you lose access to the spreadsheet or your account is disabled, the automation stops.
- **Google temporarily fails.** Apps Script normally emails the trigger owner a failure notice. You can also open Apps Script and click **Executions** to see failures. [Google’s failure-monitoring instructions are here.](https://developers.google.com/apps-script/guides/triggers/installable#errors_in_triggers)
- **Email limits.** Google Workspace currently permits far more than the maximum thirteen weekly recipients used here, although Google can change quotas. [Current Apps Script quotas are listed here.](https://developers.google.com/apps-script/guides/services/quotas)
- **Workplace restrictions.** Because this reads employee records and sends workplace email, use your work account and follow your association’s information-governance rules. Do not put salary, tenancy or health information in the reminder or audit.
- **Other people editing the automation.** The script project is separate from the shared spreadsheet. Do not share the script project with the team.
- **It is not exact to the minute.** Expect delivery between approximately 3.45pm and 4.15pm, not precisely at 4.00pm.
````

## Score them yourself

Read both answers again and score each one against these 5 questions. There is
no right answer. You are scoring your own reading.

1. **Could you follow it on a Friday afternoon with nobody to ask?** Good looks
   like named menus and buttons, in order, with nothing assumed about what you
   already know.
2. **Does it stop you emailing twelve colleagues by mistake?** Good looks like
   a way to see exactly who would be chased before anyone is chased.
3. **Is it clear which bits you change and which bits you leave alone?** Good
   looks like the lines you edit are marked, and everything else is explicitly
   hands off.
4. **Does it warn you about the scary Google permission screen?** Good looks
   like it tells you the warning is coming and what it means, so you do not
   stop there.
5. **Does it deal with real life, like annual leave and people who log zero?**
   Good looks like named situations with what to do about each, not a general
   note about testing.

## The verdict

These two answers are so different that the useful question is not which is
better, it is which one you would actually get to the end of.

ChatGPT built the thing an IT department would build. It asks which of two
sheet layouts you have and handles both. It gives you a preview that sends no
email at all, then a test that emails only you, then the live run. It remembers
who it has already chased so nobody gets two reminders. It writes an audit tab,
emails you a summary, supports a pause date for annual leave, and links to
Google's own documentation for the claims it makes. It is about six hundred
lines of code and nine numbered steps.

Claude built the thing you could finish before the school run. One short
script, seven settings at the top, and a test mode that emails only you until
you turn it off. It reaches Apps Script through Extensions on the sheet itself,
so you never have to find your spreadsheet ID. It is honest about its own
limits: it tells you it does not handle a sheet with one column per week, and
invites you to say so and get an adjusted version.

Claude has one advantage that matters more than its size. It warns you about
the Google screen that says the app is not verified, tells you to click
Advanced and continue anyway, and explains that unsafe means unreviewed rather
than dangerous. That screen is where most people give up. ChatGPT walks you
through granting permission and never mentions it.

Both are right about the timing, which is a nice detail. Claude says 4pm means
some time between 4pm and 5pm, which is true of the trigger it tells you to set
up by hand. ChatGPT says roughly a quarter to four until quarter past, which is
true of the tighter trigger its code creates.

If your sheet is simple and you want this done today, start with Claude's, and
go back and ask for the extras once it works. If twelve people are going to get
an automatic email from you every Friday for the next two years, ChatGPT's is
the one you want running, as long as you do not lose your nerve at the
permission screen.

**Models change often, so this verdict is only true for these versions on this
date.** When newer models arrive we run the same prompt again and publish the
rematch. The archived version of this lab then shows how the tools compared in
July 2026, which is a useful record of how fast they are moving.

## Try it yourself

1. Pick the job you do every week that you most resent. Chasing something,
   copying something, checking something.
2. Open claude.ai and chatgpt.com and describe it to both in the same words.
   Say plainly that you cannot write code and that nobody will help you.
3. Ask both the same three things: what do I click, what do I change, and what
   could go wrong.
4. Score both answers against the five questions above, before you build
   anything.
5. Build the one you would trust, and test it on yourself first. If either
   answer does not offer you a way to test it safely, that is the answer to be
   wary of.
