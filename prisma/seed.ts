import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

type SeedQuestion = readonly [string, readonly string[], number, string];
type SeedQuiz = { title: string; description: string; category: string; questions: SeedQuestion[] };

const quizzes: SeedQuiz[] = [
  {
    title: "Basic Programming Quiz",
    description: "A ten-question fundamentals check for web developers.",
    category: "Programming",
    questions: [
      ["What does HTML stand for?", ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlink Text Management Language"], 0, "HTML structures web pages."],
      ["Which language adds styling to a web page?", ["CSS", "SQL", "HTTP"], 0, "CSS controls visual presentation."],
      ["Which keyword declares a constant in JavaScript?", ["var", "let", "const"], 2, "const prevents reassignment."],
      ["What does SQL primarily manage?", ["Images", "Relational data", "CSS animations"], 1, "SQL manages relational databases."],
      ["Which data type stores true or false?", ["String", "Number", "Boolean"], 2, "A Boolean is true or false."],
      ["What does API stand for?", ["Application Programming Interface", "Applied Program Internet", "Application Process Input"], 0, "An API defines software communication."],
      ["Which symbol starts a JavaScript single-line comment?", ["//", "<!--", "#"], 0, "JavaScript uses two forward slashes."],
      ["Which HTTP status means not found?", ["200", "201", "404"], 2, "HTTP 404 means the resource was not found."],
      ["What is a reusable piece of code called?", ["Function", "Pixel", "Protocol"], 0, "A function packages reusable behavior."],
      ["Which tool installs JavaScript packages?", ["npm", "Git", "HTML"], 0, "npm is Node.js's package manager."],
    ],
  },
  {
    title: "General Knowledge Quiz",
    description: "Ten quick questions on places, history, language, and culture.",
    category: "General Knowledge",
    questions: [
      ["What is the capital of Japan?", ["Seoul", "Tokyo", "Beijing"], 1, "Tokyo is Japan's capital."],
      ["How many sides does a hexagon have?", ["Five", "Six", "Eight"], 1, "A hexagon has six sides."],
      ["Which ocean is the largest?", ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean"], 2, "The Pacific is the largest ocean."],
      ["What is the currency of the United Kingdom?", ["Euro", "Pound sterling", "Dollar"], 1, "The UK uses pound sterling."],
      ["Which language is primarily spoken in Brazil?", ["Spanish", "Portuguese", "French"], 1, "Portuguese is Brazil's official language."],
      ["Who wrote Romeo and Juliet?", ["William Shakespeare", "Charles Dickens", "Jane Austen"], 0, "The play was written by William Shakespeare."],
      ["What is the largest mammal?", ["African elephant", "Blue whale", "Giraffe"], 1, "The blue whale is the largest mammal."],
      ["How many days are in a leap year?", ["365", "366", "367"], 1, "Leap years have 366 days."],
      ["Which country is home to the city of Marrakech?", ["Morocco", "Egypt", "Greece"], 0, "Marrakech is a city in Morocco."],
      ["What is the name of the star at the center of our solar system?", ["Sirius", "Polaris", "The Sun"], 2, "Our solar system centers on the Sun."],
    ],
  },
  {
    title: "Science Quiz",
    description: "Ten approachable questions about the natural world.",
    category: "Science",
    questions: [
      ["Which planet is known as the Red Planet?", ["Venus", "Mars", "Jupiter"], 1, "Iron-rich dust gives Mars its reddish appearance."],
      ["What gas do plants absorb from the atmosphere?", ["Oxygen", "Carbon dioxide", "Hydrogen"], 1, "Plants use carbon dioxide during photosynthesis."],
      ["What is the chemical symbol for water?", ["CO2", "H2O", "NaCl"], 1, "A water molecule contains two hydrogen atoms and one oxygen atom."],
      ["How many bones are typically in an adult human body?", ["206", "186", "226"], 0, "An adult human skeleton typically has 206 bones."],
      ["What force keeps planets in orbit around the Sun?", ["Magnetism", "Gravity", "Friction"], 1, "Gravity keeps planets in their orbits."],
      ["What is the closest star to Earth?", ["Proxima Centauri", "The Sun", "Sirius"], 1, "The Sun is Earth's closest star."],
      ["Which organ pumps blood around the human body?", ["Lungs", "Brain", "Heart"], 2, "The heart pumps blood through the circulatory system."],
      ["At sea level, at what temperature does water boil in Celsius?", ["90°C", "100°C", "120°C"], 1, "Water boils at 100°C at standard atmospheric pressure."],
      ["What is the hardest naturally occurring mineral?", ["Quartz", "Diamond", "Topaz"], 1, "Diamond is the hardest naturally occurring mineral."],
      ["Which part of a cell contains most of its genetic material?", ["Nucleus", "Cell membrane", "Cytoplasm"], 0, "In most cells, DNA is stored in the nucleus."],
    ],
  },
];

async function main() {
  for (const seedQuiz of quizzes) {
    const existingQuiz = await prisma.quiz.findFirst({ where: { title: seedQuiz.title } });
    const quiz = existingQuiz ?? await prisma.quiz.create({
      data: {
        title: seedQuiz.title,
        description: seedQuiz.description,
        category: seedQuiz.category,
        difficulty: "Beginner",
        published: true,
      },
    });

    const existingQuestions = await prisma.question.count({ where: { quizId: quiz.id } });
    if (existingQuestions === 0) {
      await prisma.question.createMany({
        data: seedQuiz.questions.map(([text, , , explanation]) => ({
          text,
          explanation,
          quizId: quiz.id,
        })),
      });
    }

    const createdQuestions = await prisma.question.findMany({
      where: { quizId: quiz.id },
      orderBy: { id: "asc" },
      take: seedQuiz.questions.length,
      select: { id: true },
    });

    for (const [questionIndex, [, options, correctIndex]] of seedQuiz.questions.entries()) {
      const question = createdQuestions[questionIndex];
      if (!question || await prisma.choice.count({ where: { questionId: question.id } }) > 0) continue;

      await prisma.choice.createMany({
        data: options.map((text, optionIndex) => ({
          text,
          isCorrect: optionIndex === correctIndex,
          questionId: question.id,
        })),
      });
    }

    console.log(`Seeded ${seedQuiz.questions.length} questions for ${quiz.title}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });