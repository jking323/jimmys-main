import { HUMIDOR } from './humidor.js';

export const QUIZ_QUESTIONS = [
  {
    id: 'flavor',
    title: 'Where do your tastes land?',
    options: [
      { value: 'sweet', label: 'Sweet & creamy', sub: 'Cocoa, almond, hay' },
      { value: 'earthy', label: 'Earthy & woody', sub: 'Cedar, leather, coffee' },
      { value: 'bold', label: 'Bold & spicy', sub: 'Pepper, oak, espresso' },
    ],
  },
  {
    id: 'time',
    title: 'How long do you have?',
    options: [
      { value: 'short', label: '20–30 min', sub: 'A quick one between things' },
      { value: 'mid', label: '45 min – 1 hour', sub: 'A proper sit-down' },
      { value: 'long', label: '90 min +', sub: "I'm not going anywhere" },
    ],
  },
  {
    id: 'strength',
    title: 'How strong are you up for?',
    options: [
      { value: 'mild', label: 'Mild', sub: 'Smooth start' },
      { value: 'med', label: 'Medium', sub: 'My usual' },
      { value: 'full', label: 'Full', sub: 'Wake me up' },
    ],
  },
  {
    id: 'pairing',
    title: 'What will you be sipping?',
    options: [
      { value: 'coffee', label: 'Coffee', sub: 'Espresso or pour-over' },
      { value: 'bourbon', label: 'Bourbon / whiskey', sub: 'Something to sip' },
      { value: 'nothing', label: 'Just the cigar', sub: 'No competition' },
    ],
  },
];

export function quizRecommendations(answers) {
  const score = {};
  HUMIDOR.forEach((c) => (score[c.id] = 0));
  const bump = (id, n = 1) => {
    if (score[id] != null) score[id] += n;
  };

  if (answers.flavor === 'sweet') { bump('romeo-1875', 3); bump('fuente-hemingway', 3); bump('ashton-vsg', 2); }
  if (answers.flavor === 'earthy') { bump('padron-1964', 3); bump('liga-9', 2); bump('oliva-melanio', 2); }
  if (answers.flavor === 'bold') { bump('my-father-1922', 3); bump('liga-9', 3); bump('davidoff-winston', 2); }

  if (answers.time === 'short') { bump('fuente-hemingway', 2); bump('my-father-1922', 2); }
  if (answers.time === 'mid') { bump('padron-1964', 2); bump('oliva-melanio', 2); bump('ashton-vsg', 1); }
  if (answers.time === 'long') { bump('romeo-1875', 2); bump('davidoff-winston', 2); bump('liga-9', 1); }

  if (answers.strength === 'mild') { bump('romeo-1875', 3); bump('fuente-hemingway', 2); }
  if (answers.strength === 'med') { bump('padron-1964', 3); bump('davidoff-winston', 2); bump('ashton-vsg', 2); }
  if (answers.strength === 'full') { bump('my-father-1922', 3); bump('liga-9', 3); bump('oliva-melanio', 2); }

  if (answers.pairing === 'coffee') { bump('ashton-vsg', 2); bump('oliva-melanio', 1); bump('fuente-hemingway', 1); }
  if (answers.pairing === 'bourbon') { bump('padron-1964', 2); bump('liga-9', 2); bump('davidoff-winston', 1); }
  if (answers.pairing === 'nothing') { bump('romeo-1875', 1); bump('my-father-1922', 1); }

  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => HUMIDOR.find((c) => c.id === id));
}
