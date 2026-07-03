const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listeningExams = [
  {
    title: "Cambridge IELTS 11 Test 1 Listening",
    description: "Listening Practice Test 1 from Cambridge IELTS 11",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Hiring a Public Room",
        passageText: "Listen to the telephone conversation between a customer and a hall booking agent about hiring a room.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Name of room: 1. _______ Hall", answer: "Charlton", explanation: "The speaker spells the name C-h-a-r-l-t-o-n." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Capacity: 2. _______ people", answer: "115", explanation: "The agent quotes the capacity as 115." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Payment method: deposit paid by 3. _______", answer: "cash", explanation: "The speaker says they paid the deposit by cash." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Cost includes: use of the 4. _______ area", answer: "parking", explanation: "The agent confirms parking is included." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Additional charges: licensing for 5. _______", answer: "music", explanation: "There is an extra charge for playing music." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Must ensure: 6. _______ doors are kept clear", answer: "entry", explanation: "Safety rules state entry doors must be clear." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Equipment: a mobile 7. _______ is available", answer: "stage", explanation: "A mobile stage is provided." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "Access: requires a keypad 8. _______", answer: "code", explanation: "You need a code to get into the building." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "Clean up: sweep the 9. _______", answer: "floor", explanation: "Clean up rules require sweeping the floor." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Clean up: take down all 10. _______", answer: "decorations", explanation: "All decorations must be removed." }
        ]
      },
      {
        sectionOrder: 2,
        title: "Section 2: Fiddy Working Heritage Farm",
        passageText: "Listen to the guide giving information to visitors at Fiddy Working Heritage Farm.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        questions: [
          { questionNumber: 11, type: "FILL_IN_BLANKS", content: "Safety: keep away from 11. _______ in the fields", answer: "animals", explanation: "Keep away from active animals in fields." },
          { questionNumber: 12, type: "FILL_IN_BLANKS", content: "Safety: do not touch the farm 12. _______", answer: "tools", explanation: "Do not touch tools displayed." },
          { questionNumber: 13, type: "FILL_IN_BLANKS", content: "Footwear: wear sensible 13. _______ due to muddy paths", answer: "shoes", explanation: "Sensible shoes are required." },
          { questionNumber: 14, type: "FILL_IN_BLANKS", content: "Pets: keep your 14. _______ on a lead", answer: "dog", explanation: "Dogs must be on a lead." },
          {
            questionNumber: 15,
            type: "MULTIPLE_CHOICE",
            content: "Where is the Scarecrow located?",
            options: ["A. at Fiddy House", "B. next to the pond", "C. in the covered picnic area", "D. at the café", "E. next to the maze", "F. in the agricultural field"],
            answer: "F",
            explanation: "The scarecrow is at the agricultural field (F)."
          },
          {
            questionNumber: 16,
            type: "MULTIPLE_CHOICE",
            content: "Where is the Maze located?",
            options: ["A. at Fiddy House", "B. next to the pond", "C. in the covered picnic area", "D. at the café", "E. next to the maze", "F. in the agricultural field", "G. by the orchard"],
            answer: "G",
            explanation: "The maze is by the orchard (G)."
          },
          {
            questionNumber: 17,
            type: "MULTIPLE_CHOICE",
            content: "Where is the Café located?",
            options: ["A. at Fiddy House", "B. next to the pond", "C. in the covered picnic area", "D. near the entrance"],
            answer: "D",
            explanation: "The café is near the entrance (D)."
          },
          {
            questionNumber: 18,
            type: "MULTIPLE_CHOICE",
            content: "Where is the Black Barn located?",
            options: ["A. at Fiddy House", "B. next to the pond", "C. near the wood", "H. behind the stables"],
            answer: "H",
            explanation: "The black barn is behind the stables (H)."
          },
          {
            questionNumber: 19,
            type: "MULTIPLE_CHOICE",
            content: "Where is the Covered Picnic Area located?",
            options: ["A. at Fiddy House", "B. next to the pond", "C. near the wood"],
            answer: "C",
            explanation: "The picnic area is near the wood (C)."
          },
          {
            questionNumber: 20,
            type: "MULTIPLE_CHOICE",
            content: "Where is Fiddy House located?",
            options: ["A. near the orchard", "B. next to the pond", "C. near the wood"],
            answer: "A",
            explanation: "Fiddy House is near the orchard (A)."
          }
        ]
      },
      {
        sectionOrder: 3,
        title: "Section 3: Study on Gender in Physics",
        passageText: "Listen to the discussion between two students, Greg and Lisa, about their research project on gender physics.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        questions: [
          {
            questionNumber: 21,
            type: "MULTIPLE_CHOICE",
            content: "The students in Akira Miyake's study were all majoring in",
            options: ["A. physics.", "B. social science.", "C. STEM disciplines."],
            answer: "C",
            explanation: "Akira Miyake's study involved students in STEM majors."
          },
          {
            questionNumber: 22,
            type: "MULTIPLE_CHOICE",
            content: "The aim of the study was to investigate",
            options: ["A. how to increase female enrollment.", "B. a way of improving women's performance in physics.", "C. male students' learning styles."],
            answer: "B",
            explanation: "The study focused on improving performance of women."
          },
          {
            questionNumber: 23,
            type: "MULTIPLE_CHOICE",
            content: "The female students were wrong to believe that",
            options: ["A. they would fail the course.", "B. the male students expected them to do badly.", "C. physics was too hard."],
            answer: "B",
            explanation: "Women wrongly believed men expected them to do poorly."
          },
          {
            questionNumber: 24,
            type: "MULTIPLE_CHOICE",
            content: "The students were asked to write about",
            options: ["A. their physics exams.", "B. their career goals.", "C. something that was important to them personally."],
            answer: "C",
            explanation: "Writing task asked about personal values."
          },
          {
            questionNumber: 25,
            type: "MULTIPLE_CHOICE",
            content: "The aim of the writing exercise was",
            options: ["A. to reduce stress.", "B. to test writing skills.", "C. to increase confidence."],
            answer: "A",
            explanation: "The values-affirmation writing exercise aimed to reduce stress."
          },
          {
            questionNumber: 26,
            type: "MULTIPLE_CHOICE",
            content: "Researchers were surprised by",
            options: ["A. the performance of male students.", "B. the positive impact it had on physics results for women.", "C. how long the exercise took."],
            answer: "B",
            explanation: "They were surprised by how much female physics scores improved."
          },
          {
            questionNumber: 27,
            type: "MULTIPLE_CHOICE",
            content: "Greg and Lisa think the results could have been affected by",
            options: ["A. the time of the class.", "B. the test format.", "C. the information the students were given."],
            answer: "C",
            explanation: "They suggest student instructions may have influenced outcomes."
          },
          {
            questionNumber: 28,
            type: "MULTIPLE_CHOICE",
            content: "In their own project, they will compare the effects of",
            options: ["A. two different writing tasks.", "B. individual work and teamwork.", "C. lectures and seminars."],
            answer: "A",
            explanation: "They plan to compare two distinct writing activities."
          },
          {
            questionNumber: 29,
            type: "MULTIPLE_CHOICE",
            content: "Smolinsky's research found that class teamwork activities",
            options: ["A. helped female students.", "B. had no effect on the performance of men or women.", "C. helped male students."],
            answer: "B",
            explanation: "Smolinsky found teamwork exercises had no significant performance impact."
          },
          {
            questionNumber: 30,
            type: "MULTIPLE_CHOICE",
            content: "For their next step, Lisa and Greg decide to",
            options: ["A. look at the science timetable.", "B. consult their professor.", "C. design a questionnaire."],
            answer: "A",
            explanation: "They choose to check the timetable first."
          }
        ]
      },
      {
        sectionOrder: 4,
        title: "Section 4: Ocean Biodiversity",
        passageText: "Listen to the lecture about marine life and ocean biodiversity hotspots.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        questions: [
          { questionNumber: 31, type: "FILL_IN_BLANKS", content: "Key focus: identifying hotspots for marine 31. _______", answer: "conservation", explanation: "Hotspots are identified for marine conservation." },
          { questionNumber: 32, type: "FILL_IN_BLANKS", content: "High biodiversity areas: plenty of 32. _______ available", answer: "food", explanation: "These areas have abundant food." },
          { questionNumber: 33, type: "FILL_IN_BLANKS", content: "Temperatures: moderate at the 33. _______ of the sea", answer: "surface", explanation: "Moderation of temperature is at the surface." },
          { questionNumber: 34, type: "FILL_IN_BLANKS", content: "Chemicals: high levels of 34. _______", answer: "oxygen", explanation: "High oxygen levels support rich diversity." },
          { questionNumber: 35, type: "FILL_IN_BLANKS", content: "Main species: hotspots are key for marine 35. _______", answer: "mammals", explanation: "The speaker highlights marine mammals." },
          { questionNumber: 36, type: "FILL_IN_BLANKS", content: "Threats: melting of polar 36. _______", answer: "ice", explanation: "Melting ice threatens polar marine life." },
          { questionNumber: 37, type: "FILL_IN_BLANKS", content: "Impact: a serious 37. _______ in fish populations", answer: "decline", explanation: "Decline of fish stocks is reported." },
          { questionNumber: 38, type: "FILL_IN_BLANKS", content: "Research: need to 38. _______ migration patterns", answer: "map", explanation: "Researchers aim to map migration patterns." },
          { questionNumber: 39, type: "FILL_IN_BLANKS", content: "Animals: tagging tracks 39. _______ paths", answer: "migration", explanation: "Tagging helps trace migration routes." },
          { questionNumber: 40, type: "FILL_IN_BLANKS", content: "Human activities: control fish 40. _______ levels", answer: "consumption", explanation: "Over-consumption must be regulated." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 2 Listening",
    description: "Listening Practice Test 2 from Cambridge IELTS 11",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Enquiry about joining Youth Council",
        passageText: "Listen to the conversation about joining a local youth council.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Current accommodation: staying in a 1. _______", answer: "hostel", explanation: "Roger says he is staying in a hostel during the week." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Address: 17 2. _______ Street", answer: "Buckleigh", explanation: "The name of the street is spelled B-u-c-k-l-e-i-g-h." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Postcode: 3. _______", answer: "PE9 7QT", explanation: "The postcode is PE9 7QT." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Part-time job: works as a 4. _______", answer: "waiter", explanation: "He mentions he works as a waiter." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Major subject of study: 5. _______", answer: "politics", explanation: "He is studying politics at college." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Hobby: enjoys 6. _______", answer: "cycling", explanation: "He mentions cycling as a key hobby." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Interest: frequent visits to the local 7. _______", answer: "cinema", explanation: "He is interested in cinema." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "Volunteer preference: wants to work with 8. _______ youth", answer: "disabled", explanation: "He wishes to work with disabled children." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "Meeting time: next Monday at 9. _______ pm", answer: "4.30", explanation: "The appointment is scheduled for 4.30 pm." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Contact number: 10. _______", answer: "07788136711", explanation: "He gives his phone number as 07788136711." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 3 Listening",
    description: "Listening Practice Test 3 from Cambridge IELTS 11",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Free activities in the Burnham area",
        passageText: "Listen to the telephone conversation between a tourist and a tourist officer about free activities.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        questions: [
          {
            questionNumber: 1,
            type: "MULTIPLE_CHOICE",
            content: "The 'Family Welcome' event in the art gallery starts at",
            options: ["A. 10.00 am", "B. 10.30 am", "C. 11.00 am"],
            answer: "B",
            explanation: "The event is confirmed to start at 10.30 am."
          },
          {
            questionNumber: 2,
            type: "MULTIPLE_CHOICE",
            content: "The subject of the film shown at the event is",
            options: ["A. paintings.", "B. sculpture.", "C. ceramics."],
            answer: "C",
            explanation: "They will show a short documentary on ceramics."
          },
          {
            questionNumber: 3,
            type: "MULTIPLE_CHOICE",
            content: "Most of the free concerts take place",
            options: ["A. in the morning.", "B. at lunchtime.", "C. in the evening."],
            answer: "B",
            explanation: "The officer mentions most concerts are held at lunchtime."
          },
          {
            questionNumber: 4,
            type: "MULTIPLE_CHOICE",
            content: "The concert at 4 pm is held",
            options: ["A. in a church.", "B. in a museum.", "C. in a library."],
            answer: "C",
            explanation: "The afternoon concert will be in the local library."
          },
          {
            questionNumber: 5,
            type: "MULTIPLE_CHOICE",
            content: "The boat race begins at",
            options: ["A. Offord Marina.", "B. Charlesworth Bridge.", "C. the Town Hall."],
            answer: "B",
            explanation: "The start line for the race is Charlesworth Bridge."
          },
          {
            questionNumber: 6,
            type: "MULTIPLE_CHOICE",
            content: "One of the boat race teams",
            options: ["A. won last year's race.", "B. has represented the region in a national competition.", "C. has a new coach."],
            answer: "B",
            explanation: "The blue team has represented the region nationally."
          },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Paxton Nature Reserve: excellent for watching 7. _______", answer: "birds", explanation: "It is famous for bird watching." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "reserve has a trail highlighting unusual 8. _______", answer: "flowers", explanation: "You can see rare flowers on the path." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "recommended to go in autumn to find 9. _______", answer: "mushrooms", explanation: "Mushrooms are abundant in autumn." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "activities: children can swim in the 10. _______", answer: "river", explanation: "Swimming in the river is allowed." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 4 Listening",
    description: "Listening Practice Test 4 from Cambridge IELTS 11",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Festival Activities",
        passageText: "Listen to the phone call about booking tickets and venues for festival activities.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Jazz band venue: 1. _______ school", answer: "secondary", explanation: "The venue is the secondary school hall." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Featured artist Carolyn Hart plays the 2. _______", answer: "flute", explanation: "She is a world-class flute player." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Duck races venue: behind the 3. _______", answer: "cinema", explanation: "The race starts on the canal behind the cinema." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Prize for winning duck: tickets to a 4. _______", answer: "concert", explanation: "The prize is tickets to the opening concert." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Ducks can be bought in the local 5. _______", answer: "market", explanation: "Ducks are sold in the market on Friday." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Flower show venue: 6. _______ Hall", answer: "Bythwaite", explanation: "It takes place at Bythwaite Hall." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Flower show prize presenter: a local 7. _______", answer: "actor", explanation: "A well-known local actor presents the awards." },
          {
            questionNumber: 8,
            type: "MULTIPLE_CHOICE",
            content: "The play 'Mystery of Muldoon' is",
            options: ["A. mainly for children.", "B. mainly for adults.", "C. for people of all ages."],
            answer: "A",
            explanation: "The play is aimed at young children."
          },
          {
            questionNumber: 9,
            type: "MULTIPLE_CHOICE",
            content: "The play 'Fire and Flood' is",
            options: ["A. mainly for children.", "B. mainly for adults.", "C. for people of all ages."],
            answer: "B",
            explanation: "It deals with mature historical themes for adults."
          },
          {
            questionNumber: 10,
            type: "MULTIPLE_CHOICE",
            content: "The play 'Silly Sailor' is",
            options: ["A. mainly for children.", "B. mainly for adults.", "C. for people of all ages."],
            answer: "C",
            explanation: "It is a light comedy suitable for everyone."
          }
        ]
      }
    ]
  }
];

