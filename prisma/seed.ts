import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const questions = [
  ["What does HTML stand for?", ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink Text Management Language", "Home Tool Markup Language"], 0, "HTML structures web pages."],
  ["Which language adds styling to a web page?", ["CSS", "SQL", "HTTP", "JSON"], 0, "CSS controls visual presentation."],
  ["Which keyword declares a constant in JavaScript?", ["var", "let", "const", "static"], 2, "const prevents reassignment."],
  ["What does SQL primarily manage?", ["Images", "Relational data", "CSS animations", "Network cables"], 1, "SQL manages relational databases."],
  ["Which data type stores true or false?", ["String", "Number", "Boolean", "Array"], 2, "A Boolean is true or false."],
  ["What does API stand for?", ["Application Programming Interface", "Applied Program Internet", "Application Process Input", "Advanced Page Index"], 0, "An API defines software communication."],
  ["Which symbol starts a JavaScript single-line comment?", ["//", "<!--", "#", "**"], 0, "JavaScript uses two forward slashes."],
  ["Which HTTP status means not found?", ["200", "201", "404", "500"], 2, "HTTP 404 means the resource was not found."],
  ["What is a reusable piece of code called?", ["Function", "Pixel", "Protocol", "Viewport"], 0, "A function packages reusable behavior."],
  ["Which tool installs JavaScript packages?", ["npm", "Git", "HTML", "Postgres"], 0, "npm is Node.js's package manager."],
] as const;

async function main() {
  const quiz = await prisma.quiz.upsert({
    where: { id: 1 },
    update: {
      title: "Basic Programming Quiz",
      description: "A ten-question fundamentals check for web developers.",
      category: "Programming",
      difficulty: "Beginner",
      published: true,
    },
    create: {
      title: "Basic Programming Quiz",
      description: "A ten-question fundamentals check for web developers.",
      category: "Programming",
      difficulty: "Beginner",
      published: true,
    },
  });

  await prisma.question.deleteMany({ where: { quizId: quiz.id } });
  await prisma.quiz.update({
    where: { id: quiz.id },
    data: {
      questions: {
        create: questions.map(([text, choices, correctIndex, explanation]) => ({
          text,
          explanation,
          choices: {
            create: choices.map((choice, index) => ({
              text: choice,
              isCorrect: index === correctIndex,
            })),
          },
        })),
      },
    },
  });

  console.log(`Seeded ${questions.length} questions for ${quiz.title}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });