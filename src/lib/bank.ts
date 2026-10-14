import type { SubjectId } from "./game";
type Row = [SubjectId, string, number, string, string, string[] | null];
// ADD QUESTIONS HERE: [topic, difficulty (0=Beginner..3=Expert), question, answer, options?]
// Leave out the options to make it a typed (short answer) question.
type Q = [string, number, string, string, string[]?];
const S = (s: SubjectId, r: Q[]): Row[] => r.map(([t, d, q, a, o]) => [s, t, d, q, a, o ?? null]);

export const EXTRA: Row[] = [
  ...S("science", [
    ["Biology", 0, "Which organ pumps blood around the body?", "Heart", ["Heart", "Lungs", "Brain", "Stomach"]],
    ["Biology", 1, "What is the green pigment in plants called?", "Chlorophyll", ["Chlorophyll", "Melanin", "Keratin", "Insulin"]],
    ["Biology", 2, "Which molecule in red blood cells carries oxygen?", "Hemoglobin"],
    ["Chemistry", 0, "Which state of matter has a fixed shape?", "Solid", ["Solid", "Liquid", "Gas", "Plasma"]],
    ["Chemistry", 1, "Which gas do humans breathe out?", "Carbon dioxide", ["Oxygen", "Carbon dioxide", "Helium", "Hydrogen"]],
    ["Chemistry", 2, "What is the chemical symbol for gold?", "Au"],
    ["Chemistry", 3, "What is the pH of a neutral solution?", "7"],
    ["Physics", 0, "What do we call a push or a pull on an object?", "Force", ["Force", "Light", "Heat", "Colour"]],
    ["Physics", 2, "The speed of light is closest to which value?", "300,000 km/s", ["3,000 km/s", "300,000 km/s", "30 km/s", "1,000 km/s"]],
    ["Physics", 3, "Which formula gives speed?", "Distance ÷ time", ["Distance ÷ time", "Mass × time", "Force ÷ mass", "Time ÷ distance"]],
    ["Earth Science", 1, "What causes day and night?", "Earth's rotation", ["Earth's rotation", "The Moon", "Clouds", "Earth's orbit"]],
    ["Earth Science", 2, "Which rock forms from cooled lava?", "Igneous", ["Igneous", "Sedimentary", "Metamorphic", "Fossil"]],
    ["Earth Science", 3, "Which atmosphere layer contains the ozone layer?", "Stratosphere", ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"]],
    ["Earth Science", 1, "What is the largest ocean on Earth?", "Pacific", ["Atlantic", "Pacific", "Indian", "Arctic"]],
  ]),
  ...S("english", [
    ["Reading", 0, "What is the main idea of a paragraph?", "What it is mostly about", ["What it is mostly about", "The longest word", "The first letter", "The page number"]],
    ["Reading", 2, "What does 'infer' mean when reading?", "Use clues to work something out", ["Copy the text", "Use clues to work something out", "Skip a page", "Read aloud"]],
    ["Reading", 3, "What is the theme of a story?", "Its central message", ["Its central message", "Its setting", "Its first line", "Its length"]],
    ["Grammar", 1, "Which word is a verb?", "Jump", ["Jump", "Table", "Green", "Soft"]],
    ["Grammar", 1, "What is the plural of 'child'?", "Children"],
    ["Grammar", 2, "Which sentence is correct?", "She doesn't like apples.", ["She don't like apples.", "She doesn't like apples.", "She not like apples.", "She no like apples."]],
    ["Grammar", 3, "Which word is the adverb: 'He ran quickly.'?", "quickly"],
    ["Vocabulary", 0, "What is the opposite of 'hot'?", "Cold", ["Cold", "Warm", "Spicy", "Bright"]],
    ["Vocabulary", 2, "What is an antonym of 'generous'?", "Selfish", ["Selfish", "Kind", "Giving", "Rich"]],
    ["Vocabulary", 2, "What does the prefix 'un-' mean?", "Not", ["Not", "Again", "Before", "Under"]],
    ["Writing", 1, "Which one is a proper noun?", "Canada", ["city", "Canada", "river", "country"]],
    ["Writing", 2, "What goes at the end of a statement?", "A period", ["A period", "A question mark", "A comma", "A hyphen"]],
    ["Writing", 3, "What is a metaphor?", "A comparison without 'like' or 'as'", ["A comparison without 'like' or 'as'", "A rhyme", "A question", "A long word"]],
    ["Writing", 0, "How should a sentence begin?", "A capital letter", ["A capital letter", "A number", "A comma", "A space"]],
  ]),
  ...S("technology", [
    ["Coding Basics", 0, "What do we call a mistake in code?", "Bug", ["Bug", "Pixel", "Mouse", "Cloud"]],
    ["Coding Basics", 1, "What stores a value that can change?", "Variable", ["Variable", "Comment", "Monitor", "Cable"]],
    ["Coding Basics", 1, "What does CPU stand for?", "Central Processing Unit", ["Central Processing Unit", "Computer Power Unit", "Core Program Utility", "Central Printer Unit"]],
    ["Coding Basics", 2, "What does HTML stand for?", "HyperText Markup Language", ["HyperText Markup Language", "High Tech Machine Logic", "Home Tool Making Language", "Hyper Transfer Mail Link"]],
    ["Coding Basics", 3, "What is a function?", "A reusable block of code", ["A reusable block of code", "A type of bug", "A computer part", "A password"]],
    ["Logic", 0, "What comes next: 2, 4, 6, 8, ?", "10"],
    ["Logic", 1, "What is the result of TRUE OR FALSE?", "True", ["True", "False"]],
    ["Logic", 2, "What is binary 101 in decimal?", "5"],
    ["Logic", 2, "What is NOT TRUE?", "False", ["True", "False"]],
    ["Logic", 3, "How many values can one bit hold?", "2"],
    ["Digital Literacy", 0, "A stranger sends a friend request. What should you do?", "Ask a trusted adult", ["Accept it", "Ask a trusted adult", "Share your address", "Reply with your password"]],
    ["Digital Literacy", 1, "What is phishing?", "Tricking people to steal info", ["Tricking people to steal info", "A type of fishing game", "A fast internet", "A photo filter"]],
    ["Digital Literacy", 2, "What does 'https' in a web address show?", "The connection is encrypted", ["The page is free", "The connection is encrypted", "The site is new", "The page is a game"]],
    ["Digital Literacy", 3, "What does two-factor authentication add?", "A second proof of identity", ["A second proof of identity", "A faster login", "More storage", "A new password"]],
  ]),
];