const readingExams = [
  {
    title: "Cambridge IELTS 11 Test 1 Reading",
    description: "Reading Practice Test 1 from Cambridge IELTS 11",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Crop-growing Skyscrapers",
        passageText: "By the year 2050, nearly 80% of the Earth’s population will live in urban centres. Indoor farming in skyscrapers (vertical farming) offers a solution to feed populations sustainably in controlled environments. Methane from plants can generate energy. By avoiding traditional transport, fossil fuel consumption is reduced. Artificial light is a drawback. Some techniques use movable racks and trays, but the main model will be tall multi-storey buildings in cities.",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Some food plants like 1. _______ are already grown indoors.", answer: "tomatoes", explanation: "The passage notes tomatoes are commonly grown inside greenhouses." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Vertical farms are situated in 2. _______.", answer: "urban centres", explanation: "They are designed to feed people in cities/urban centres." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Methane from crops can be recycled to produce 3. _______.", answer: "energy", explanation: "Methane is converted to electricity or energy." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "The need for 4. _______ is cut because tractors are unnecessary.", answer: "fossil fuels", explanation: "Fossil fuels usage declines due to no farm vehicles." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "A clear disadvantage is the need for 5. _______ light.", answer: "artificial", explanation: "They require artificial lighting." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Plants can be grown in movable 6. _______.", answer: "racks", explanation: "The text says plants are placed on movable racks or trays." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "The main form of vertical farms will be 7. _______.", answer: "multi-storey buildings", explanation: "The main model uses multi-storey buildings." },
          {
            questionNumber: 8,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Vertical farming is more expensive than traditional farming.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "The passage does not compare cost totals directly."
          },
          {
            questionNumber: 9,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Controlled environments protect crops from natural disasters.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "Controlled indoor settings shield crops from extreme weather."
          },
          {
            questionNumber: 10,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Vertical farming requires more land than outdoor farming.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "FALSE",
            explanation: "It stacks crops vertically, using far less land."
          },
          {
            questionNumber: 11,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "All vegetables can be grown using vertical farming techniques.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "The text doesn't claim *all* vegetables can be grown."
          },
          {
            questionNumber: 12,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Methane collection is too dangerous for commercial buildings.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "Danger levels of methane collection are not mentioned."
          },
          {
            questionNumber: 13,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Growing food inside cities reduces food transportation distances.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "Locating farms in cities puts them next to consumers, cutting logistics."
          }
        ]
      },
      {
        sectionOrder: 2,
        title: "Passage 2: The Falkirk Wheel",
        passageText: "The Falkirk Wheel in Scotland is the world's first rotating boat lift, restoring navigability between the Union Canal and the Forth & Clyde Canal.",
        questions: [
          {
            questionNumber: 14,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "The Falkirk Wheel was built to replace an existing flight of locks.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "It replaced a historic flight of 11 locks."
          }
        ]
      },
      {
        sectionOrder: 3,
        title: "Passage 3: Reducing the Effects of Climate Change",
        passageText: "Geo-engineering refers to large-scale intervention in the Earth’s climate system to counter global warming, using techniques like reflective aerosols or space mirrors.",
        questions: [
          {
            questionNumber: 27,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Geo-engineering projects are widely accepted as a permanent solution to climate change.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "FALSE",
            explanation: "They are controversial risk-management options, not permanent solutions."
          }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 2 Reading",
    description: "Reading Practice Test 2 from Cambridge IELTS 11",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Raising the Mary Rose",
        passageText: "On 19 July 1545, the Mary Rose, a Tudor warship, sank during a battle with the French. In 1982, the starboard half of the hull was successfully recovered from the Solent seabed in a major salvage operation.",
        questions: [
          {
            questionNumber: 1,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "The Mary Rose sank during a peaceful voyage.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "FALSE",
            explanation: "It sank during a battle with a French fleet."
          }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 3 Reading",
    description: "Reading Practice Test 3 from Cambridge IELTS 11",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: The Story of Silk",
        passageText: "Silk is a natural protein fiber produced by silkworms. Originating in ancient China, the secrets of sericulture were closely guarded for centuries before spreading along the Silk Road trade route.",
        questions: [
          {
            questionNumber: 1,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Silk production was kept a secret in China for a long time.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "China closely guarded the secret of sericulture for over 3,000 years."
          }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 4 Reading",
    description: "Reading Practice Test 4 from Cambridge IELTS 11",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Research using twins",
        passageText: "To biomedical researchers, twins provide a unique opportunity to study the effects of genetic heritage versus environmental influences (nature versus nurture).",
        questions: [
          {
            questionNumber: 1,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Identical twins share 100% of their genetic code.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "Identical twins develop from a single zygote and share all genes."
          }
        ]
      }
    ]
  }
];

