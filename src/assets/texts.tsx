interface Text {
  name: string;
  content: string[];
  default_time: number;
}

interface Texts {
  'pt-BR': Text[];
  'en-US': Text[];
}

const texts: Texts = {
  'pt-BR': [
    {
      name: 'Curto',
      content: [
        'O rato roeu a roupa do rei de Roma.',
        'A aranha arranha a rã.',
        'O tempo perguntou pro tempo quanto tempo o tempo tem.',
        'A vaca malhada foi molhada por outra vaca molhada e malhada.',
      ],
      default_time: 15,
    },
    {
      name: 'Médio',
      content: [
        'Um pequeno jabuti xereta viu dez cegonhas felizes.',
        'O sabiá não sabia que o sabiá sabia assobiar.',
      ],
      default_time: 30,
    },
  ],
  'en-US': [
    {
      name: 'Short',
      content: [
        'The quick brown fox jumps over the lazy dog.',
        'A big black bug bit a big black bear and made the big black bear bleed blood.',
      ],
      default_time: 15,
    },
    {
      name: 'Medium',
      content: [
        'She sells seashells by the seashore.',
        'How can a clam cram in a clean cream can?',
      ],
      default_time: 30,
    },
  ],
};
export default texts;
