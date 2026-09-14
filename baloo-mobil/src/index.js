const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '2mb' }));

const ROOT = path.resolve(__dirname, '..');
const TEXT_PATH = path.join(ROOT, 'mastertext.txt');
const MARKS_PATH = path.join(ROOT, 'markings.json');

function ensureTextFile() {
  if (!fs.existsSync(TEXT_PATH)) {
    fs.writeFileSync(TEXT_PATH, '', 'utf8');
  }
}

function ensureMarksFile() {
  if (!fs.existsSync(MARKS_PATH)) {
    fs.writeFileSync(MARKS_PATH, JSON.stringify({}), 'utf8');
  }
}

app.get('/mastertext', (req, res) => {
  try {
    ensureTextFile();
    const content = fs.readFileSync(TEXT_PATH, 'utf8');
    res.json({ lines: content.split(/\r?\n/), updatedAt: fs.statSync(TEXT_PATH).mtimeMs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read mastertext.txt' });
  }
});

app.post('/mastertext', (req, res) => {
  try {
    ensureTextFile();
    const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
    fs.writeFileSync(TEXT_PATH, lines.join('\n'), 'utf8');
    res.json({ ok: true, updatedAt: fs.statSync(TEXT_PATH).mtimeMs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save mastertext.txt' });
  }
});

app.get('/markings', (req, res) => {
  try {
    ensureMarksFile();
    const raw = fs.readFileSync(MARKS_PATH, 'utf8');
    res.json({ marks: JSON.parse(raw), updatedAt: fs.statSync(MARKS_PATH).mtimeMs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read markings' });
  }
});

app.post('/markings', (req, res) => {
  try {
    ensureMarksFile();
    const marks = req.body?.marks;
    if (typeof marks !== 'object' || marks === null) throw new Error('Invalid marks');
    fs.writeFileSync(MARKS_PATH, JSON.stringify(marks, null, 2), 'utf8');
    res.json({ ok: true, updatedAt: fs.statSync(MARKS_PATH).mtimeMs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save markings' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Baloo Mobile API + PWA running at http://localhost:' + PORT);
});