const speakingExams = [
  {
    title: "Cambridge IELTS 11 Test 1 Speaking",
    description: "Speaking Practice Test 1 from Cambridge IELTS 11",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Introduction and Interview",
        passageText: "The examiner asks the candidate about him/herself, his/her home, work or studies and other familiar topics.\n\nTopic: Food and cooking\n• What sorts of food do you like eating most? [Why?]\n• Who normally does the cooking in your home? [Why/Why not?]\n• Do you watch cookery programmes on TV? [Why/Why not?]\n• In general, do you prefer eating out or eating at home? [Why?]",
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Part 2: Individual Long Turn (Cue Card)",
        passageText: "Describe a house/apartment that someone you know lives in.\n\nYou should say:\n• whose house/apartment this is\n• where the house/apartment is\n• what it looks like inside\n• and explain what you like or dislike about this person's house/apartment.\n\nYou will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
        questions: []
      },
      {
        sectionOrder: 3,
        title: "Part 3: Two-way Discussion",
        passageText: "The examiner and the candidate discuss more abstract issues related to the topic in Part 2.\n\nTopic 1: Different types of home\n• What kinds of home are most popular in your country? Why is this?\n• What do you think are the advantages of living in a house rather than an apartment?\n• Do you think that everyone would like to live in a larger home? Why is that?\n\nTopic 2: Finding a place to live\n• How easy is it to find a place to live in your country?\n• Do you think it's better to rent or to buy a place to live in? Why?\n• Do you agree that there is a right age for young adults to stop living with their parents? Why is that?",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 2 Speaking",
    description: "Speaking Practice Test 2 from Cambridge IELTS 11",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Introduction and Interview",
        passageText: "The examiner asks the candidate about him/herself, his/her home, work or studies and other familiar topics.\n\nTopic: Friends\n• How often do you go out with friends? [Why/Why not?]\n• Tell me about your best friend at school.\n• How friendly are you with your neighbours? [Why/Why not?]\n• Which is more important to you, friends or family? [Why?]",
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Part 2: Individual Long Turn (Cue Card)",
        passageText: "Describe a writer you would like to meet.\n\nYou should say:\n• who the writer is\n• what you know about this writer already\n• what you would like to find out about him/her\n• and explain why you would like to meet this writer.\n\nYou will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
        questions: []
      },
      {
        sectionOrder: 3,
        title: "Part 3: Two-way Discussion",
        passageText: "The examiner and the candidate discuss more abstract issues related to the topic in Part 2.\n\nTopic 1: Reading and children\n• What kinds of book are most popular with children in your country? Why do you think that is?\n• Why do you think some children do not read books very often?\n• How do you think children can be encouraged to read more?\n\nTopic 2: Reading for different purposes\n• Are there any occasions when reading at speed is a useful skill to have? What are they?\n• Are there any jobs where people need to read a lot? What are they?\n• Do you think that reading novels is more interesting than reading factual books? Why is that?",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 3 Speaking",
    description: "Speaking Practice Test 3 from Cambridge IELTS 11",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Introduction and Interview",
        passageText: "The examiner asks the candidate about him/herself, his/her home, work or studies and other familiar topics.\n\nTopic: Photographs\n• What type of photos do you like taking? [Why/Why not?]\n• What do you do with photos you take? [Why/Why not?]\n• When you visit other places, do you take photos or buy postcards? [Why/Why not?]\n• Do you like people taking photos of you? [Why/Why not?]",
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Part 2: Individual Long Turn (Cue Card)",
        passageText: "Describe a day when you thought the weather was perfect.\n\nYou should say:\n• where you were on this day\n• what the weather was like on this day\n• what you did during the day\n• and explain why you thought the weather was perfect on this day.\n\nYou will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
        questions: []
      },
      {
        sectionOrder: 3,
        title: "Part 3: Two-way Discussion",
        passageText: "The examiner and the candidate discuss more abstract issues related to the topic in Part 2.\n\nTopic 1: Types of weather\n• What types of weather do people in your country dislike most? Why is that?\n• What jobs can be affected by different weather conditions? Why?\n• Are there any important festivals in your country that celebrate a season or type of weather?\n\nTopic 2: Weather forecasts\n• How important do you think it is for everyone to check what the next day's weather will be? Why?\n• What is the best way to get accurate information about the weather?\n• How easy or difficult is it to predict the weather in your country? Why is that?",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 4 Speaking",
    description: "Speaking Practice Test 4 from Cambridge IELTS 11",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Introduction and Interview",
        passageText: "The examiner asks the candidate about him/herself, his/her home, work or studies and other familiar topics.\n\nTopic: Names\n• How did your parents choose your name(s)?\n• Does your name have any special meaning?\n• Is your name common or unusual in your country?\n• If you could change your name, would you? [Why/Why not?]",
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Part 2: Individual Long Turn (Cue Card)",
        passageText: "Describe a TV documentary you watched that was particularly interesting.\n\nYou should say:\n• what the documentary was about\n• why you decided to watch it\n• what you learnt during the documentary\n• and explain why the TV documentary was particularly interesting.\n\nYou will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
        questions: []
      },
      {
        sectionOrder: 3,
        title: "Part 3: Two-way Discussion",
        passageText: "The examiner and the candidate discuss more abstract issues related to the topic in Part 2.\n\nTopic 1: Different types of TV programmes\n• What are the most popular kinds of TV programmes in your country? Why is this?\n• Do you think there are too many game shows on TV nowadays? Why?\n• Do you think TV is the main way for people to get the news in your country? What other ways are there?\n\nTopic 2: TV advertising\n• What types of products are advertised most often on TV?\n• Do you think that people pay attention to adverts on TV? Why do you think that is?\n• How important are regulations on TV advertising? Why?",
        questions: []
      }
    ]
  }
];

