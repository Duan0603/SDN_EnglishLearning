const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listeningExams = [
  {
    title: "Cambridge IELTS 10 Test 1 Listening",
    description: "Listening Practice Test 1 from Cambridge IELTS 10",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Self-Drive Tours in the USA",
        passageText: "Listen to the conversation between a customer and a travel agent about booking self-drive tours in the USA.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Name: Andrea 1. _______", answer: "Ardleigh", explanation: "The speaker spells the name A-r-d-l-e-i-g-h." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Address: 24 2. _______ Road", answer: "Coolidge", explanation: "The speaker spells the road C-o-o-l-i-d-g-e." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Postcode: 3. _______", answer: "BH5 2OP", explanation: "The postcode is stated as BH5 2OP." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Phone: (mobile) 077 8664 309 | Heard about company from: 4. _______", answer: "newspaper", explanation: "The customer states she read about it in the newspaper." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Trip One: Los Angeles: customer wants to visit some 5. _______ parks with her children.", answer: "theme", explanation: "She mentions her children want to go to theme parks." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Yosemite Park: customer wants to stay in a 6. _______, not a campsite.", answer: "lodge", explanation: "She says they want to stay in a lodge rather than camp." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Trip Two: Customer wants to see the coast on the way to 7. _______.", answer: "Cambria", explanation: "They plan to drive along the coast to Cambria." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "At Santa Monica: not interested in 8. _______.", answer: "shopping", explanation: "She says they don't want to go shopping there." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "At San Diego: wants to spend time on the 9. _______.", answer: "beach", explanation: "She says the kids just want to hang out on the beach." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Total distance for Trip One: 10. _______ km", answer: "980", explanation: "The agent quotes the distance as 980 kilometres." }
        ]
      },
      {
        sectionOrder: 2,
        title: "Section 2: Joining the Leisure Club",
        passageText: "Listen to the information about joining a leisure club.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        questions: [
          {
            questionNumber: 11,
            type: "MULTIPLE_CHOICE",
            content: "Which TWO facilities at the leisure club have recently been improved? (Select A-E)",
            options: ["A. the gym", "B. the tracks", "C. the indoor pool", "D. the outdoor pool", "E. the sports training for children"],
            answer: "A",
            explanation: "The speaker mentions that the gym and the indoor pool have been upgraded."
          },
          {
            questionNumber: 12,
            type: "MULTIPLE_CHOICE",
            content: "Which other facility has been upgraded?",
            options: ["A. the gym", "B. the tracks", "C. the indoor pool", "D. the outdoor pool", "E. the sports training for children"],
            answer: "C",
            explanation: "The speaker mentions that the gym and the indoor pool have been upgraded."
          },
          { questionNumber: 13, type: "FILL_IN_BLANKS", content: "New members should describe any 13. _______ problems.", answer: "health", explanation: "Members must note down any health problems." },
          { questionNumber: 14, type: "FILL_IN_BLANKS", content: "The 14. _______ rules will be explained to you before you use the equipment.", answer: "safety", explanation: "Safety rules will be walked through first." },
          { questionNumber: 15, type: "FILL_IN_BLANKS", content: "You will be given a six-week 15. _______.", answer: "plan", explanation: "A personalized six-week plan will be drawn up." },
          { questionNumber: 16, type: "FILL_IN_BLANKS", content: "There is a compulsory £90 16. _______ fee for members.", answer: "joining", explanation: "The initial joining fee is £90." },
          { questionNumber: 17, type: "FILL_IN_BLANKS", content: "Gold members are given 17. _______ entry to all LP clubs.", answer: "free", explanation: "Gold membership offers free entry to other clubs." },
          { questionNumber: 18, type: "FILL_IN_BLANKS", content: "Premier members are given priority during 18. _______ hours.", answer: "peak", explanation: "Premier members get priority booking during peak hours." },
          { questionNumber: 19, type: "FILL_IN_BLANKS", content: "Premier members can bring some 19. _______ every month.", answer: "guests", explanation: "Premier members can bring guests for free." },
          { questionNumber: 20, type: "FILL_IN_BLANKS", content: "Members should always take their 20. _______ with them.", answer: "photocard", explanation: "Always bring your photocard to enter." }
        ]
      },
      {
        sectionOrder: 3,
        title: "Section 3: Global Design Competition",
        passageText: "Listen to the discussion between two students, John and Monica, and their tutor about a design competition.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        questions: [
          {
            questionNumber: 21,
            type: "MULTIPLE_CHOICE",
            content: "Students entering the design competition have to",
            options: ["A. produce an energy-efficient design.", "B. adapt an existing energy-saving appliance.", "C. develop a new use for current technology."],
            answer: "C",
            explanation: "The tutor states that the challenge is to find a new application for existing technology."
          },
          {
            questionNumber: 22,
            type: "MULTIPLE_CHOICE",
            content: "John chose a dishwasher because he wanted to make dishwashers",
            options: ["A. more appealing.", "B. more common.", "C. more economical."],
            answer: "B",
            explanation: "John says he wanted to make them standard in homes."
          },
          {
            questionNumber: 23,
            type: "MULTIPLE_CHOICE",
            content: "The stone in John's 'Rockpool' design is used to",
            options: ["A. decoration.", "B. switch it on.", "C. stop water escaping."],
            answer: "B",
            explanation: "The stone acts as the switch."
          },
          {
            questionNumber: 24,
            type: "MULTIPLE_CHOICE",
            content: "In the holding chamber, the carbon dioxide changes back to a gas and",
            options: ["A. dries the dishes.", "B. is allowed to cool.", "C. is released into the air."],
            answer: "A",
            explanation: "He notes that the gas phase is used to dry the plates."
          },
          {
            questionNumber: 25,
            type: "MULTIPLE_CHOICE",
            content: "At the end of the cleaning process, the carbon dioxide is",
            options: ["A. released into the air.", "B. disposed of with the waste water.", "C. collected ready to be re-used."],
            answer: "C",
            explanation: "He states that it is recycled for the next cycle."
          },
          { questionNumber: 26, type: "FILL_IN_BLANKS", content: "John needs help preparing for his 26. _______.", answer: "presentation", explanation: "John asks for help with his upcoming presentation." },
          { questionNumber: 27, type: "FILL_IN_BLANKS", content: "The professor advises John to make 27. _______ of his slides.", answer: "printouts", explanation: "The tutor suggests printing them out." },
          { questionNumber: 28, type: "FILL_IN_BLANKS", content: "John's main problem is getting good quality 28. _______.", answer: "materials", explanation: "He mentions difficulty sourcing quality materials." },
          { questionNumber: 29, type: "FILL_IN_BLANKS", content: "The professor suggests John apply for a 29. _______.", answer: "grant", explanation: "The tutor tells him to apply for a small financial grant." },
          { questionNumber: 30, type: "FILL_IN_BLANKS", content: "The professor will check the 30. _______ information in John's report.", answer: "technical", explanation: "The tutor offers to double-check the technical details." }
        ]
      },
      {
        sectionOrder: 4,
        title: "Section 4: The Spirit Bear",
        passageText: "Listen to the lecture about the spirit bear, a unique white bear found in Canada.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        questions: [
          { questionNumber: 31, type: "FILL_IN_BLANKS", content: "Its colour comes from an uncommon 31. _______.", answer: "gene", explanation: "The speaker explains it is due to a recessive gene." },
          { questionNumber: 32, type: "FILL_IN_BLANKS", content: "Local people believe that it has unusual 32. _______.", answer: "power", explanation: "First Nations people consider it has special powers." },
          { questionNumber: 33, type: "FILL_IN_BLANKS", content: "They protect the bear from 33. _______.", answer: "hunters", explanation: "They keep its location secret to protect it from hunters." },
          { questionNumber: 34, type: "FILL_IN_BLANKS", content: "Tree roots stop 34. _______ along salmon streams.", answer: "erosion", explanation: "Roots secure the banks and prevent soil erosion." },
          { questionNumber: 35, type: "FILL_IN_BLANKS", content: "Bears are currently found on a small number of 35. _______.", answer: "islands", explanation: "Their habitat is restricted to a few coastal islands." },
          { questionNumber: 36, type: "FILL_IN_BLANKS", content: "Habitat is lost due to deforestation and construction of 36. _______.", answer: "roads", explanation: "Road construction splits up the forest." },
          { questionNumber: 37, type: "FILL_IN_BLANKS", content: "Unrestricted 37. _______ is affecting the salmon supply.", answer: "fishing", explanation: "Overfishing depletes the bear's primary food source." },
          { questionNumber: 38, type: "FILL_IN_BLANKS", content: "The bear's existence is threatened by their low rate of 38. _______.", answer: "reproduction", explanation: "They reproduce very slowly." },
          { questionNumber: 39, type: "FILL_IN_BLANKS", content: "Logging companies must improve their 39. _______ of logging.", answer: "method", explanation: "Logging practices must become more sustainable." },
          { questionNumber: 40, type: "FILL_IN_BLANKS", content: "Maintenance and 40. _______ of the spirit bear's territory is needed.", answer: "expansion", explanation: "Protecting and expanding their territory is vital." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 2 Listening",
    description: "Listening Practice Test 2 from Cambridge IELTS 10 (Transport Survey, etc.)",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Transport Survey",
        passageText: "Listen to the transport survey interview.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Travelled to town today: by 1. _______", answer: "bus", explanation: "The customer states they took the bus." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Reason for journey: 2. _______", answer: "shopping", explanation: "She is in town to do some shopping." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Name: Louisa 3. _______", answer: "Hardie", explanation: "Spelled H-a-r-d-i-e." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Address: 19 4. _______ Road", answer: "Gedling", explanation: "Spelled G-e-d-l-i-n-g." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Postcode: 5. _______", answer: "RU6 2FF", explanation: "Stated clearly as RU6 2FF." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Occupation: 6. _______", answer: "hairdresser", explanation: "She works as a hairdresser." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Frequently uses the 7. _______ travel card.", answer: "weekly", explanation: "She says she buys a weekly pass." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "Finds the bus service 8. _______.", answer: "reliable", explanation: "She finds it very reliable overall." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "Dislike: lack of 9. _______ on buses.", answer: "seats", explanation: "She complains that there are often no free seats." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Suggested improvement: cheaper fares in the 10. _______.", answer: "afternoon", explanation: "She suggests reducing ticket prices in the afternoons." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 3 Listening",
    description: "Listening Practice Test 3 from Cambridge IELTS 10 (Childcare Centre, etc.)",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Early Learning Childcare Centre Enrolment Form",
        passageText: "Listen to the conversation about childcare enrollment.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Child's name: Kate 1. _______", answer: "Heron", explanation: "Spelled H-e-r-o-n." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Date of Birth: 2. _______ August", answer: "24", explanation: "Her birthday is the 24th of August." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Address: 4 3. _______ Road", answer: "Bridge", explanation: "They live on Bridge Road." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Days requested: 4. _______ and Friday", answer: "Thursday", explanation: "She requests Thursdays and Fridays." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Mother's name: 5. _______ Heron", answer: "Sally", explanation: "Her mother's name is Sally." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Mother's contact number: 6. _______", answer: "0778 554 991", explanation: "The number is given as 0778 554 991." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Child has allergy to: 7. _______", answer: "peanuts", explanation: "She has a nut allergy." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "Emergency contact: 8. _______ (Uncle)", answer: "John", explanation: "The uncle's name is John." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "Relationship to child: 9. _______", answer: "uncle", explanation: "He is Kate's uncle." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Fees payment method: 10. _______ transfer", answer: "bank", explanation: "She prefers direct bank transfer." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 4 Listening",
    description: "Listening Practice Test 4 from Cambridge IELTS 10 (Thorndyke's Builders, etc.)",
    type: "LISTENING",
    duration: 30,
    sections: [
      {
        sectionOrder: 1,
        title: "Section 1: Inquiry to Thorndyke's Builders",
        passageText: "Listen to the conversation about a home renovation request.",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        questions: [
          { questionNumber: 1, type: "FILL_IN_BLANKS", content: "Customer name: Edith 1. _______", answer: "Pargeter", explanation: "Spelled P-a-r-g-e-t-e-r." },
          { questionNumber: 2, type: "FILL_IN_BLANKS", content: "Address: 2. _______ Cottage, East End", answer: "Rose", explanation: "She lives at Rose Cottage." },
          { questionNumber: 3, type: "FILL_IN_BLANKS", content: "Phone number: 3. _______", answer: "0188 923 544", explanation: "The phone number is 0188 923 544." },
          { questionNumber: 4, type: "FILL_IN_BLANKS", content: "Renovation type: 4. _______ conversion", answer: "loft", explanation: "She wants to convert her loft." },
          { questionNumber: 5, type: "FILL_IN_BLANKS", content: "Preferred start date: 5. _______ October", answer: "12", explanation: "She wants to start on October 12th." },
          { questionNumber: 6, type: "FILL_IN_BLANKS", content: "Budget: £ 6. _______", answer: "15000", explanation: "Her budget limit is fifteen thousand pounds." },
          { questionNumber: 7, type: "FILL_IN_BLANKS", content: "Builder will visit on: 7. _______ morning", answer: "Thursday", explanation: "The builder will come on Thursday morning." },
          { questionNumber: 8, type: "FILL_IN_BLANKS", content: "Builder's name: Mr. 8. _______", answer: "Jackson", explanation: "The builder's name is Mr. Jackson." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "Builder's vehicle: a white 9. _______", answer: "van", explanation: "He will arrive in a white van." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Edith heard about builder from: a 10. _______", answer: "neighbour", explanation: "Her neighbour recommended them." }
        ]
      }
    ]
  }
];

const readingExams = [
  {
    title: "Cambridge IELTS 10 Test 1 Reading",
    description: "Reading Practice Test 1 from Cambridge IELTS 10 (Stepwells, etc.)",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Stepwells",
        passageText: "A millennium ago, stepwells were fundamental to life in the driest parts of India. Richard Cox travelled to north-western India to document these spectacular monuments from a bygone era...",
        questions: [
          { questionNumber: 1, type: "TRUE_FALSE_NOT_GIVEN", content: "Examples of ancient stepwells can be found all over the world.", answer: "FALSE", explanation: "The passage states stepwells are unique to this region of north-western India." },
          { questionNumber: 2, type: "TRUE_FALSE_NOT_GIVEN", content: "Stepwells had a range of functions, in addition to those related to water collection.", answer: "TRUE", explanation: "They were also gathering places, places of leisure, relaxation and worship." },
          { questionNumber: 3, type: "TRUE_FALSE_NOT_GIVEN", content: "The few stepwells in Delhi are more attractive than those found elsewhere.", answer: "NOT GIVEN", explanation: "The text mentions some stepwells survive in Delhi, but does not compare their attractiveness." },
          { questionNumber: 4, type: "TRUE_FALSE_NOT_GIVEN", content: "It took workers many years to build the stone steps characteristic of stepwells.", answer: "NOT GIVEN", explanation: "The text describes the steps but doesn't mention how long they took to build." },
          { questionNumber: 5, type: "TRUE_FALSE_NOT_GIVEN", content: "The number of steps above the water level in a stepwell altered during the course of a year.", answer: "TRUE", explanation: "The water level receded following the rains, meaning the number of steps to reach water varied." }
        ]
      },
      {
        sectionOrder: 2,
        title: "Passage 2: European Transport Systems 1990-2010",
        passageText: "It is difficult to conceive of vigorous economic growth without an efficient transport system. Although modern information technologies can reduce the demand for physical transport, the requirement for transport continues to increase...",
        questions: [
          { questionNumber: 14, type: "TRUE_FALSE_NOT_GIVEN", content: "The need for transport is growing, despite technological developments.", answer: "TRUE", explanation: "The passage notes that although IT can reduce demand, the requirement for transport continues to increase." },
          { questionNumber: 15, type: "TRUE_FALSE_NOT_GIVEN", content: "To reduce production costs, some industries have been moved closer to their relevant consumers.", answer: "FALSE", explanation: "The text says they relocated to reduce costs, even though the production site is hundreds or thousands of kilometres away from assembly or users." },
          { questionNumber: 16, type: "TRUE_FALSE_NOT_GIVEN", content: "Cars are prohibitively expensive in some EU candidate countries.", answer: "NOT GIVEN", explanation: "The text mentions cars and road transport tip, but not the price of cars." }
        ]
      },
      {
        sectionOrder: 3,
        title: "Passage 3: The Psychology of Innovation",
        passageText: "Why are so few companies truly innovative? Innovation is key to business survival, and companies put substantial resources into inspiring employees to develop new ideas...",
        questions: [
          {
            questionNumber: 27,
            type: "MULTIPLE_CHOICE",
            content: "The example of the 'million-dollar quartet' underlines the writer's point about",
            options: ["A. recognising talent.", "B. working as a team.", "C. having a shared objective.", "D. being an effective leader."],
            answer: "C",
            explanation: "The quartet illustrates the value fit and having a shared objective."
          },
          {
            questionNumber: 28,
            type: "MULTIPLE_CHOICE",
            content: "James Watson suggests that he and Francis Crick won the race to discover the DNA code because they",
            options: ["A. were conscious of their own limitations.", "B. brought complementary skills to their partnership.", "C. were determined to outperform their brighter rivals.", "D. encouraged each other to realise their joint ambition."],
            answer: "A",
            explanation: "Watson says they succeeded because they knew they weren't the smartest, so they sought advice."
          }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 2 Reading",
    description: "Reading Practice Test 2 from Cambridge IELTS 10 (Tea and the Industrial Revolution, etc.)",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Tea and the Industrial Revolution",
        passageText: "Alan Macfarlane, professor of anthropological science at King's College, Cambridge, has, like other historians, spent decades wrestling with the enigma of the Industrial Revolution...",
        questions: [
          { questionNumber: 1, type: "TRUE_FALSE_NOT_GIVEN", content: "Tea was unknown in Britain before the Industrial Revolution.", answer: "FALSE", explanation: "Tea was introduced earlier, and its mass adoption helped prevent disease." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 3 Reading",
    description: "Reading Practice Test 3 from Cambridge IELTS 10 (ADHD, etc.)",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Attention Deficit Hyperactivity Disorder",
        passageText: "ADHD is a highly publicised and currently highly debated category of behavioural disorder in children...",
        questions: [
          { questionNumber: 1, type: "TRUE_FALSE_NOT_GIVEN", content: "ADHD is only diagnosed in childhood.", answer: "FALSE", explanation: "It states symptoms can persist into adulthood." }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 4 Reading",
    description: "Reading Practice Test 4 from Cambridge IELTS 10 (Megafires, etc.)",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: The Megafires of California",
        passageText: "Wildfires are a natural part of California's ecology, but in recent years they have grown in size and intensity, creating a new class of megafires...",
        questions: [
          { questionNumber: 1, type: "TRUE_FALSE_NOT_GIVEN", content: "Megafires are a new phenomenon in California.", answer: "TRUE", explanation: "The text says megafires are a recent trend." }
        ]
      }
    ]
  }
];

const speakingExams = [
  {
    title: "Cambridge IELTS 10 Test 1 Speaking",
    description: "Speaking Practice Test 1 from Cambridge IELTS 10",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Introduction and Interview",
        passageText: "The examiner asks the candidate about him/herself, his/her home, work or studies and other familiar topics.\n\nTopic: Weekends\n• How do you usually spend your weekends? \n• Which is your favourite part of the weekend?\n• Do you think weekends are long enough?",
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Part 2: Individual Long Turn (Cue Card)",
        passageText: "Describe a memorable event in your life.\n\nYou should say:\n• What the event was and when it occurred\n• Who was there with you\n• And explain why it is so memorable to you.",
        questions: []
      },
      {
        sectionOrder: 3,
        title: "Part 3: Two-way Discussion",
        passageText: "The examiner and the candidate discuss more abstract issues related to the topic in Part 2.\n\nTopic: Memory and Recollection\n• Why do some people remember details of events more clearly than others?\n• How does technology affect our ability to remember things?",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 2 Speaking",
    description: "Speaking Practice Test 2 from Cambridge IELTS 10",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Music",
        passageText: "Music:\n• What types of music do you like listening to?\n• Do you play any musical instruments?\n• How has your taste in music changed over the years?",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 3 Speaking",
    description: "Speaking Practice Test 3 from Cambridge IELTS 10",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: Travel",
        passageText: "Travel:\n• Do you enjoy travelling? why?\n• Where would you like to travel in the future?\n• What are the benefits of travelling to other countries?",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 4 Speaking",
    description: "Speaking Practice Test 4 from Cambridge IELTS 10",
    type: "SPEAKING",
    duration: 15,
    sections: [
      {
        sectionOrder: 1,
        title: "Part 1: School",
        passageText: "School:\n• What was your favourite subject at school?\n• Do you keep in touch with any of your school friends?\n• Do you think school education prepares children well for the future?",
        questions: []
      }
    ]
  }
];

const writingExams = [
  {
    title: "Cambridge IELTS 10 Test 1 Writing",
    description: "Writing Practice Test 1 from Cambridge IELTS 10 (Energy Use, etc.)",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Energy Use in Household",
        passageText: "The first chart below shows how energy is used in an average Australian household. The second chart shows the greenhouse gas emissions which result from this energy use.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["https://example.com/charts/energy_use.png"],
        questions: []
      },
      {
        sectionOrder: 2,
        title: "Writing Task 2: Taxes on Fast Food",
        passageText: "Some people believe that fast food should be taxed higher to encourage healthy eating. To what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 2 Writing",
    description: "Writing Practice Test 2 from Cambridge IELTS 10 (Fairtrade Sales, etc.)",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Sales of Fairtrade Products",
        passageText: "The tables below give information about sales of Fairtrade-labelled coffee and bananas in five European countries in 2004 and 2008.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["https://example.com/charts/fairtrade_sales.png"],
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 3 Writing",
    description: "Writing Practice Test 3 from Cambridge IELTS 10 (UK Graduate destinations, etc.)",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: UK Graduates Destinations",
        passageText: "The charts below show what UK graduate and postgraduate students who did not go into full-time work did after leaving college.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["https://example.com/charts/uk_graduates.png"],
        questions: []
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 4 Writing",
    description: "Writing Practice Test 4 from Cambridge IELTS 10 (Salmon Life Cycle, etc.)",
    type: "WRITING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Writing Task 1: Life Cycle of Salmon",
        passageText: "The diagrams below show the life cycle of a species of large fish called the salmon.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        images: ["https://example.com/charts/salmon_lifecycle.png"],
        questions: []
      }
    ]
  }
];

async function main() {
  console.log("=== Starting Database Seeding of Cambridge IELTS 10 ===");

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
