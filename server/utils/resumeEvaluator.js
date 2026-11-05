const path = require('path');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const extractTextFromResume = async (fileBuffer, originalName) => {
  const extension = path.extname(originalName).toLowerCase();
  if (extension === '.pdf') {
    const parser = new PDFParse({ data: fileBuffer });
    try {
      const parsed = await parser.getText();
      return parsed.text;
    } finally {
      await parser.destroy();
    }
  } else if (extension === '.docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }
  throw new Error('Resume must be a PDF or DOCX file.');
};

const evaluateResume = async (fileBuffer, originalName, companyCriteria) => {
  const resumeText = (await extractTextFromResume(fileBuffer, originalName)).toLowerCase();
  const requiredSkills = companyCriteria.requiredSkills || [];
  const matchedSkills = requiredSkills.filter((skill) =>
    resumeText.includes(skill.toLowerCase())
  );

  const matchScore = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : null;

  return {
    matchScore,
    matchedSkills,
  };
};

module.exports = { evaluateResume };