const writingExams = [
  {
    title: "Cambridge IELTS 11 Test 1 Writing",
    description: "Writing Practice Test 1 from Cambridge IELTS 11",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Water Use by Region",
        passageText: "The charts below show the percentage of water used for different purposes in six areas of the world.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["/images/writing_t1_c11_t1.png"],
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Writing Task 2: Railways vs Roads",
        passageText: "Governments should spend money on railways rather than roads.\n\nTo what extent do you agree or disagree with this statement?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        images: ["/images/writing_t2_c11_t1.png"],
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 2 Writing",
    description: "Writing Practice Test 2 from Cambridge IELTS 11",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Language Ability of University Students",
        passageText: "The charts below show the proportions of British students at one university in England who were able to speak other languages in addition to English, in 2000 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["/images/writing_t1_c11_t2.png"],
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Writing Task 2: Waste Recycling Laws",
        passageText: "Some people claim that not enough of the waste from homes is recycled. They say that the only way to increase recycling is for governments to make it a legal requirement.\n\nTo what extent do you agree or disagree with this statement?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        images: ["/images/writing_t2_c11_t2.png"],
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 3 Writing",
    description: "Writing Practice Test 3 from Cambridge IELTS 11",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Carbon Dioxide Emissions",
        passageText: "The graph below shows average carbon dioxide (CO2) emissions per person in the United Kingdom, Sweden, Italy and Portugal between 1967 and 2007.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["/images/writing_t1_c11_t3.png"],
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Writing Task 2: Purpose of Learning Foreign Languages",
        passageText: "Some people say that the only reason for learning a foreign language is in order to travel to or work in a foreign country. Others say that these are not the only reasons why someone should learn a foreign language.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        images: ["/images/writing_t2_c11_t3.png"],
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 11 Test 4 Writing",
    description: "Writing Practice Test 4 from Cambridge IELTS 11",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Museum Visitors Survey",
        passageText: "The table below shows the numbers of visitors to Ashdown Museum during the year before and the year after it was refurbished. The charts show the results of surveys asking visitors how satisfied they were with their visit during the same two periods.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["/images/writing_t1_c11_t4.png"],
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Writing Task 2: Economic Progress vs Other Progress",
        passageText: "Many governments think that economic progress is their most important goal. Some people, however, think that other types of progress are equally important for a country.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        images: ["/images/writing_t2_c11_t4.png"],
        questions: []
      }
    ]
  }
];

