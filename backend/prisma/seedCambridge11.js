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
    "title": "Cambridge IELTS 11 Test 1 Reading",
    "description": "Reading Practice Test 1 from Cambridge IELTS 11",
    "type": "READING",
    "duration": 60,
    "sections": [
      {
        "sectionOrder": 1,
        "title": "Passage 1: Crop-growing skyscrapers",
        "passageText": "You should spend about 20 minutes on\n\nQuestions\n\n1-13\n\nwhich are based on Reading Passage 1 below.\n\nCrop-growing skyscrapers\n\nBy the year 2050, nearly 80% of the Earth’s population will live in urban centres. Applying the most conservative estimates to current demographic trends, the human population will increase by about three billion people by then. An estimated 109 hectares of new land (about 20% larger than Brazil) will be needed to grow enough food to feed them, if traditional farming methods continue as they are practised today. At present, throughout the world, over 80% of the land that is suitable for raising crops is in use. Historically, some 15% of that has been laid waste by poor management practices. What can be done to ensure enough food for the world’s population to live on?\n\nThe concept of indoor farming is not new, since hothouse production of tomatoes and other produce has been in vogue for some time. What is new is the urgent need to scale up this technology to accommodate another three billion people. Many believe an entirely new approach to indoor farming is required, employing cutting-edge technologies. One such proposal is for the ‘Vertical Farm’. The concept is of multi-storey buildings in which food crops are grown in environmentally controlled conditions. Situated in the heart of urban centres, they would drastically reduce the amount of transportation required to bring food to consumers. Vertical farms would need to be efficient, cheap to construct and safe to operate. If successfully implemented, proponents claim, vertical farms offer the promise of urban renewal, sustainable production of a safe and varied food supply (through year-round production of all crops), and the eventual repair of ecosystems that have been sacrificed for horizontal farming.\n\nIt took humans 10,000 years to learn how to grow most of the crops we now take for granted. Along the way, we despoiled most of the land we worked, often turning verdant, natural ecozones into semi-arid deserts. Within that same time frame, we evolved into an urban species, in which 60% of the human population now lives vertically in cities. This means that, for the majority, we humans have shelter from the elements, yet we subject our food-bearing plants to the rigours of the great outdoors and can do no more than hope for a good weather year. However, more often than not now, due to a rapidly changing climate, that is not what happens. Massive floods, long droughts, hurricanes and severe monsoons take their toll each year, destroying millions of tons of valuable crops.\n\nThe supporters of vertical farming claim many potential advantages for the system. For instance, crops would be produced all year round, as they would be kept in artificially controlled, optimum growing conditions. There would be no weather-related crop failures due to droughts, floods or pests. All the food could be grown organically, eliminating the need for herbicides, pesticides and fertilisers. The system would greatly reduce the incidence of many infectious diseases that are acquired at the agricultural interface. Although the system would consume energy, it would return energy to the grid via methane generation from composting nonedible parts of plants. It would also dramatically reduce fossil fuel use, by cutting out the need for tractors, ploughs and shipping.\n\nA major drawback of vertical farming, however, is that the plants would require artificial light. Without it, those plants nearest the windows would be exposed to more sunlight and grow more quickly, reducing the efficiency of the system. Single-storey greenhouses have the benefit of natural overhead light; even so, many still need artificial lighting.\n\nA multi-storey facility with no natural overhead light would require far more. Generating enough light could be prohibitively expensive, unless cheap, renewable energy is available, and this appears to be rather a future aspiration than a likelihood for the near future.\n\nOne variation on vertical farming that has been developed is to grow plants in stacked trays that move on rails. Moving the trays allows the plants to get enough sunlight. This system is already in operation, and works well within a single-storey greenhouse with light reaching it from above: it Is not certain, however, that it can be made to work without that overhead natural light.\n\nVertical farming is an attempt to address the undoubted problems that we face in producing enough food for a growing population. At the moment, though, more needs to be done to reduce the detrimental impact it would have on the environment, particularly as regards the use of energy. While it is possible that much of our food will be grown in skyscrapers in future, most experts currently believe it is far more likely that we will simply use the space available on urban rooftops.",
        "questions": [
          {
            "questionNumber": 1,
            "type": "FILL_IN_BLANKS",
            "content": "1. Some food plants, including_______ are already grown indoors.",
            "options": [],
            "answer": "tomatoes",
            "explanation": "Refer to the passage above for question 1."
          },
          {
            "questionNumber": 2,
            "type": "FILL_IN_BLANKS",
            "content": "2. Vertical farms would be located in_______, meaning that there would be less need to take them long distances to customers.",
            "options": [],
            "answer": "urban centres/ centers",
            "explanation": "Refer to the passage above for question 2."
          },
          {
            "questionNumber": 3,
            "type": "FILL_IN_BLANKS",
            "content": "3. Vertical farms could use methane from plants and animals to produce_______..",
            "options": [],
            "answer": "energy",
            "explanation": "Refer to the passage above for question 3."
          },
          {
            "questionNumber": 4,
            "type": "FILL_IN_BLANKS",
            "content": "4. The consumption of_______… would be cut because agricultural vehicles would be unnecessary.",
            "options": [],
            "answer": "fossil fuel",
            "explanation": "Refer to the passage above for question 4."
          },
          {
            "questionNumber": 5,
            "type": "FILL_IN_BLANKS",
            "content": "5. The fact that vertical farms would need_______.. light is a disadvantage.",
            "options": [],
            "answer": "artificial",
            "explanation": "Refer to the passage above for question 5."
          },
          {
            "questionNumber": 6,
            "type": "FILL_IN_BLANKS",
            "content": "6. One form of vertical farming involves planting in_______.. which are not fixed.",
            "options": [],
            "answer": "(stacked) trays",
            "explanation": "Refer to the passage above for question 6."
          },
          {
            "questionNumber": 7,
            "type": "FILL_IN_BLANKS",
            "content": "7. The most probable development is that food will be grown on_______… in towns and cities.",
            "options": [],
            "answer": "(urban) rooftops",
            "explanation": "Refer to the passage above for question 7."
          },
          {
            "questionNumber": 8,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "8. Methods for predicting the Earth’s population have recently changed.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 8."
          },
          {
            "questionNumber": 9,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "9. Human beings are responsible for some of the destruction to food-producing land.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 9."
          },
          {
            "questionNumber": 10,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "10. The crops produced in vertical farms will depend on the season.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 10."
          },
          {
            "questionNumber": 11,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "11. Some damage to food crops is caused by climate change.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 11."
          },
          {
            "questionNumber": 12,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "12. Fertilisers will be needed for certain crops in vertical farms.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 12."
          },
          {
            "questionNumber": 13,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "13. Vertical farming will make plants less likely to be affected by infectious diseases.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 13."
          }
        ]
      },
      {
        "sectionOrder": 2,
        "title": "Passage 2: The Falkirk Wheel",
        "passageText": "You should spend about 20 minutes on Questions 14-26\n\nwhich are based on Reading Passage 2 below.\n\nThe Falkirk Wheel\n\nA unique engineering achievement\n\nThe Falkirk Wheel in Scotland is the world's first and only rotating boat lift. Opened in 2002, it is central to the ambitious £84.5m Millennium Link project to restore navigability across Scotland by reconnecting the historic waterways of the Forth & Clyde and Union Canals.\n\nThe major challenge of the project lays in the fact that the Forth & Clyde Canal is situated 35 metres below the level of the Union Canal. Historically, the two canals had been joined near the town of Falkirk by a sequence of 11 locks - enclosed sections of canal in which the water level could be raised or lowered - that stepped down across a distance of 1.5 km. This had been dismantled in 1933, thereby breaking the link. When the project was launched in 1994, the British Waterways authority were keen to create a dramatic twenty-first-century landmark which would not only be a fitting commemoration of the Millennium, but also a lasting symbol of the economic regeneration of the region.\n\nNumerous ideas were submitted for the project, including concepts ranging from rolling eggs to tilting tanks, from giant seesaws to overhead monorails. The eventual winner was a plan for the huge rotating steel boat lift which was to become The Falkirk Wheel. The unique shape of the structure is claimed to have been inspired by various sources, both manmade and natural, most notably a Celtic double headed axe, but also the vast turning propeller of a ship, the ribcage of a whale or the spine of a fish.\n\nThe various parts of The Falkirk Wheel were all constructed and assembled, like one giant toy building set, at Butterley Engineering's Steelworks in Derbyshire, some 400 km from Falkirk. A team there carefully assembled the 1,200 tonnes of steel, painstakingly fitting the pieces together to an accuracy of just 10 mm to ensure a perfect final fit. In the summer of 2001, the structure was then dismantled and transported on 35 lorries to Falkirk, before all being bolted back together again on the ground, and finally lifted into position in five large sections by crane. The Wheel would need to withstand immense and constantly changing stresses as it rotated, so to make the structure more robust, the steel sections were bolted rather than welded together. Over 45,000 bolt holes were matched with their bolts, and each bolt was hand-tightened.\n\nThe Wheel consists of two sets of opposing axe-shaped arms, attached about 25 metres apart to a fixed central spine. Two diametrically opposed water-filled 'gondolas', each with a capacity of 360,000 litres, are fitted between the ends of the arms. These gondolas always weigh the same, whether or not they are carrying boats. This is because, according to Archimedes' principle of displacement, floating objects displace their own weight in water. So when a boat enters a gondola, the amount of water leaving the gondola weighs exactly the same as the boat. This keeps the Wheel balanced and so, despite its enormous mass, it rotates through 180° in five and a half minutes while using very little power. It takes just 1.5 kilowatt-hours (5.4 MJ) of energy to rotate the Wheel -roughly the same as boiling eight small domestic kettles of water.\n\nBoats needing to be lifted up enter the canal basin at the level of the Forth & Clyde Canal and then enter the lower gondola of the Wheel. Two hydraulic steel gates are raised, so as to seal the gondola off from the water in the canal basin. The water between the gates is then pumped out. A hydraulic clamp, which prevents the arms of the Wheel moving while the gondola is docked, is removed, allowing the Wheel to turn. In the central machine room an array of ten hydraulic motors then begins to rotate the central axle. The axle connects to the outer arms of the Wheel, which begin to rotate at a speed of 1/8 of a revolution per minute. As the wheel rotates, the gondolas are kept in the upright position by a simple gearing system. Two eight-metre-wide cogs orbit a fixed inner cog of the same width, connected by two smaller cogs travelling in the opposite direction to the outer cogs - so ensuring that the gondolas always remain level. When the gondola reaches the top, the boat passes straight onto the aqueduct situated 24 metres above the canal basin.\n\nThe remaining 11 metres of lift needed to reach the Union Canal is achieved by means of a pair of locks. The Wheel could not be constructed to elevate boats over the full 35-metre difference between the two canals, owing to the presence of the historically important Antonine Wall, which was built by the Romans in the second century AD. Boats travel under this wall via a tunnel, then through the locks, and finally on to the Union Canal.",
        "questions": [
          {
            "questionNumber": 14,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "14. The Falkirk Wheel has linked the Forth & Clyde Canal with the Union Canal for the first time in their history.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 14."
          },
          {
            "questionNumber": 15,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "15. There was some opposition to the design of the Falkirk Wheel at first.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 15."
          },
          {
            "questionNumber": 16,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "16. The Falkirk Wheel was initially put together at the location where its components were manufactured.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 16."
          },
          {
            "questionNumber": 17,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "17. The Falkirk Wheel is the only boat lift in the world which has steel sections bolted together by hand.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 17."
          },
          {
            "questionNumber": 18,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "18. The weight of the gondolas varies according to the size of boat being carried.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 18."
          },
          {
            "questionNumber": 19,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "19. The construction of the Falkirk Wheel site took into account the presence of a nearby ancient monument.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 19."
          },
          {
            "questionNumber": 20,
            "type": "FILL_IN_BLANKS",
            "content": "20. _______",
            "options": [],
            "answer": "gates",
            "explanation": "Refer to the passage above for question 20."
          },
          {
            "questionNumber": 21,
            "type": "FILL_IN_BLANKS",
            "content": "21. _______",
            "options": [],
            "answer": "clamp",
            "explanation": "Refer to the passage above for question 21."
          },
          {
            "questionNumber": 22,
            "type": "FILL_IN_BLANKS",
            "content": "22. _______",
            "options": [],
            "answer": "axle",
            "explanation": "Refer to the passage above for question 22."
          },
          {
            "questionNumber": 23,
            "type": "FILL_IN_BLANKS",
            "content": "23. _______",
            "options": [],
            "answer": "cogs",
            "explanation": "Refer to the passage above for question 23."
          },
          {
            "questionNumber": 24,
            "type": "FILL_IN_BLANKS",
            "content": "24. _______",
            "options": [],
            "answer": "aqueduct",
            "explanation": "Refer to the passage above for question 24."
          },
          {
            "questionNumber": 25,
            "type": "FILL_IN_BLANKS",
            "content": "25. _______",
            "options": [],
            "answer": "wall",
            "explanation": "Refer to the passage above for question 25."
          },
          {
            "questionNumber": 26,
            "type": "FILL_IN_BLANKS",
            "content": "26. _______",
            "options": [],
            "answer": "locks",
            "explanation": "Refer to the passage above for question 26."
          }
        ]
      },
      {
        "sectionOrder": 3,
        "title": "Passage 3: Reducing the Effects of Climate Change",
        "passageText": "You should spend about 20 minutes on Questions 27-40\n\nwhich are based on Reading Passage 3 below.\n\nReducing the Effects of Climate Change\n\nMark Rowe reports on the increasingly ambitious geo-engineering projects being explored by scientists\n\nA\n\nSuch is our dependence on fossil fuels, and such is the volume of carbon dioxide already released into the atmosphere, that many experts agree that significant global warming is now inevitable. They believe that the best we can do is keep it at a reasonable level, and at present the only serious option for doing this is cutting back on our carbon emissions. But while a few countries are making major strides in this regard, the majority are having great difficulty even stemming the rate of increase, let alone reversing it. Consequently, an increasing number of scientists are beginning to explore the alternative of geo-engineering — a term which generally refers to the intentional large-scale manipulation of the environment. According to its proponents, geo-engineering is the equivalent of a backup generator: if Plan A - reducing our dependency on fossil fuels - fails, we require a Plan B, employing grand schemes to slow down or reverse the process of global warming.\n\nB\n\nGeo-engineering; has been shown to work, at least on a small localised scale. For decades, MayDay parades in Moscow have taken place under clear blue skies, aircraft having deposited dry ice, silver iodide and cement powder to disperse clouds. Many of the schemes now suggested look to do the opposite, and reduce the amount of sunlight reaching the planet. The most eye-catching idea of all is suggested by Professor Roger Angel of the University of Arizona. His scheme would employ up to 16 trillion minute spacecraft, each weighing about one gram, to form a transparent, sunlight-refracting sunshade in an orbit 1.5 million km above the Earth. This could, argues Angel, reduce the amount of light reaching the Earth by two per cent.\n\nC\n\nThe majority of geo-engineering projects so far carried out — which include planting forests in deserts and depositing iron in the ocean to stimulate the growth of algae - have focused on achieving a general cooling of the Earth. But some look specifically at reversing the melting at the poles, particularly the Arctic. The reasoning is that if you replenish the ice sheets and frozen waters of the high latitudes, more light will be reflected back into space, so reducing the warming of the oceans and atmosphere.\n\nD\n\nThe concept of releasing aerosol sprays into the stratosphere above the Arctic has been proposed by several scientists. This would involve using sulphur or hydrogen sulphide aerosols so that sulphur dioxide would form clouds, which would, in turn, lead to a global dimming. The idea is modelled on historic volcanic explosions, such as that of Mount Pinatubo in the Philippines in 1991, which led to a short-term cooling of global temperatures by 0.5 °C. Scientists have also scrutinised whether it's possible to preserve the ice sheets of Greenland with reinforced high-tension cables, preventing icebergs from moving into the sea. Meanwhile in the Russian Arctic, geo-engineering plans include the planting of millions of birch trees. Whereas the -regions native evergreen pines shade the snow an absorb radiation, birches would shed their leaves in winter, thus enabling radiation to be reflected by the snow. Re-routing Russian rivers to increase cold water flow to ice-forming areas could also be used to slow down warming, say some climate scientists.\n\nE\n\nBut will such schemes ever be implemented? Generally speaking, those who are most cautious about geo-engineering are the scientists involved in the research. Angel says that his plan is ‘no substitute for developing renewable energy: the only permanent solution'. And Dr Phil Rasch of the US-based Pacific Northwest National Laboratory is equally guarded about the role of geo-engineering: 'I think all of us agree that if we were to end geo-engineering on a given day, then the planet would return to its pre-engineered condition very rapidly, and probably within ten to twenty years. That’s certainly something to worry about.’\n\nF\n\nThe US National Center for Atmospheric Research has already suggested that the proposal to inject sulphur into the atmosphere might affect rainfall patterns across the tropics and the Southern Ocean. ‘Geo-engineering plans to inject stratospheric aerosols or to seed clouds would act to cool the planet, and act to increase the extent of sea ice,’ says Rasch. ‘But all the models suggest some impact on the distribution of precipitation.’\n\nG\n\n‘A further risk with geo-engineering projects is that you can “overshoot”,’ says Dr Dan Hunt, from the University of Bristol’s School of Geophysical Sciences, who has studied the likely impacts of the sunshade and aerosol schemes on the climate. ‘You may bring global temperatures back to pre-industrial levels, but the risk is that the poles will still be warmer than they should be and the tropics will be cooler than before industrialisation.’ To avoid such a scenario,” Hunt says, “Angel’s project would have to operate at half strength; all of which reinforces his view that the best option is to avoid the need for geo-engineering altogether.”\n\nH\n\nThe main reason why geo-engineering is supported by many in the scientific community is that most researchers have little faith in the ability of politicians to agree - and then bring in — the necessary carbon cuts. Even leading conservation organisations see the value of investigating the potential of geo-engineering. According to Dr Martin Sommerkorn, climate change advisor for the World Wildlife Fund’s International Arctic Programme, ‘Human-induced climate change has brought humanity to a position where we shouldn’t exclude thinking thoroughly about this topic and its possibilities.’",
        "questions": [
          {
            "questionNumber": 27,
            "type": "FILL_IN_BLANKS",
            "content": "27. _______ mention of a geo-engineering project based on an earlier natural phenomenon",
            "options": [],
            "answer": "D",
            "explanation": "Refer to the passage above for question 27."
          },
          {
            "questionNumber": 28,
            "type": "FILL_IN_BLANKS",
            "content": "28. _______ an example of a successful use of geo-engineering",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 28."
          },
          {
            "questionNumber": 29,
            "type": "FILL_IN_BLANKS",
            "content": "29. _______ a common definition of geo-engineering GEO-ENGINEERING PROJECTS Procedure Aim put a large number of tiny spacecraft into orbit far above Earth",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 29."
          },
          {
            "questionNumber": 30,
            "type": "FILL_IN_BLANKS",
            "content": "30. to create a 30 _______.. that would reduce the amount of light reaching Earth",
            "options": [],
            "answer": "sunshade",
            "explanation": "Refer to the passage above for question 30."
          },
          {
            "questionNumber": 31,
            "type": "FILL_IN_BLANKS",
            "content": "31. place 31 _______... in the sea",
            "options": [],
            "answer": "iron",
            "explanation": "Refer to the passage above for question 31."
          },
          {
            "questionNumber": 32,
            "type": "FILL_IN_BLANKS",
            "content": "32. to encourage 32 _______… to form release aerosol sprays into the stratosphere",
            "options": [],
            "answer": "algae",
            "explanation": "Refer to the passage above for question 32."
          },
          {
            "questionNumber": 33,
            "type": "FILL_IN_BLANKS",
            "content": "33. to create 33 _______…. that would reduce the amount of light reaching Earth",
            "options": [],
            "answer": "clouds",
            "explanation": "Refer to the passage above for question 33."
          },
          {
            "questionNumber": 34,
            "type": "FILL_IN_BLANKS",
            "content": "34. fix strong 34 _______… to Greenland ice sheets to prevent icebergs moving into the sea plant trees in Russian Arctic that would lose their leaves in winter",
            "options": [],
            "answer": "cables",
            "explanation": "Refer to the passage above for question 34."
          },
          {
            "questionNumber": 35,
            "type": "FILL_IN_BLANKS",
            "content": "35. to allow the 35 _______… to reflect radiation",
            "options": [],
            "answer": "snow",
            "explanation": "Refer to the passage above for question 35."
          },
          {
            "questionNumber": 36,
            "type": "FILL_IN_BLANKS",
            "content": "36. change the direction of 36 _______… to bring more cold water into ice-forming areas . A Roger Angel B Phil Rasch C Dan Lunt D Martin Sommerkorn",
            "options": [],
            "answer": "rivers",
            "explanation": "Refer to the passage above for question 36."
          },
          {
            "questionNumber": 37,
            "type": "FILL_IN_BLANKS",
            "content": "37. _______ The effects of geo-engineering may not be long-lasting.",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 37."
          },
          {
            "questionNumber": 38,
            "type": "FILL_IN_BLANKS",
            "content": "38. _______ Geo-engineering is a topic worth exploring.",
            "options": [],
            "answer": "D",
            "explanation": "Refer to the passage above for question 38."
          },
          {
            "questionNumber": 39,
            "type": "FILL_IN_BLANKS",
            "content": "39. _______ It may be necessary to limit the effectiveness of geo-engineering projects.",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 39."
          },
          {
            "questionNumber": 40,
            "type": "FILL_IN_BLANKS",
            "content": "40. _______ Research into non-fossil-based fuels cannot be replaced by geo-engineering. Cam 10 Reading Test 01 Cam 11 Reading Test 02",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 40."
          }
        ]
      }
    ]
  },
  {
    "title": "Cambridge IELTS 11 Test 2 Reading",
    "description": "Reading Practice Test 2 from Cambridge IELTS 11",
    "type": "READING",
    "duration": 60,
    "sections": [
      {
        "sectionOrder": 1,
        "title": "Passage 1: Raising the Mary Rose",
        "passageText": "You should spend about 20 minutes on\n\nQuestions\n\n1-13\n\nwhich are based on Reading Passage 1 below.\n\nRaising the Mary Rose\n\nHow a sixteenth-century warship was recovered from the seabed\n\nOn 19 July 1545, English and French fleets were engaged in a sea battle off the coast of southern England in the area of water called the Solent, between Portsmouth and the Isle of Wight. Among the English vessels was a warship by the name of Mary Rose\n\n. Built in Portsmouth some 35 years earlier, she had had a long and successful fighting career, and was a favourite of King Henry VIII. Accounts of what happened to the ship vary: while witnesses agree that she was not hit by the French, some maintain that she was outdated, overladen and sailing too low in the water, others that she was mishandled by undisciplined crew. What is undisputed, however, is that the Mary Rose\n\nsank into the Solent that day, taking at least 500 men with her. After the battle, attempts were made to recover the ship, but these failed.\n\nThe Mary Rose\n\ncame to rest on the seabed, lying on her starboard (right) side at an angle of approximately 60 degrees. The hull (the body of the ship) acted as a trap for the sand and mud carried by Solent currents. As a result, the starboard side filled rapidly, leaving the exposed port (left) side to be eroded by marine organisms and mechanical degradation. Because of the way the ship sank, nearly all of the starboard half survived intact. During the seventeenth and eighteenth centuries, the entire site became covered with a layer of hard grey clay, which minimised further erosion.\n\nThen, on 16 June 1836, some fishermen in the Solent found that their equipment was caught on an underwater obstruction, which turned out to be the Mary Rose\n\n. Diver John Deane happened to be exploring another sunken ship nearby, and the fishermen approached him, asking him to free their gear. Deane dived down, and found the equipment caught on a timber protruding slightly from the seabed. Exploring further, he uncovered several other timbers and a bronze gun. Deane continued diving on the site intermittently until 1840, recovering several more guns, two bows, various timbers, part of a pump and various other small finds.\n\nThe Mary Rose\n\nthen faded into obscurity for another hundred years. But in 1965, military historian and amateur diver Alexander McKee, in conjunction with the British Sub-Aqua Club, initiated a project called ‘Solent Ships’. While on paper this was a plan to examine a number of known wrecks in the Solent, what McKee really hoped for was to find the Mary Rose\n\n. Ordinary search techniques proved unsatisfactory, so McKee entered into collaboration with Harold E. Edgerton, professor of electrical engineering at the Massachusetts Institute of Technology. In 1967, Edgerton’s side-scan sonar systems revealed a large, unusually shaped object, which McKee believed was the Mary Rose\n\n.\n\nFurther excavations revealed stray pieces of timber and an iron gun. But the climax to the operation came when, on 5 May 1971, part of the ship’s frame was uncovered. McKee and his team now knew for certain that they had found the wreck, but were as yet unaware that it also housed a treasure trove of beautifully preserved artefacts. Interest ^ in the project grew, and in 1979, The Mary Rose Trust was formed, with Prince Charles as its President and Dr Margaret Rule its Archaeological Director. The decision whether or not to salvage the wreck was not an easy one, although an excavation in 1978 had shown that it might be possible to raise the hull. While the original aim was to raise the hull if at all feasible, the operation was not given the go-ahead until January 1982, when all the necessary information was available.\n\nAn important factor in trying to salvage the Mary Rose\n\nwas that the remaining hull was an open shell. This led to an important decision being taken: namely to carry out the lifting operation in three very distinct stages. The hull was attached to a lifting frame via a network of bolts and lifting wires. The problem of the hull being sucked back downwards into the mud was overcome by using 12 hydraulic jacks. These raised it a few centimetres over a period of several days, as the lifting frame rose slowly up its four legs. It was only when the hull was hanging freely from the lifting frame, clear of the seabed and the suction effect of the surrounding mud, that the salvage operation progressed to the second stage. In this stage, the lifting frame was fixed to a hook attached to a crane, and the hull was lifted completely clear of the seabed and transferred underwater into the lifting cradle. This required precise positioning to locate the legs into the stabbing guides’ of the lifting cradle. The lifting cradle was designed to fit the hull using archaeological survey drawings, and was fitted with air bags to provide additional cushioning for the hull’s delicate timber framework. The third and final stage was to lift the entire structure into the air, by which time the hull was also supported from below. Finally, on 11 October 1982, millions of people around the world held their breath as the timber skeleton of the Mary Rose was lifted clear of the water, ready to be returned home to Portsmouth.",
        "questions": [
          {
            "questionNumber": 1,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "1. There is some doubt about what caused the Mary Rose to sink.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 1."
          },
          {
            "questionNumber": 2,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "2. The Mary Rose was the only ship to sink in the battle of 19 July 1545.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 2."
          },
          {
            "questionNumber": 3,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "3. Most of one side of the Mary Rose lay undamaged under the sea.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 3."
          },
          {
            "questionNumber": 4,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "4. Alexander McKee knew that the wreck would contain many valuable historical objects. .",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 4."
          },
          {
            "questionNumber": 5,
            "type": "MULTIPLE_CHOICE",
            "content": "5. ",
            "options": [
              "A search for the Mary Rose was launched."
            ],
            "answer": "C",
            "explanation": "Refer to the passage above for question 5."
          },
          {
            "questionNumber": 6,
            "type": "FILL_IN_BLANKS",
            "content": "6. _______ One person’s exploration of the Mary Rose site stopped.",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 6."
          },
          {
            "questionNumber": 7,
            "type": "FILL_IN_BLANKS",
            "content": "7. _______ It was agreed that the hull of the Mary Rose should be raised.",
            "options": [],
            "answer": "G",
            "explanation": "Refer to the passage above for question 7."
          },
          {
            "questionNumber": 8,
            "type": "FILL_IN_BLANKS",
            "content": "8. _______ The site of the Mary Rose was found by chance. A 1836 E 1971 B 1840 F 1979 C 1965 G 1982 D 1967 Raising the hull of the Mary Rose : Stages one and two",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 8."
          },
          {
            "questionNumber": 9,
            "type": "FILL_IN_BLANKS",
            "content": "9. _______",
            "options": [],
            "answer": "(lifting) frame",
            "explanation": "Refer to the passage above for question 9."
          },
          {
            "questionNumber": 10,
            "type": "FILL_IN_BLANKS",
            "content": "10. _______",
            "options": [],
            "answer": "hydraulic jacks",
            "explanation": "Refer to the passage above for question 10."
          },
          {
            "questionNumber": 11,
            "type": "FILL_IN_BLANKS",
            "content": "11. _______",
            "options": [],
            "answer": "stabbing guides",
            "explanation": "Refer to the passage above for question 11."
          },
          {
            "questionNumber": 12,
            "type": "FILL_IN_BLANKS",
            "content": "12. _______",
            "options": [],
            "answer": "(lifting) cradle",
            "explanation": "Refer to the passage above for question 12."
          },
          {
            "questionNumber": 13,
            "type": "FILL_IN_BLANKS",
            "content": "13. _______",
            "options": [],
            "answer": "air bags",
            "explanation": "Refer to the passage above for question 13."
          }
        ]
      },
      {
        "sectionOrder": 2,
        "title": "Passage 2: What destroyed the civilisation of Easter Island?",
        "passageText": "You should spend about 20 minutes on Questions 14-26\n\nwhich are based on Reading Passage 2 below.\n\nWhat destroyed the civilisation of Easter Island?\n\nA\n\nEaster Island, or Rapu Nui as it is known locally, is home to several hundred ancient human statues - the moai. After this remote Pacific island was settled by the Polynesians, it remained isolated for centuries. All the energy and resources that went into the moai - some of which are ten metres tall and weigh over 7,000 kilos - came from the island itself. Yet when Dutch explorers landed in 1722, they met a Stone Age culture. The moai were carved with stone tools, then transported for many kilometres, without the use of animals or wheels, to massive stone platforms. The identity of the moai builders was in doubt until well into the twentieth century. Thor Heyerdahl, the Norwegian ethnographer and adventurer, thought the statues had been created by pre-Inca peoples from Peru. Bestselling Swiss author Erich von Daniken believed they were built by stranded extraterrestrials. Modern science - linguistic, archaeological and genetic evidence - has definitively proved the moai builders were Polynesians, but not how they moved their creations. Local folklore maintains that the statues walked, while researchers have tended to assume the ancestors dragged the statues somehow, using ropes and logs.\n\nB\n\nWhen the Europeans arrived, Rapa Nui was grassland, with only a few scrawny trees. In the 1970s and 1980s, though, researchers found pollen preserved in lake sediments, which proved the island had been covered in lush palm forests for thousands of years. Only after the Polynesians arrived did those forests disappear. US scientist Jared Diamond believes that the Rapanui people - descendants of Polynesian settlers - wrecked their own environment. They had unfortunately settled on an extremely fragile island - dry, cool, and too remote to be properly fertilised by windblown volcanic ash. When the islanders cleared the forests for firewood and farming, the forests didn’t grow back. As trees became scarce and they could no longer construct wooden canoes for fishing, they ate birds. Soil erosion decreased their crop yields. Before Europeans arrived, the Rapanui had descended into civil war and cannibalism, he maintains. The collapse of their isolated civilisation, Diamond writes, is a ’worst-case scenario for what may lie ahead of us in our own future’.\n\nC\n\nThe moai, he thinks, accelerated the self-destruction. Diamond interprets them as power displays by rival chieftains who, trapped on a remote little island, lacked other ways of asserting their dominance. They competed by building ever bigger figures. Diamond thinks they laid the moai on wooden sledges, hauled over log rails, but that required both a lot of wood and a lot of people. To feed the people, even more land had to be cleared. When the wood was gone and civil war began, the islanders began toppling the moai. By the nineteenth century none were standing.\n\nD\n\nArchaeologists Terry Hunt of the University of Hawaii and Carl Lipo of California State University agree that Easter Island lost its lush forests and that it was an ‘ecological catastrophe' - but they believe the islanders themselves weren’t to blame. And the moai certainly weren’t. Archaeological excavations indicate that the Rapanui went to heroic efforts to protect the resources of their wind-lashed, infertile fields. They built thousands of circular stone windbreaks and gardened inside them, and used broken volcanic rocks to keep the soil moist. In short, Hunt and Lipo argue, the prehistoric Rapanui were pioneers of sustainable farming.\n\nE\n\nHunt and Lipo contend that moai-building was an activity that helped keep the peace between islanders. They also believe that moving the moai required few people and no wood, because they were walked upright. On that issue, Hunt and Lipo say, archaeological evidence backs up Rapanui folklore. Recent experiments indicate that as few as 18 people could, with three strong ropes and a bit of practice, easily manoeuvre a 1,000 kg moai replica a few hundred metres. The figures’ fat bellies tilted them forward, and a D-shaped base allowed handlers to roll and rock them side to side.\n\nF\n\nMoreover, Hunt and Lipo are convinced that the settlers were not wholly responsible for the loss of the island’s trees. Archaeological finds of nuts from the extinct Easter Island palm show tiny grooves, made by the teeth of Polynesian rats. The rats arrived along with the settlers, and in just a few years, Hunt and Lipo calculate, they would have overrun the island. They would have prevented the reseeding of the slow-growing palm trees and thereby doomed Rapa Nui’s forest, even without the settlers’ campaign of deforestation. No doubt the rats ate birds’ eggs too. Hunt and Lipo also see no evidence that Rapanui civilisation collapsed when the palm forest did. They think its population grew rapidly and then remained more or less stable until the arrival of the Europeans, who introduced deadly diseases to which islanders had no immunity. Then in the nineteenth century slave traders decimated the population, which shrivelled to 111 people by 1877.\n\nG\n\nHunt and Lipo’s vision, therefore, is one of an island populated by peaceful and ingenious moai builders and careful stewards of the land, rather than by reckless destroyers ruining their own environment and society. ‘Rather than a case of abject failure, Rapu Nui is an unlikely story of success’, they claim. Whichever is the case, there are surely some valuable lessons which the world at large can learn from the story of Rapa Nui.",
        "questions": [
          {
            "questionNumber": 14,
            "type": "FILL_IN_BLANKS",
            "content": "14. _______ Paragraph A",
            "options": [],
            "answer": "ii",
            "explanation": "Refer to the passage above for question 14."
          },
          {
            "questionNumber": 15,
            "type": "FILL_IN_BLANKS",
            "content": "15. _______ Paragraph B",
            "options": [],
            "answer": "ix",
            "explanation": "Refer to the passage above for question 15."
          },
          {
            "questionNumber": 16,
            "type": "FILL_IN_BLANKS",
            "content": "16. _______ Paragraph C",
            "options": [],
            "answer": "viii",
            "explanation": "Refer to the passage above for question 16."
          },
          {
            "questionNumber": 17,
            "type": "FILL_IN_BLANKS",
            "content": "17. _______ Paragraph D",
            "options": [],
            "answer": "i",
            "explanation": "Refer to the passage above for question 17."
          },
          {
            "questionNumber": 18,
            "type": "FILL_IN_BLANKS",
            "content": "18. _______ Paragraph E",
            "options": [],
            "answer": "iv",
            "explanation": "Refer to the passage above for question 18."
          },
          {
            "questionNumber": 19,
            "type": "FILL_IN_BLANKS",
            "content": "19. _______ Paragraph F",
            "options": [],
            "answer": "vii",
            "explanation": "Refer to the passage above for question 19."
          },
          {
            "questionNumber": 20,
            "type": "FILL_IN_BLANKS",
            "content": "20. _______ Paragraph G Jared Diamond’s View",
            "options": [],
            "answer": "vi",
            "explanation": "Refer to the passage above for question 20."
          },
          {
            "questionNumber": 21,
            "type": "FILL_IN_BLANKS",
            "content": "Diamond believes that the Polynesian settlers on Rapa Nui destroyed its forests, cutting down its trees for fuel and clearing land for 21. _______",
            "options": [],
            "answer": "farming",
            "explanation": "Refer to the passage above for question 21."
          },
          {
            "questionNumber": 22,
            "type": "FILL_IN_BLANKS",
            "content": "22. _______…. Twentieth-century discoveries of pollen prove that Rapu Nui had once been covered in palm forests, which had turned into grassland by the time the Europeans arrived on the island. When the islanders were no longer able to build the 22",
            "options": [],
            "answer": "canoes",
            "explanation": "Refer to the passage above for question 22."
          },
          {
            "questionNumber": 23,
            "type": "FILL_IN_BLANKS",
            "content": "23. _______… they needed to go fishing, they began using the island’s 23",
            "options": [],
            "answer": "birds",
            "explanation": "Refer to the passage above for question 23."
          },
          {
            "questionNumber": 24,
            "type": "FILL_IN_BLANKS",
            "content": "24. _______….. as a food source, according to Diamond. Diamond also claims that the moai were built to show the power of the island’s chieftains, and that the methods of transporting the statues needed not only a great number of people, but also a great deal of 24 _______. letters, A-E .",
            "options": [],
            "answer": "wood",
            "explanation": "Refer to the passage above for question 24."
          },
          {
            "questionNumber": 25,
            "type": "FILL_IN_BLANKS",
            "content": "25. _______",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 25."
          },
          {
            "questionNumber": 26,
            "type": "FILL_IN_BLANKS",
            "content": "and 26. _______ On what points do Hunt and Lipo disagree with Diamond? A the period when the moai were created B how the moai were transported C the impact of the moai on Rapanui society D how the moai were carved E the origins of the people who made the moai",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 26."
          }
        ]
      },
      {
        "sectionOrder": 3,
        "title": "Passage 3: Neuroaesthetics",
        "passageText": "You should spend about 20 minutes on Questions 27-40\n\nwhich are based on Reading Passage 3 below.\n\nNeuroaesthetics\n\nAn emerging discipline called neuroaesthetics is seeking to bring scientific objectivity to the study of art, and has already given us a better understanding of many masterpieces. The blurred imagery of Impressionist paintings seems to stimulate the brain's amygdala, for instance. Since the amygdala plays a crucial role in our feelings, that finding might explain why many people find these pieces so moving.\n\nCould the same approach also shed light on abstract twentieth-century pieces, from Mondrian's geometrical blocks of colour, to Pollock's seemingly haphazard arrangements of splashed paint on canvas? Sceptics believe that people claim to like such works simply because they are famous. We certainly do have an inclination to follow the crowd. When asked to make simple perceptual decisions such as matching a shape to its rotated image, for example, people often choose a definitively wrong answer if they see others doing the same. It is easy to imagine that this mentality would have even more impact on a fuzzy concept like art appreciation, where there is no right or wrong answer.\n\nAngelina Hawley-Dolan, of Boston College, Massachusetts, responded to this debate by asking volunteers to view pairs of paintings - either the creations of famous abstract artists or the doodles of infants, chimps and elephants. They then had to judge which they preferred. A third of the paintings were given no captions, while many were labelled incorrectly -volunteers might think they were viewing a chimp's messy brushstrokes when they were actually seeing an acclaimed masterpiece. In each set of trials, volunteers generally preferred the work of renowned artists, even when they believed it was by an animal or a child. It seems that the viewer can sense the artist's vision in paintings, even if they can't explain why.\n\nRobert Pepperell, an artist based at Cardiff University, creates ambiguous works that are neither entirely abstract nor clearly representational. In one study, Pepperell and his collaborators asked volunteers to decide how'powerful'they considered an artwork to be, and whether they saw anything familiar in the piece. The longer they took to answer these questions, the more highly they rated the piece under scrutiny, and the greater their neural activity. It would seem that the brain sees these images as puzzles, and the harder it is to decipher the meaning, the more rewarding is the moment of recognition.\n\nAnd what about artists such as Mondrian, whose paintings consist exclusively of horizontal and vertical lines encasing blocks of colour? Mondrian's works are deceptively simple, but eye-tracking studies confirm that they are meticulously composed, and that simpiy rotating a piece radically changes the way we view it. With the originals, volunteers'eyes tended to stay longer on certain places in the image, but with the altered versions they would flit across a piece more rapidly. As a result, the volunteers considered the altered versions less pleasurable when they later rated the work.\n\nIn a similar study, Oshin Vartanian of Toronto University asked volunteers to compare original paintings with ones which he had altered by moving objects around within the frame. He found that almost everyone preferred the original, whether it was a Van Gogh still life or an abstract by Miro. Vartanian also found that changing the composition of the paintings reduced activation in those brain areas linked with meaning and interpretation.\n\nIn another experiment, Alex Forsythe of the University of Liverpool analysed the visual intricacy of different pieces of art, and her results suggest that many artists use a key level of detail to please the brain. Too little and the work is boring, but too much results in a kind of 'perceptual overload', according to Forsythe. What's more, appealing pieces both abstract and representational, show signs of 'fractals' - repeated motifs recurring in different scales, fractals are common throughout nature, for example in the shapes of mountain peaks or the branches of trees. It is possible that our visual system, which evolved in the great outdoors, finds it easier to process such patterns.\n\nIt is also intriguing that the brain appears to process movement when we see a handwritten letter, as if we are replaying the writer's moment of creation. This has led some to wonder whether Pollock's works feel so dynamic because the brain reconstructs the energetic actions the artist used as he painted. This may be down to our brain's 'mirror neurons', which are known to mimic others' actions. The hypothesis will need to be thoroughly tested, however. It might even be the case that we could use neuroaesthetic studies to understand the longevity of some pieces of artwork. While the fashions of the time might shape what is currently popular, works that are best adapted to our visual system may be the most likely to linger once the trends of previous generations have been forgotten.\n\nIt's still early days for the field of neuroaesthetics - and these studies are probably only a taste of what is to come. It would, however, be foolish to reduce art appreciation to a set of scientific laws. We shouldn't underestimate the importance of the style of a particular artist, their place in history and the artistic environment of their time. Abstract art offers both a challenge and the freedom to play with different interpretations. In some ways, it's not so different to science, where we are constantly looking for systems and decoding meaning so that we can view and appreciate the world in a new way.",
        "questions": [
          {
            "questionNumber": 27,
            "type": "FILL_IN_BLANKS",
            "content": "27. _______ A the subjective nature of art appreciation. B the reliance of modern art on abstract forms. C our tendency to be influenced by the opinions of others. D a common problem encountered when processing visual data.",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 27."
          },
          {
            "questionNumber": 28,
            "type": "FILL_IN_BLANKS",
            "content": "28. _______ Angelina Hawley-Dolan’s findings indicate that people A mostly favour works of art which they know well. B hold fixed ideas about what makes a good work of art. C are often misled by their initial expectations of a work of art. D have the ability to perceive the intention behind works of art.",
            "options": [],
            "answer": "D",
            "explanation": "Refer to the passage above for question 28."
          },
          {
            "questionNumber": 29,
            "type": "FILL_IN_BLANKS",
            "content": "29. _______ Results of studies involving Robert Pepperell’s pieces suggest that people A can appreciate a painting without fully understanding it. B find it satisfying to work out what a painting represents. C vary widely in the time they spend looking at paintings. D generally prefer representational art to abstract art.",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 29."
          },
          {
            "questionNumber": 30,
            "type": "FILL_IN_BLANKS",
            "content": "30. _______ What do the experiments described in the fifth paragraph suggest about the paintings of Mondrian? A They are more carefully put together than they appear. B They can be interpreted in a number of different ways. C They challenge our assumptions about shape and colour. D They are easier to appreciate than many other abstract works. , below. Art and the Brain",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 30."
          },
          {
            "questionNumber": 31,
            "type": "FILL_IN_BLANKS",
            "content": "The discipline of neuroaesthetics aims to bring scientific objectivity to the study of art. Neurological studies of the brain, for example, demonstrate the impact which Impressionist paintings have on our 31. _______",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 31."
          },
          {
            "questionNumber": 32,
            "type": "FILL_IN_BLANKS",
            "content": "32. _______…. Alex Forsythe of the University of Liverpool believes many artists give their works the precise degree of 32",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 32."
          },
          {
            "questionNumber": 33,
            "type": "FILL_IN_BLANKS",
            "content": "33. _______ which most appeals to the viewer’s brain. She also observes that pleasing works of art often contain certain repeated 33 _______ which occur frequently in the natural world. A interpretation B complexity C emotions D movements E skill F layout G concern H images",
            "options": [],
            "answer": "H",
            "explanation": "Refer to the passage above for question 33."
          },
          {
            "questionNumber": 34,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "34. Forsythe’s findings contradicted previous beliefs on the function of ‘fractals’ in art.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 34."
          },
          {
            "questionNumber": 35,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "35. Certain ideas regarding the link between ‘mirror neurons’ and art appreciation require further verification.",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "YES",
            "explanation": "Refer to the passage above for question 35."
          },
          {
            "questionNumber": 36,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "36. People’s taste in paintings depends entirely on the current artistic trends of the period.",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "NO",
            "explanation": "Refer to the passage above for question 36."
          },
          {
            "questionNumber": 37,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "37. Scientists should seek to define the precise rules which govern people’s reactions to works of art.",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "NO",
            "explanation": "Refer to the passage above for question 37."
          },
          {
            "questionNumber": 38,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "38. Art appreciation should always involve taking into consideration the cultural context in which an artist worked.",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "YES",
            "explanation": "Refer to the passage above for question 38."
          },
          {
            "questionNumber": 39,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "39. It is easier to find meaning in the field of science than in that of art.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 39."
          },
          {
            "questionNumber": 40,
            "type": "FILL_IN_BLANKS",
            "content": "Question 40. _______ , B , C or D .",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 40."
          }
        ]
      }
    ]
  },
  {
    "title": "Cambridge IELTS 11 Test 3 Reading",
    "description": "Reading Practice Test 3 from Cambridge IELTS 11",
    "type": "READING",
    "duration": 60,
    "sections": [
      {
        "sectionOrder": 1,
        "title": "Passage 1: The story of silk",
        "passageText": "You should spend about 20 minutes on\n\nQuestions\n\n1-13\n\nwhich are based on Reading Passage 1 below.\n\nThe story of silk\n\nThe history of the world’s most luxurious fabric, from ancient China to the present day\n\nSilk is a fine, smooth material produced from the cocoons - soft protective shells - that are made by mulberry silkworms (insect larvae). Legend has it that it was Lei Tzu, wife of the Yellow Emperor, ruler of China in about 3000 BC, who discovered silkworms. One account of the story goes that as she was taking a walk in her husband’s gardens, she discovered that silkworms were responsible for the destruction of several mulberry trees. She collected a number of cocoons and sat down to have a rest. It just so happened that while she was sipping some tea, one of the cocoons that she had collected landed in the hot tea and started to unravel into a fine thread. Lei Tzu found that she could wind this thread around her fingers. Subsequently, she persuaded her husband to allow her to rear silkworms on a grove of mulberry trees. She also devised a special reel to draw the fibres from the cocoon into a single thread so that they would be strong enough to be woven into fabric. While it is unknown just how much of this is true, it is certainly known that silk cultivation has existed in China for several millennia.\n\nOriginally, silkworm farming was solely restricted to women, and it was they who were responsible for the growing, harvesting and weaving. Silk quickly grew into a symbol of status, and originally, only royalty were entitled to have clothes made of silk. The rules were gradually relaxed over the years until finally during the Qing Dynasty (1644—1911 AD), even peasants, the lowest caste, were also entitled to wear silk. Sometime during the Han Dynasty (206 BC-220 AD), silk was so prized that it was also used as a unit of currency. Government officials were paid their salary in silk, and farmers paid their taxes in grain and silk. Silk was also used as diplomatic gifts by the emperor. Fishing lines, bowstrings, musical instruments and paper were all made using silk. The earliest indication of silk paper being used was discovered in the tomb of a noble who is estimated to have died around 168 AD.\n\nDemand for this exotic fabric eventually created the lucrative trade route now known as the Silk Road, taking silk westward and bringing gold, silver and wool to the East. It was named the Silk Road after its most precious commodity, which was considered to be worth more than gold. The Silk Road stretched over 6,000 kilometres from Eastern China to the Mediterranean Sea, following the Great Wall of China, climbing the Pamir mountain range, crossing modern-day Afghanistan and going on to the Middle East, with a major trading market in Damascus. From there, the merchandise was shipped across the Mediterranean Sea. Few merchants travelled the entire route; goods were handled mostly by a series of middlemen.\n\nWith the mulberry silkworm being native to China, the country was the world’s sole producer of silk for many hundreds of years. The secret of silk-making eventually reached the rest of the world via the Byzantine Empire, which ruled over the Mediterranean region of southern Europe, North Africa and the Middle East during the period 330—1453 AD. According to another legend, monks working for the Byzantine emperor Justinian smuggle silkworm eggs to Constantinople (Istanbul in modern-day Turkey) in 550 AD, concealed inside hollow bamboo walking canes. The Byzantines were as secretive as the Chinese, however, and for many centuries the weaving and trading of silk fabric was a strict imperial monopoly. Then in the seventh century, the Arabs conquered Persia, capturing their magnificent silks in the process.\n\nSilk production thus spread through Africa, Sicily and Spain as the Arabs swept, through these lands. Andalusia in southern Spain was Europe’s main silk-producing centre in the tenth century. By the thirteenth century, however, Italy had become Europe’s leader in silk production and export. Venetian merchants traded extensively in silk and encouraged silk growers to settle in Italy. Even now, silk processed in the province of Como in northern Italy enjoys an esteemed reputation.\n\nThe nineteenth century and industrialisation saw the downfall of the European silk industry. Cheaper Japanese silk, trade in which was greatly facilitated by the opening of the Suez Canal, was one of the many factors driving the trend. Then in the twentieth century, new manmade fibres, such as nylon, started to be used in what had traditionally been silk products, such as stockings and parachutes. The two world wars, which interrupted the supply of raw material from Japan, also stifled the European silk industry. After the Second World War, Japan’s silk production was restored, with improved production and quality of raw silk. Japan was to remain the world’s biggest producer of raw silk, and practically the only major exporter of raw silk, until the 1970s. However, in more recent decades, China has gradually recaptured its position as the world’s biggest producer and exporter of raw silk and silk yarn. Today, around 125,000 metric tons of silk are produced in the world, and almost two thirds of that production takes place in China.",
        "questions": [
          {
            "questionNumber": 1,
            "type": "FILL_IN_BLANKS",
            "content": "1. silkworm cocoon fell into emperor’s wife’s 1 _______",
            "options": [],
            "answer": "tea",
            "explanation": "Refer to the passage above for question 1."
          },
          {
            "questionNumber": 2,
            "type": "FILL_IN_BLANKS",
            "content": "2. emperor’s wife invented a 2 _______…. to pull out silk fibres •",
            "options": [],
            "answer": "reel",
            "explanation": "Refer to the passage above for question 2."
          },
          {
            "questionNumber": 3,
            "type": "FILL_IN_BLANKS",
            "content": "3. Only 3 _______ were allowed to produce silk •",
            "options": [],
            "answer": "women",
            "explanation": "Refer to the passage above for question 3."
          },
          {
            "questionNumber": 4,
            "type": "FILL_IN_BLANKS",
            "content": "4. Only 4 _______. were allowed to wear silk •",
            "options": [],
            "answer": "royalty",
            "explanation": "Refer to the passage above for question 4."
          },
          {
            "questionNumber": 5,
            "type": "FILL_IN_BLANKS",
            "content": "5. Silk used as a form of 5 _______. -  e.g. farmers’ taxes consisted partly of silk • Silk used for many purposes",
            "options": [],
            "answer": "currency",
            "explanation": "Refer to the passage above for question 5."
          },
          {
            "questionNumber": 6,
            "type": "FILL_IN_BLANKS",
            "content": "6. e.g. evidence found of 6 _______ made from silk around 168 AD Silk reaches rest of world •",
            "options": [],
            "answer": "paper",
            "explanation": "Refer to the passage above for question 6."
          },
          {
            "questionNumber": 7,
            "type": "FILL_IN_BLANKS",
            "content": "7. Merchants use Silk Road to take silk westward and bring back 7 _______….. and precious metals •",
            "options": [],
            "answer": "wool",
            "explanation": "Refer to the passage above for question 7."
          },
          {
            "questionNumber": 8,
            "type": "FILL_IN_BLANKS",
            "content": "8. 550 AD: 8 _______ hide silkworm eggs in canes and take them to Constantinople • Silk production spreads across Middle East and Europe •",
            "options": [],
            "answer": "monks",
            "explanation": "Refer to the passage above for question 8."
          },
          {
            "questionNumber": 9,
            "type": "FILL_IN_BLANKS",
            "content": "9. 20th century: 9 _______ and other manmade fibres cause decline in silk production",
            "options": [],
            "answer": "nylon",
            "explanation": "Refer to the passage above for question 9."
          },
          {
            "questionNumber": 10,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "10. Gold was the most valuable material transported along the Silk Road.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 10."
          },
          {
            "questionNumber": 11,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "11. Most tradesmen only went along certain sections of the Silk Road.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 11."
          },
          {
            "questionNumber": 12,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "12. The Byzantines spread the practice of silk production across the West.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 12."
          },
          {
            "questionNumber": 13,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "13. Silk yarn makes up the majority of silk currently exported from China.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 13."
          }
        ]
      },
      {
        "sectionOrder": 2,
        "title": "Passage 2: Great Migrations",
        "passageText": "You should spend about 20 minutes on Questions 14-26\n\nwhich are based on Reading Passage 2 below.\n\nGreat Migrations\n\nAnimal migration, however it is defined, is far more than just the movement of animals. It can loosely be described as travel that takes place at regular intervals - often in an annual cycle - that may involve many members of a species, and is rewarded only after a long journey. It suggests inherited instinct. The biologist Hugh Dingle has identified five characteristics that apply, in varying degrees and combinations, to all migrations. They are prolonged movements that carry animals outside familiar habitats; they tend to be linear, not zigzaggy; they involve special behaviours concerning preparation (such as overfeeding) and arrival; they demand special allocations of energy. And one more: migrating animals maintain an intense attentiveness to the greater mission, which keeps them undistracted by temptations and undeterred by challenges that would turn other animals aside.\n\nAn arctic tern, on its 20,000 km flight from the extreme south of South America to the Arctic circle, will take no notice of a nice smelly herring offered from a bird-watcher's boat along the way. While local gulls will dive voraciously for such handouts, the tern flies on. Why? The arctic tern resists distraction because it is driven at that moment by an instinctive sense of something we humans find admirable: larger purpose. In other words, it is determined to reach its destination. The bird senses that it can eat, rest and mate later. Right now it is totally focused on the journey; its undivided intent is arrival.\n\nReaching some gravelly coastline in the Arctic, upon which other arctic terns have converged, will serve its larger purpose as shaped by evolution: finding a place, a time, and a set of circumstances in which it can successfully hatch and rear offspring.\n\nBut migration is a complex issue, and biologists define it differently, depending in part on what sorts of animals they study. Joe! Berger, of the University of Montana, who works on the American pronghorn and other large terrestrial mammals, prefers what he calls a simple, practical definition suited to his beasts: 'movements from a seasonal home area away to another home area and back again'. Generally the reason for such seasonal back-and-forth movement is to seek resources that aren't available within a single area year-round.\n\nBut daily vertical movements by zooplankton in the ocean - upward by night to seek food, downward by day to escape predators - can also be considered migration. So can the movement of aphids when, having depleted the young leaves on one food plant, their offspring then fly onward to a different host plant, with no one aphid ever returning to where it started.\n\nDingle is an evolutionary biologist who studies insects. His definition is more intricate than Berger's, citing those five features that distinguish migration from other forms of movement. They allow for the fact that, for example, aphids will become sensitive to blue light (from the sky) when it's time for takeoff on their big journey, and sensitive to yellow light (reflected from tender young leaves) when it's appropriate to land. Birds will fatten themselves with heavy feeding in advance of a long migrational flight. The value of his definition, Dingle argues, is that it focuses attention on what the phenomenon of wildebeest migration shares with the phenomenon of the aphids, and therefore helps guide researchers towards understanding how evolution has produced them all.\n\nHuman behaviour, however, is having a detrimental impact on animal migration. The pronghorn, which resembles an antelope, though they are unrelated, is the fastest land mammal of the New World. One population, which spends the summer in the mountainous Grand Teton National Park of the western USA, follows a narrow route from its summer range in the mountains, across a river, and down onto the plains. Here they wait out the frozen months, feeding mainly on sagebrush blown clear of snow. These pronghorn are notable for the invariance of their migration route and the severity of its constriction at three bottlenecks. If they can't pass through each of the three during their spring migration, they can't reach their bounty of summer grazing; if they can't pass through again in autumn, escaping south onto those windblown plains, they are likely to die trying to overwinter in the deep snow. Pronghorn, dependent on distance vision and speed to keep safe from predators, traverse high, open shoulders of land, where they can see and run. At one of the bottlenecks, forested hills rise to form a V, leaving a corridor of open ground only about 150 metres wide, filled with private homes. Increasing development is leading toward a crisis for the pronghorn, threatening to choke off their passageway.\n\nConservation scientists, along with some biologists and land managers within the USA's National Park Service and other agencies, are now working to preserve migrational behaviours, not just species and habitats. A National Forest has recognised the path of the pronghorn, much of which passes across its land, as a protected migration corridor. But neither the Forest Service nor the Park Service can control what happens on private land at a bottleneck. And with certain other migrating species, the challenge is complicated further - by vastly greater distances traversed, more jurisdictions, more borders, more dangers along the way. We will require wisdom and resoluteness to ensure that migrating species can continue their journeying a while longer.",
        "questions": [
          {
            "questionNumber": 14,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "14. Local gulls and migrating arctic terns behave in the same way when offered food.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 14."
          },
          {
            "questionNumber": 15,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "15. Experts’ definitions of migration tend to vary according to their area of study.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 15."
          },
          {
            "questionNumber": 16,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "16. Very few experts agree that the movement of aphids can be considered migration.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 16."
          },
          {
            "questionNumber": 17,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "17. Aphids’ journeys are affected by changes in the light that they perceive.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 17."
          },
          {
            "questionNumber": 18,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "18. Dingles aim is to distinguish between the migratory behaviours of different species. Complete each sentence with the correct ending, A-G , below.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 18."
          },
          {
            "questionNumber": 19,
            "type": "FILL_IN_BLANKS",
            "content": "19. _______ According to Dingle, migratory routes are likely to",
            "options": [],
            "answer": "G",
            "explanation": "Refer to the passage above for question 19."
          },
          {
            "questionNumber": 20,
            "type": "FILL_IN_BLANKS",
            "content": "20. _______ To prepare for migration, animals are likely to",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 20."
          },
          {
            "questionNumber": 21,
            "type": "FILL_IN_BLANKS",
            "content": "21. _______ During migration, animals are unlikely to",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 21."
          },
          {
            "questionNumber": 22,
            "type": "FILL_IN_BLANKS",
            "content": "22. _______ Arctic terns illustrate migrating animals’ ability to A be discouraged by difficulties. B travel on open land where they can look out for predators. C eat more than they need for immediate purposes. D be repeated daily. E ignore distractions. F be governed by the availability of water. G follow a straight line. The migration of pronghorns",
            "options": [],
            "answer": "E",
            "explanation": "Refer to the passage above for question 22."
          },
          {
            "questionNumber": 23,
            "type": "FILL_IN_BLANKS",
            "content": "Pronghorns rely on their eyesight and 23. _______",
            "options": [],
            "answer": "speed",
            "explanation": "Refer to the passage above for question 23."
          },
          {
            "questionNumber": 24,
            "type": "FILL_IN_BLANKS",
            "content": "24. _______…. to avoid predators. One particular population’s summer habitat is a national park, and their winter home is on the 24",
            "options": [],
            "answer": "plains",
            "explanation": "Refer to the passage above for question 24."
          },
          {
            "questionNumber": 25,
            "type": "FILL_IN_BLANKS",
            "content": "25. _______ where they go to avoid the danger presented by the snow at that time of year. However, their route between these two areas contains three 25",
            "options": [],
            "answer": "bottlenecks",
            "explanation": "Refer to the passage above for question 25."
          },
          {
            "questionNumber": 26,
            "type": "FILL_IN_BLANKS",
            "content": "26. _______ One problem is the construction of new homes in a narrow 26 _______ of land on the pronghorns’ route.",
            "options": [],
            "answer": "corridor/ passageway",
            "explanation": "Refer to the passage above for question 26."
          }
        ]
      },
      {
        "sectionOrder": 3,
        "title": "Passage 3: Preface to ‘How the other half thinks:",
        "passageText": "You should spend about 20 minutes on Questions 27-40\n\nwhich are based on Reading Passage 3 below.\n\nPreface to ‘How the other half thinks:\n\nAdventures in mathematical reasoning’\n\nA\n\nOccasionally, in some difficult musical compositions, there are beautiful, but easy parts - parts so simple a beginner could play them. So it is with mathematics as well. There are some discoveries in advanced mathematics that do not depend on specialized knowledge, not even on algebra, geometry, or trigonometry. Instead they may involve, at most, a little arithmetic, such as ‘the sum of two odd numbers is even’, and common sense. Each of the eight chapters in this book illustrates this phenomenon. Anyone can understand every step in the reasoning.\n\nThe thinking in each chapter uses at most only elementary arithmetic, and sometimes not even that. Thus all readers will have the chance to participate in a mathematical experience, to appreciate the beauty of mathematics, and to become familiar with its logical, yet intuitive, style of thinking.\n\nB\n\nOne of my purposes in writing this book is to give readers who haven’t had the opportunity to see and enjoy real mathematics the chance to appreciate the mathematical way of thinking. I want to reveal not only some of the fascinating discoveries, but, more importantly, the reasoning behind them.\n\nIn that respect, this book differs from most books on mathematics written for the general public. Some present the lives of colorful mathematicians. Others describe important applications of mathematics. Yet others go into mathematical procedures, but assume that the reader is adept in using algebra.\n\nC\n\nI hope this book will help bridge that notorious gap that separates the two cultures: the humanities and the sciences, or should I say the right brain (intuitive) and the left brain (analytical, numerical). As the chapters will illustrate, mathematics is not restricted to the analytical and numerical; intuition plays a significant role. The alleged gap can be narrowed or completely overcome by anyone, in part because each of us is far from using the full capacity of either side of the brain. To illustrate our human potential, I cite a structural engineer who is an artist, an electrical engineer who is an opera singer, an opera singer who published mathematical research, and a mathematician who publishes short stories.\n\nD\n\nOther scientists have written books to explain their fields to non-scientists, but have necessarily had to omit the mathematics, although it provides the foundation of their theories. The reader must remain a tantalized spectator rather than an involved participant, since the appropriate language for describing the details in much of science is mathematics, whether the subject is expanding universe, subatomic particles, or chromosomes. Though the broad outline of a scientific theory can be sketched intuitively, when a part of the physical universe is finally understood, its description often looks like a page in a mathematics text.\n\nE\n\nStill, the non-mathematical reader can go far in understanding mathematical reasoning. This book presents the details that illustrate the mathematical style of thinking, which involves sustained, step-by-step analysis, experiments, and insights. You will turn these pages much more slowly than when reading a novel or a newspaper. It may help to have a pencil and paper ready to check claims and carry out experiments.\n\nF\n\nAs I wrote, I kept in mind two types of readers: those who enjoyed mathematics until they were turned off by an unpleasant episode, usually around fifth grade, and mathematics aficionados, who will find much that is new throughout the book.\n\nThis book also serves readers who simply want to sharpen their analytical skills. Many careers, such as law and medicine, require extended, precise analysis. Each chapter offers practice in following a sustained and closely argued line of thought. That mathematics can develop this skill is shown by these two testimonials:\n\nG\n\nA physician wrote, ‘The discipline of analytical thought processes [in mathematics] prepared me extremely well for medical school. In medicine one is faced with a problem which must be thoroughly analyzed before a solution can be found. The process is similar to doing mathematics.’\n\nA lawyer made the same point, “Although I had no background in law - not even one political science course — I did well at one of the best law schools. I attribute much of my success there to having learned, through the study of mathematics, and, in particular, theorems, how to analyze complicated principles. Lawyers who have studied mathematics can master the legal principles in a way that most others cannot.’\n\nI hope you will share my delight in watching as simple, even naive, questions lead to remarkable solutions and purely theoretical discoveries find unanticipated applications.",
        "questions": [
          {
            "questionNumber": 27,
            "type": "FILL_IN_BLANKS",
            "content": "27. _______ a reference to books that assume a lack of mathematical knowledge",
            "options": [],
            "answer": "D",
            "explanation": "Refer to the passage above for question 27."
          },
          {
            "questionNumber": 28,
            "type": "FILL_IN_BLANKS",
            "content": "28. _______ the way in which this is not a typical book about mathematics",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 28."
          },
          {
            "questionNumber": 29,
            "type": "FILL_IN_BLANKS",
            "content": "29. _______ personal examples of being helped by mathematics",
            "options": [],
            "answer": "G",
            "explanation": "Refer to the passage above for question 29."
          },
          {
            "questionNumber": 30,
            "type": "FILL_IN_BLANKS",
            "content": "30. _______ examples of people who each had abilities that seemed incompatible",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 30."
          },
          {
            "questionNumber": 31,
            "type": "FILL_IN_BLANKS",
            "content": "31. _______ mention of different focuses of books about mathematics",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 31."
          },
          {
            "questionNumber": 32,
            "type": "FILL_IN_BLANKS",
            "content": "32. _______ a contrast between reading this book and reading other kinds of publication",
            "options": [],
            "answer": "E",
            "explanation": "Refer to the passage above for question 32."
          },
          {
            "questionNumber": 33,
            "type": "FILL_IN_BLANKS",
            "content": "33. _______ a claim that the whole of the book is accessible to everybody",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 33."
          },
          {
            "questionNumber": 34,
            "type": "FILL_IN_BLANKS",
            "content": "34. _______ a reference to different categories of intended readers of this book",
            "options": [],
            "answer": "F",
            "explanation": "Refer to the passage above for question 34."
          },
          {
            "questionNumber": 35,
            "type": "FILL_IN_BLANKS",
            "content": "35. Some areas of both music and mathematics are suitable for someone who is a_______",
            "options": [],
            "answer": "beginner",
            "explanation": "Refer to the passage above for question 35."
          },
          {
            "questionNumber": 36,
            "type": "FILL_IN_BLANKS",
            "content": "36. _______ ",
            "options": [],
            "answer": "arithmetic",
            "explanation": "Refer to the passage above for question 36."
          },
          {
            "questionNumber": 37,
            "type": "FILL_IN_BLANKS",
            "content": "37. _______ ",
            "options": [],
            "answer": "intuitive",
            "explanation": "Refer to the passage above for question 37."
          },
          {
            "questionNumber": 38,
            "type": "FILL_IN_BLANKS",
            "content": "38. Some books written by_______. have had to leave out the mathematics that is central to their theories.",
            "options": [],
            "answer": "scientists",
            "explanation": "Refer to the passage above for question 38."
          },
          {
            "questionNumber": 39,
            "type": "FILL_IN_BLANKS",
            "content": "39. _______ ",
            "options": [],
            "answer": "experiments",
            "explanation": "Refer to the passage above for question 39."
          },
          {
            "questionNumber": 40,
            "type": "MULTIPLE_CHOICE",
            "content": "40. ",
            "options": [
              "A lawyer found that studying………………. helped even more than other areas of mathematics in the study of law."
            ],
            "answer": "theorems",
            "explanation": "Refer to the passage above for question 40."
          }
        ]
      }
    ]
  },
  {
    "title": "Cambridge IELTS 11 Test 4 Reading",
    "description": "Reading Practice Test 4 from Cambridge IELTS 11",
    "type": "READING",
    "duration": 60,
    "sections": [
      {
        "sectionOrder": 1,
        "title": "Passage 1: Research using twins",
        "passageText": "You should spend about 20 minutes on\n\nQuestions\n\n1-13\n\nwhich are based on Reading Passage 1 below.\n\nResearch using twins\n\nTo biomedical researchers all over the world, twins offer a precious opportunity to untangle the influence of genes and the environment - of nature and nurture. Because identical twins come from a single fertilized egg that splits into two, they share virtually the same genetic code. Any differences between them -one twin having younger looking skin, for example - must be due to environmental factors such as less time spent in the sun.\n\nAlternatively, by comparing the experiences of identical twins with those of fraternal twins, who come from separate eggs and share on average half their DNA, researchers can quantify the extent to which our genes affect our lives. If identical twins are more similar to each other with respect to an ailment than fraternal twins are, then vulnerability to the disease must be rooted at least in part in heredity.\n\nThese two lines of research - studying the differences between identical twins to pinpoint the influence of environment, and comparing identical twins with fraternal ones to measure the role of inheritance - have been crucial to understanding the interplay of nature and nurture in determining our personalities, behavior, and vulnerability to disease.\n\nThe idea of using twins to measure the influence of heredity dates back to 1875, when the English scientist Francis Galton first suggested the approach (and coined the phrase 'nature and nurture'). But twin studies took a surprising twist in the 1980s, with the arrival of studies into identical twins who had been separated at birth and reunited as adults. Over two decades 137 sets of twins eventually visited Thomas Bouchard's lab in what became known as the Minnesota Study of Twins Reared Apart. Numerous tests were carried out on the twins, and they were each asked more than 15,000 questions.\n\nBouchard and his colleagues used this mountain of data to identify how far twins were affected by their genetic makeup. The key to their approach was a statistical concept called heritability. in broad terms, the heritability of a trait measures the extent to which differences among members of a population can be explained by differences in their genetics. And wherever Bouchard and other scientists looked, it seemed, they found the invisible hand of genetic influence helping to shape our lives.\n\nLately, however, twin studies have helped lead scientists to a radical new conclusion: that nature and nurture are not the only elemental forces at work. According to a recent field called epigenetics, there is a third factor also in play, one that in some cases serves as a bridge between the environment and our genes, and in others operates on its own to shape who we are.\n\nEpigenetic processes are chemical reactions tied to neither nature nor nurture but representing what researchers have called a 'third component'. These reactions influence how our genetic code is expressed: how each gene is strengthened or weakened, even turned on or off, to build our bones, brains and all the other parts of our bodies.\n\nIf you think of our DNA as an immense piano keyboard and our genes as the keys - each key symbolizing a segment of DNA responsible for a particular note, or trait, and all the keys combining to make us who we are - then epigenetic processes determine when and how each key can be struck, changing the tune being played.\n\nOne way the study of epigenetics is revolutionizing our understanding of biology is by revealing a mechanism by which the environment directly impacts on genes. Studies of animals, for example, have shown that when a rat experiences stress during pregnancy, it can cause epigenetic changes in a fetus that lead to behavioral problems as the rodent grows up. Other epigenetic processes appear to occur randomly, while others are normal, such as those that guide embryonic cells as they become heart, brain, or liver cells, for example.\n\nGeneticist Danielle Reed has worked with many twins over the years and thought deeply about what twin studies have taught us. 'It's very clear when you look at twins that much of what they share is hardwired,' she says. 'Many things about them are absolutely the same and unalterable. But it's also clear, when you get to know them, that other things about them are different. Epigenetics is the origin of a lot of those differences, in my view.'\n\nReed credits Thomas Bouchard's work for today's surge in twin studies. 'He was the trailblazer,' she says. 'We forget that 50 years ago things like heart disease were thought to be caused entirely by lifestyle. Schizophrenia was thought to be due to poor mothering. Twin studies have allowed us to be more reflective about what people are actually born with and what's caused by experience.'\n\nHaving said that, Reed adds, the latest work in epigenetics promises to take our understanding even further. 'What I like to say is that nature writes some things in pencil and some things in pen,' she says. 'Things written in pen you can't change. That's DNA. But things written in pencil you can. That's epigenetics. Now that we're actually able to look at the DNA and see where the pencil writings are, it's sort of a whole new world.'",
        "questions": [
          {
            "questionNumber": 1,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "1. There may be genetic causes for the differences in how young the skin of identical twins looks.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 1."
          },
          {
            "questionNumber": 2,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "2. Twins are at greater risk of developing certain illnesses than non-twins.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 2."
          },
          {
            "questionNumber": 3,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "3. Bouchard advertised in newspapers for twins who had been separated at birth.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 3."
          },
          {
            "questionNumber": 4,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "4. Epigenetic processes are different from both genetic and environmental processes. , B or C . , B or C NB You may use any letter more than once. A Francis Galton B Thomas Bouchard C Danielie Reed",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 4."
          },
          {
            "questionNumber": 5,
            "type": "FILL_IN_BLANKS",
            "content": "5. _______ invented a term used to distinguish two factors affecting human characteristics",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 5."
          },
          {
            "questionNumber": 6,
            "type": "FILL_IN_BLANKS",
            "content": "6. _______ expressed the view that the study of epigenetics will increase our knowledge",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 6."
          },
          {
            "questionNumber": 7,
            "type": "FILL_IN_BLANKS",
            "content": "7. _______ developed a mathematical method of measuring genetic influences",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 7."
          },
          {
            "questionNumber": 8,
            "type": "FILL_IN_BLANKS",
            "content": "8. _______ pioneered research into genetics using twins",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 8."
          },
          {
            "questionNumber": 9,
            "type": "FILL_IN_BLANKS",
            "content": "9. _______ carried out research into twins who had lived apart , below. Epigenetic processes",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 9."
          },
          {
            "questionNumber": 10,
            "type": "FILL_IN_BLANKS",
            "content": "In epigenetic processes, 10. _______",
            "options": [],
            "answer": "D",
            "explanation": "Refer to the passage above for question 10."
          },
          {
            "questionNumber": 11,
            "type": "FILL_IN_BLANKS",
            "content": "11. _______…. influence the activity of our genes, for example in creating our internal 11",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 11."
          },
          {
            "questionNumber": 12,
            "type": "FILL_IN_BLANKS",
            "content": "12. _______.. The study of epigenetic processes is uncovering a way in which our genes can be affected by our 12",
            "options": [],
            "answer": "E",
            "explanation": "Refer to the passage above for question 12."
          },
          {
            "questionNumber": 13,
            "type": "FILL_IN_BLANKS",
            "content": "13. _______…. One example is that if a pregnant rat suffers stress, the new-born rat may later show problems in its 13 _______. A nurture B organs C code D chemicals E environment F behaviour/behavior",
            "options": [],
            "answer": "F",
            "explanation": "Refer to the passage above for question 13."
          }
        ]
      },
      {
        "sectionOrder": 2,
        "title": "Passage 2: An Introduction to Film Sound",
        "passageText": "You should spend about 20 minutes on Questions 14-26\n\nwhich are based on Reading Passage 2 below.\n\nAn Introduction to Film Sound\n\nThough we might think of film as an essentially visual experience, we really cannot afford to underestimate the importance of film sound. A meaningful sound track is often as complicated as the image on the screen, and is ultimately just as much the responsibility of the director. The entire sound track consists of three essential ingredients: the human voice, sound effects and music. These three tracks must be mixed and balanced so as to produce the necessary emphases which in turn create desired effects. Topics which essentially refer to the three previously mentioned tracks are discussed below. They include dialogue, synchronous and asynchronous sound effects, and music.\n\nLet us start with dialogue. As is the case with stage drama, dialogue serves to tell the story and expresses feelings and motivations of characters as well. Often with film characterization the audience perceives little or no difference between the character and the actor. Thus, for example, the actor Humphrey Bogart is the character Sam Spade; film personality and life personality seem to merge. Perhaps this is because the very texture of a performer's voice supplies an element of character.\n\nWhen voice textures fit the performer's physiognomy and gestures, a whole and very realistic persona emerges. The viewer sees not an actor working at his craft, but another human being struggling with life. It is interesting to note that how dialogue is used and the very amount of dialogue used varies widely among films. For example, in the highly successful science-fiction film 2001, little dialogue was evident, and most of it was banal and of little intrinsic interest. In this way the film-maker was able to portray what Thomas Sobochack and Vivian Sobochack call, in An Introduction to Film\n\n, the 'inadequacy of human responses when compared with the magnificent technology created by man and the visual beauties of the universe'.\n\nThe comedy Bringing Up Baby\n\n, on the other hand, presents practically non-stop dialogue delivered at breakneck speed. This use of dialogue underscores not only the dizzy quality of the character played by Katherine Hepburn, but also the absurdity of the film itself and thus its humor. The audience is bounced from gag to gag and conversation to conversation; there is no time for audience reflection. The audience is caught up in a whirlwind of activity in simply managing to follow the plot. This film presents pure escapism - largely due to its frenetic dialogue.\n\nSynchronous sound effects are those sounds which are synchronized or matched with what is viewed. For example, if the film portrays a character playing the piano, the sounds of the piano are projected. Synchronous sounds contribute to the realism of film and also help to create a particular atmosphere. For example, the 'click' of a door being opened may simply serve to convince the audience that the image portrayed is real, and the audience may only subconsciously note the expected sound. However, if the 'click' of an opening door is part of an ominous action such as a burglary, the sound mixer may call attention to the 'click' with an increase in volume; this helps to engage the audience in a moment of suspense.\n\nAsynchronous sound effects, on the other hand, are not matched with a visible source of the sound on screen. Such sounds are included so as to provide an appropriate emotional nuance, and they may also add to the realism of the film. For example, a film-maker might opt to include the background sound of an ambulance's siren while the foreground sound and image portrays an arguing couple. The asynchronous ambulance siren underscores the psychic injury incurred in the argument; at the same time the noise of the siren adds to the realism of the film by acknowledging the film's city setting.\n\nWe are probably all familiar with background music in films, which has become so ubiquitous as to be noticeable in its absence. We are aware that it is used to add emotion and rhythm. Usually not meant to be noticeable, it often provides a tone or an emotional attitude toward the story and /or the characters depicted. In addition, background music often foreshadows a change in mood. For example, dissonant music may be used in film to indicate an approaching (but not yet visible) menace or disaster.\n\nBackground music may aid viewer understanding by linking scenes. For example, a particular musical theme associated with an individual character or situation may be repeated at various points in a film in order to remind the audience of salient motifs or ideas.\n\nFilm sound comprises conventions and innovations. We have come to expect an acceleration of music during car chases and creaky doors in horror films. Yet, it is important to note as well that sound is often brilliantly conceived. The effects of sound are often largely subtle and often are noted by only our subconscious minds. We need to foster an awareness of film sound as well as film space so as to truly appreciate an art form that sprang to life during the twentieth century - the modern film.",
        "questions": [
          {
            "questionNumber": 14,
            "type": "FILL_IN_BLANKS",
            "content": "14. _______ A the director should plan the sound track at an early stage in filming. B it would be wrong to overlook the contribution of sound to the artistry of films. C the music industry can have a beneficial influence on sound in film. D it is important for those working on the sound in a film to have sole responsibility for it.",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 14."
          },
          {
            "questionNumber": 15,
            "type": "FILL_IN_BLANKS",
            "content": "15. _______ A the importance of the actor and the character appearing to have similar personalities. B the audience’s wish that actors are visually appropriate for their roles. C the value of the actor having had similar feelings to the character. D the audience’s preference for dialogue to be as authentic as possible.",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 15."
          },
          {
            "questionNumber": 16,
            "type": "FILL_IN_BLANKS",
            "content": "16. _______ A audiences are likely to be critical of film dialogue that does not reflect their own experience. B film dialogue that appears to be dull may have a specific purpose. C filmmakers vary considerably in the skill with which they handle dialogue. D the most successful films are those with dialogue of a high Quality.",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 16."
          },
          {
            "questionNumber": 17,
            "type": "FILL_IN_BLANKS",
            "content": "17. _______ A The plot suffers from the filmmaker’s wish to focus on humorous dialogue. B The dialogue helps to make it one of the best comedy films ever produced. C There is a mismatch between the speed of the dialogue and the speed of actions. D The nature of the dialogue emphasises key elements of the film.",
            "options": [],
            "answer": "D",
            "explanation": "Refer to the passage above for question 17."
          },
          {
            "questionNumber": 18,
            "type": "FILL_IN_BLANKS",
            "content": "18. _______ A are often used to give the audience a false impression of events in the film. B may be interpreted in different ways by different members of the audience. C may be modified in order to manipulate the audience’s response to the film. D tend to be more significant in films presenting realistic situations.",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 18."
          },
          {
            "questionNumber": 19,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "19. Audiences are likely to be surprised if a film lacks background music.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 19."
          },
          {
            "questionNumber": 20,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "20. Background music may anticipate a development in a film.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 20."
          },
          {
            "questionNumber": 21,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "21. Background music has more effect on some people than on others.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 21."
          },
          {
            "questionNumber": 22,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "22. Background music may help the audience to make certain connections within the film.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "TRUE",
            "explanation": "Refer to the passage above for question 22."
          },
          {
            "questionNumber": 23,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "23. Audiences tend to be aware of how the background music is affecting them. Complete each sentence with the correct letter below.",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "FALSE",
            "explanation": "Refer to the passage above for question 23."
          },
          {
            "questionNumber": 24,
            "type": "FILL_IN_BLANKS",
            "content": "24. _______ The audience’s response to different parts of a film can be controlled",
            "options": [],
            "answer": "C",
            "explanation": "Refer to the passage above for question 24."
          },
          {
            "questionNumber": 25,
            "type": "FILL_IN_BLANKS",
            "content": "25. _______ The feelings and motivations of characters become clear",
            "options": [],
            "answer": "A",
            "explanation": "Refer to the passage above for question 25."
          },
          {
            "questionNumber": 26,
            "type": "MULTIPLE_CHOICE",
            "content": "26. ",
            "options": [
              "A character seems to be a real person rather than an actor"
            ],
            "answer": "E",
            "explanation": "Refer to the passage above for question 26."
          }
        ]
      },
      {
        "sectionOrder": 3,
        "title": "Passage 3: ‘This Marvellous Invention’",
        "passageText": "You should spend about 20 minutes on Questions 27-40\n\nwhich are based on Reading Passage 3 below.\n\n‘This Marvellous Invention’\n\nA\n\nOf all mankind’s manifold creations, language must take pride of place. Other inventions -the wheel, agriculture, sliced bread - may have transformed our material existence, but the advent of language is what made us human. Compared to language, all other inventions pale in significance, since everything we have ever achieved depends on language and originates from it. Without language, we could never have embarked on our ascent to unparalleled power over all other animals, and even over nature itself.\n\nB\n\nBut language is foremost not just because it came first. In its own right it is a tool of extraordinary sophistication, yet based on an idea of ingenious simplicity: ‘this marvellous invention of composing out of twenty-five or thirty sounds that infinite variety of expressions which, whilst having in themselves no likeness to what is in our mind, allow us to disclose to others its whole secret, and to make known to those who cannot penetrate it all that we imagine, and all the various stirrings of our soul’ This was how, in 1660, the renowned French grammarians of the Port-Royal abbey near Versailles distilled the essence of language, and no one since has celebrated more eloquently the magnitude of its achievement. Even so, there is just one flaw in all these hymns of praise, for the homage to languages unique accomplishment conceals a simple yet critical incongruity. Language is mankind s greatest invention - except, of course, that it was never invented. This apparent paradox is at the core of our fascination with language, and it holds many of its secrets.\n\nC\n\nLanguage often seems so skillfully drafted that one can hardly imagine it as anything other than the perfected handiwork of a master craftsman. How else could this instrument make so much out of barely three dozen measly morsels of sound? In themselves, these configurations of mouth p,f,b,v,t,d,k,g,sh,a,e\n\nand so on - amount to nothing more than a few haphazard spits and splutters, random noises with no meaning, no ability to express, no power to explain. But run them through the cogs and wheels of the language machine, let it arrange them in some very special orders, and there is nothing that these meaningless streams of air cannot do: from sighing the interminable boredom of existence to unravelling the fundamental order of the universe.\n\nD\n\nThe most extraordinary thing about language, however, is that one doesn’t have to be a genius to set its wheels in motion. The language machine allows just about everybody from pre-modern foragers in the subtropical savannah, to post-modern philosophers in the suburban sprawl - to tie these meaningless sounds together into an infinite variety of subtle senses, and all apparently without the slightest exertion. Yet it is precisely this deceptive ease which makes language a victim of its own success, since in everyday life its triumphs are usually taken for granted. The wheels of language run so smoothly that one rarely bothers to stop and think about all the resourcefulness and expertise that must have gone into making it tick. Language conceals art.\n\nE\n\nOften, it is only the estrangement of foreign tongues, with their many exotic and outlandish features, that brings home the wonder of languages design. One of the showiest stunts that some languages can pull off is an ability to build up words of breath-breaking length, and thus express in one word what English takes a whole sentence to say. The Turkish word çehirliliçtiremediklerimizdensiniz\n\n, to take one example, means nothing less than ‘you are one of those whom we can’t turn into a town-dweller’. (In case you were wondering, this monstrosity really is one word, not merely many different words squashed together - most ol its components cannot even stand up on their own.)\n\nF\n\nAnd if that sounds like some one-off freak, then consider Sumerian, the language spoken on the banks of the Euphrates some 5,000 years ago by the people who invented writing and thus enabled the documentation of history. A Sumerian word like munintuma'a\n\n(‘when he had made it suitable for her’) might seem rather trim compared to the Turkish colossus above. What is so impressive about it, however, is not its lengthiness but rather the reverse - the thrifty compactness of its construction. The word is made up of different slots, each corresponding to a particular portion of meaning. This sleek design allows single sounds to convey useful information, and in fact even the absence of a sound has been enlisted to express something specific. If you were to ask which bit in the Sumerian word corresponds to the pronoun ‘it’ in the English translation ‘when he had made it suitable for her’, then the answer would have to be nothing. Mind you, a very particular kind of nothing: the nothing that stands in the empty slot in the middle. The technology is so fine-tuned then that even a non-sound, when carefully placed in a particular position, has been invested with a specific function. Who could possibly have come up with such a nifty contraption?",
        "questions": [
          {
            "questionNumber": 27,
            "type": "FILL_IN_BLANKS",
            "content": "27. _______ Paragraph A",
            "options": [],
            "answer": "vi",
            "explanation": "Refer to the passage above for question 27."
          },
          {
            "questionNumber": 28,
            "type": "FILL_IN_BLANKS",
            "content": "28. _______ Paragraph B",
            "options": [],
            "answer": "iv",
            "explanation": "Refer to the passage above for question 28."
          },
          {
            "questionNumber": 29,
            "type": "FILL_IN_BLANKS",
            "content": "29. _______ Paragraph C",
            "options": [],
            "answer": "ii",
            "explanation": "Refer to the passage above for question 29."
          },
          {
            "questionNumber": 30,
            "type": "FILL_IN_BLANKS",
            "content": "30. _______ Paragraph D",
            "options": [],
            "answer": "vii",
            "explanation": "Refer to the passage above for question 30."
          },
          {
            "questionNumber": 31,
            "type": "FILL_IN_BLANKS",
            "content": "31. _______ Paragraph E",
            "options": [],
            "answer": "i",
            "explanation": "Refer to the passage above for question 31."
          },
          {
            "questionNumber": 32,
            "type": "FILL_IN_BLANKS",
            "content": "32. _______ Paragraph F , below. The importance of language",
            "options": [],
            "answer": "v",
            "explanation": "Refer to the passage above for question 32."
          },
          {
            "questionNumber": 33,
            "type": "FILL_IN_BLANKS",
            "content": "The wheel is one invention that has had a major impact on 33. _______",
            "options": [],
            "answer": "E",
            "explanation": "Refer to the passage above for question 33."
          },
          {
            "questionNumber": 34,
            "type": "FILL_IN_BLANKS",
            "content": "34. _______ aspects of life, but no impact has been as 34",
            "options": [],
            "answer": "G",
            "explanation": "Refer to the passage above for question 34."
          },
          {
            "questionNumber": 35,
            "type": "FILL_IN_BLANKS",
            "content": "35. _______. as that of language. Language is very 35 _______…, yet composed of just a small number of sounds.",
            "options": [],
            "answer": "B",
            "explanation": "Refer to the passage above for question 35."
          },
          {
            "questionNumber": 36,
            "type": "FILL_IN_BLANKS",
            "content": "36. Language appears to be 36 _______… to use. However, its sophistication is often overlooked. A difficult B complex C original D admired E material F easy G fundamental",
            "options": [],
            "answer": "F",
            "explanation": "Refer to the passage above for question 36."
          },
          {
            "questionNumber": 37,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "37. Human beings might have achieved their present position without language.",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "NO",
            "explanation": "Refer to the passage above for question 37."
          },
          {
            "questionNumber": 38,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "38. The Port-Royal grammarians did justice to the nature of language.",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "YES",
            "explanation": "Refer to the passage above for question 38."
          },
          {
            "questionNumber": 39,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "39. ",
            "options": [
              "TRUE",
              "FALSE",
              "NOT GIVEN"
            ],
            "answer": "NOT GIVEN",
            "explanation": "Refer to the passage above for question 39."
          },
          {
            "questionNumber": 40,
            "type": "TRUE_FALSE_NOT_GIVEN",
            "content": "40. The Sumerians were responsible for starting the recording of events. Cam 11 Reading Test 03 Cam 12 Reading Test 01",
            "options": [
              "YES",
              "NO",
              "NOT GIVEN"
            ],
            "answer": "YES",
            "explanation": "Refer to the passage above for question 40."
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