async function main() {
  console.log("=== Starting Database Seeding of Cambridge IELTS 11 ===");

  const allExams = [
    ...listeningExams,
    ...readingExams,
    ...speakingExams,
    ...writingExams
  ];

  let successCount = 0;

  for (const examData of allExams) {
    // 1. Delete if exists to prevent duplicates and allow clean re-seeds
    const existing = await prisma.test.findFirst({
      where: {
        title: {
          equals: examData.title.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      console.log(`[-] Test "${examData.title}" already exists. Re-creating...`);
      await prisma.test.delete({
        where: { id: existing.id }
      });
    }

    // 2. Create the test with nested sections and questions
    try {
      console.log(`[+] Creating test: "${examData.title}"`);
      const test = await prisma.test.create({
        data: {
          title: examData.title.trim(),
          description: examData.description,
          type: examData.type,
          duration: examData.duration,
        }
      });

      for (const section of examData.sections) {
        const createdSection = await prisma.testSection.create({
          data: {
            testId: test.id,
            sectionOrder: section.sectionOrder,
            title: section.title,
            passageText: section.passageText,
            audioUrl: section.audioUrl || null,
            images: section.images || [],
          }
        });

        if (section.questions && section.questions.length > 0) {
          const questionsData = section.questions.map(q => ({
            sectionId: createdSection.id,
            questionNumber: q.questionNumber,
            type: q.type,
            content: q.content,
            options: q.options || null,
            answer: String(q.answer),
            explanation: q.explanation || null
          }));

          await prisma.question.createMany({
            data: questionsData
          });
        }
      }

      successCount++;
      console.log(`    Successfully created test with ID: ${test.id}`);
    } catch (err) {
      console.error(`    [ERROR] Failed to create test "${examData.title}":`, err.message);
    }
  }

  console.log("\n=== Seeding Summary ===");
  console.log(`Successfully seeded: ${successCount} / ${allExams.length} tests`);
  console.log("=======================");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
