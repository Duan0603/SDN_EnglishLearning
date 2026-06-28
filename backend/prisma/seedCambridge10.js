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
        passageText: `A millennium ago, stepwells were fundamental to life in the driest parts of India. Richard Cox travelled to north-western India to document these spectacular monuments from a bygone era.\n\nDuring the sixth and seventh centuries, the inhabitants of the modern-day states of Gujarat and Rajasthan in North-western India developed a method of gaining access to clean, fresh groundwater during the dry season for drinking, bathing, watering animals and irrigation. However, the significance of this invention – the stepwell – goes beyond its utilitarian application.\n\nUnique to the region, stepwells are often architecturally complex and vary widely in size and shape. During their heyday, they were places of gathering, of leisure, of relaxation and of worship for villagers of all but the lowest castes. Most stepwells are found dotted around the desert areas of Gujarat (where they are called vav) and Rajasthan (where they are known as baori), while a few also survive in Delhi. Some were located in or near villages as public spaces for the community; others were positioned beside roads as resting places for travellers.\n\nAs their name suggests, stepwells comprise a series of stone steps descending from ground level to the water source (normally an underground aquifer) as it recedes following the rains. When the water level was high, the user needed only to descend a few steps to reach it; when it was low, several levels would have to be negotiated.\n\nSome wells are vast, open craters with hundreds of steps paving each sloping side, often in tiers. Others are more elaborate, with long stepped passages leading to the water via several storeys built from stone and supported by pillars, they also included pavilions that sheltered visitors from the relentless heat. But perhaps the most impressive features are the intricate decorative sculptures that embellish many stepwells, showing activities from fighting and dancing to everyday acts such as women combing their hair and churning butter.\n\nDown the centuries, thousands of wells were constructed throughout northwestern India, but the majority have now fallen into disuse; many are derelict and dry, as groundwater has been diverted for industrial use and the wells no longer reach the water table. Their condition hasn’t been helped by recent dry spells: southern Rajasthan suffered an eight-year drought between 1996 and 2004. However, some important sites in Gujarat have recently undergone major restoration, and the state government announced in June last year that it plans to restore the stepwells throughout the state.\n\nIn Patan, the state’s ancient capital, the stepwell of Rani Ki Vav (Queen’s Stepwell) is perhaps the finest current example. It was built by Queen Udayamati during the late 11th century, but became silted up following a flood during the 13th century. But the Archaeological Survey of India began restoring it in the 1960s, and today it’s in pristine condition. At 65 metres long, 20 metres wide and 27 metres deep, Rani Ki Vav features 500 distinct sculptures carved into niches throughout the monument, depicting gods such as Vishnu and Parvati in various incarnations. Incredibly, in January 2001, this ancient structure survived a devastating earthquake that measured 7.6 on the Richter scale.\n\nAnother example is the Surya Kund in Modhera, northern Gujarat, next to the Sun Temple, built by King Bhima I in 1026 to honour the sun god Surya. It actually resembles a tank (kund means reservoir or pond) rather than a well, but displays the hallmarks of stepwell architecture, including four sides of steps that descend to the bottom in a stunning geometrical formation. The terraces house 108 small, intricately carved shrines between the sets of steps.\n\nRajasthan also has a wealth of wells. The ancient city of Bundi, 200 kilometres south of Jaipur, is renowned for its architecture, including its stepwells. One of the larger examples is Raniji Ki Baori, which was built by the queen of the region, Nathavatji, in 1699. At 46 metres deep, 20 metres wide and 40 metres long, the intricately carved monument is one of 21 baoris commissioned in the Bundi area by Nathavatji.\n\nIn the old ruined town of Abhaneri, about 95 kilometres east of Jaipur, is Chand Baori, one of India’s oldest and deepest wells; aesthetically, it’s perhaps one of the most dramatic. Built in around 850 AD next to the temple of Harshat Mata, the baori comprises hundreds of zigzagging steps that run along three of its sides, steeply descending 11 storeys, resulting in a striking geometric pattern when seen from afar. On the fourth side, covered verandas supported by ornate pillars overlook the steps.\n\nStill in public use is Neemrana Ki Baori, located just off the Jaipur–Dehli highway. Constructed in around 1700, it’s nine storeys deep, with the last two levels underwater. At ground level, there are 86 colonnaded openings from where the visitor descends 170 steps to the deepest water source.\n\nToday, following years of neglect, many of these monuments to medieval engineering have been saved by the Archaeological Survey of India, which has recognised the importance of preserving them as part of the country’s rich history. Tourists flock to wells in far-flung corners of northwestern India to gaze in wonder at these architectural marvels from 1,000 years ago, which serve as a reminder of both the ingenuity and artistry of ancient civilisations and of the value of water to human existence.`,
        questions: [
          { questionNumber: 1, type: "TRUE_FALSE_NOT_GIVEN", content: "Examples of ancient stepwells can be found all over the world.", answer: "FALSE", explanation: "The passage states that stepwells are unique to this region (north-western India)." },
          { questionNumber: 2, type: "TRUE_FALSE_NOT_GIVEN", content: "Stepwells had a range of functions, in addition to those related to water collection.", answer: "TRUE", explanation: "They were also gathering places, places of leisure, relaxation and worship." },
          { questionNumber: 3, type: "TRUE_FALSE_NOT_GIVEN", content: "The few stepwells in Delhi are more attractive than those found elsewhere.", answer: "NOT GIVEN", explanation: "The text mentions some stepwells survive in Delhi, but does not compare their attractiveness." },
          { questionNumber: 4, type: "TRUE_FALSE_NOT_GIVEN", content: "It took workers many years to build the stone steps characteristic of stepwells.", answer: "NOT GIVEN", explanation: "The text describes the steps but doesn't mention how long they took to build." },
          { questionNumber: 5, type: "TRUE_FALSE_NOT_GIVEN", content: "The number of steps above the water level in a stepwell altered during the course of a year.", answer: "TRUE", explanation: "The water level receded following the rains, meaning the number of steps to reach water varied." },
          { questionNumber: 6, type: "SHORT_ANSWER", content: "Which part of some stepwells provided shade for people?", answer: "pavilions", explanation: "The passage states they included pavilions that sheltered visitors from the relentless heat." },
          { questionNumber: 7, type: "SHORT_ANSWER", content: "What type of serious climatic event, which took place in southern Rajasthan, is mentioned in the article?", answer: "drought", explanation: "The passage states that southern Rajasthan suffered an eight-year drought between 1996 and 2004." },
          { questionNumber: 8, type: "SHORT_ANSWER", content: "Who are frequent visitors to stepwells nowadays?", answer: "tourists", explanation: "The text mentions that tourists flock to wells in far-flung corners of northwestern India." },
          { questionNumber: 9, type: "FILL_IN_BLANKS", content: "Rani Ki Vav: Restored in 1960s; excellent condition despite the 9. _______ of 2001.", answer: "earthquake", explanation: "The text states that Rani Ki Vav survived a devastating earthquake in January 2001." },
          { questionNumber: 10, type: "FILL_IN_BLANKS", content: "Surya Kund: Steps on the 10. _______ produce a geometrical pattern.", answer: "four sides", explanation: "The text mentions four sides of steps that descend to the bottom in a stunning geometrical formation." },
          { questionNumber: 11, type: "FILL_IN_BLANKS", content: "Surya Kund: Looks more like a 11. _______ than a well.", answer: "tank", explanation: "The text states that Surya Kund actually resembles a tank rather than a well." },
          { questionNumber: 12, type: "FILL_IN_BLANKS", content: "Chand Baori: Steps on three sides; 12. _______ on the fourth side.", answer: "verandas", explanation: "The text states that covered verandas supported by ornate pillars overlook the steps on the fourth side." },
          { questionNumber: 13, type: "FILL_IN_BLANKS", content: "Neemrana Ki Baori: Nine storeys; two levels 13. _______.", answer: "underwater", explanation: "The text states Neemrana Ki Baori is nine storeys deep, with the last two levels underwater." }
        ]
      },
      {
        sectionOrder: 2,
        title: "Passage 2: European Transport Systems 1990-2010",
        passageText: `It is difficult to conceive of vigorous economic growth without an efficient transport system. Although modern information technologies can reduce the demand for physical transport by facilitating teleworking and teleservices, the requirement for transport continues to increase. There are two key factors behind this trend. For passenger transport, the determining factor is the spectacular growth in car use. The number of cars on European Union (EU) roads saw an increase of three million cars each year from 1990 to 2010, and in the next decade the EU will see a further substantial increase in its fleet.\n\nAs far as goods transport is concerned, growth is due to a large extent to changes in the European economy and its system of production. In the last 20 years, as internal frontiers have been abolished, the EU has moved from a “stock” economy to a “flow” economy. This phenomenon has been emphasised by the relocation of some industries, particularly those which are labour-intensive, to reduce production costs, even though the production site is hundreds or even thousands of kilometres away from the final assembly plant or away from users.\n\nThe strong economic growth expected in countries which are candidates for entry to the EU will also increase transport flows, in particular road haulage traffic. In 1998, some of these countries already exported more than twice their 1990 volumes and imported more than five times their 1990 volumes. And although many candidate countries inherited a transport system which encourages rail, the distribution between modes has tipped sharply in favour of road transport since the 1990s. Between 1990 and 1998, road haulage increased by 19.4%, while during the same period rail haulage decreased by 43.5%, although – and this could benefit the enlarged EU – it is still on average at a much higher level than in existing member states.\n\nHowever, a new imperative – sustainable development – offers an opportunity for adapting the EU’s common transport policy. This objective, agreed by the Gothenburg European Council, has to be achieved by integrating environmental considerations into Community policies, and shifting the balance between modes of transport lies at the heart of its strategy. The ambitious objective can only be fully achieved by 2020, but proposed measures are nonetheless a first essential step towards a sustainable transport system which will ideally be in place in 30 years’ time, that is by 2040.\n\nIn 1998, energy consumption in the transport sector was to blame for 28% of emissions of CO2, the leading greenhouse gas. According to the latest estimates, if nothing is done to reverse the traffic growth trend, CO2 emissions from transport can be expected to increase by around 50% to 1,113 billion tonnes by 2020, compared with the 739 billion tonnes recorded in 1990. Once again, road transport is the main culprit since it alone accounts for 84% of the CO2 emissions attributable to transport. Using alternative fuels and improving energy efficiency is thus both an ecological necessity and a technological challenge.\n\nAt the same time greater efforts must be made to achieve a modal shift. Such a change cannot be achieved overnight, all the less so after over half a century of constant deterioration in favour of road. This has reached such a pitch that today rail freight services are facing marginalisation, with just 8% of market share, and with international goods trains struggling along at an average speed of 18km/h. Three possible options have emerged.\n\nThe first approach would consist of focusing on road transport solely through pricing. This option would not be accompanied by complementary measures in the other modes of transport. In the short term it might curb the growth in road transport through the better loading ratio of goods vehicles and occupancy rates of passenger vehicles expected as a result of the increase in the price of transport. However, the lack of measures available to revitalise other modes of transport would make it impossible for more sustainable modes of transport to take up the baton.\n\nThe second approach also concentrates on road transport pricing but is accompanied by measures to increase the efficiency of the other modes (better quality of services, logistics, technology). However, this approach does not include investment in new infrastructure, nor does it guarantee better regional cohesion. It could help to achieve greater uncoupling than the first approach, but road transport would keep the lion’s share of the market and continue to concentrate on saturated arteries, despite being the most polluting of the modes. It is therefore not enough to guarantee the necessary shift of the balance.\n\nThe third approach, which is not new, comprises a series of measures ranging from pricing to revitalising alternative modes of transport and targeting investment in the trans-European network. This integrated approach would allow the market shares of the other modes to return to their 1998 levels and thus make a shift of balance. It is far more ambitious than it looks, bearing in mind the historical imbalance in favour of roads for the last fifty years, but would achieve a marked break in the link between road transport growth and economic growth, without placing restrictions on the mobility of people and goods.`,
        questions: [
          {
            questionNumber: 14,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph A from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "H",
            explanation: "Paragraph A focuses on the rapid growth of private car use as the key driver of passenger transport."
          },
          {
            questionNumber: 15,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph B from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "C",
            explanation: "Paragraph B discusses how the relocation of industries hundreds or thousands of kilometres away has increased the distance goods are transported."
          },
          {
            questionNumber: 16,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph C from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "K",
            explanation: "Paragraph C details the transport trends in EU candidate countries awaiting admission."
          },
          {
            questionNumber: 17,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph D from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "A",
            explanation: "Paragraph D introduces the new long-term goal of sustainable development to be fully achieved by 2020 or 2040."
          },
          {
            questionNumber: 18,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph E from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "E",
            explanation: "Paragraph E covers the environmental costs (specifically CO2 greenhouse gas emissions) of road transport."
          },
          {
            questionNumber: 19,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph G from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "J",
            explanation: "Paragraph G describes the first approach: restricting road use through pricing policies alone."
          },
          {
            questionNumber: 20,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph H from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "B",
            explanation: "Paragraph H describes the second approach: charging for roads accompanied by measures to improve other transport methods."
          },
          {
            questionNumber: 21,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph I from the list of headings below.",
            options: [
              "i. A fresh and important long-term goal",
              "ii. Charging for roads and improving other transport methods",
              "iii. Changes affecting the distances goods may be transported",
              "iv. Taking all the steps necessary to change transport patterns",
              "v. The environmental costs of road transport",
              "vi. Port development and domestic shipping",
              "vii. The need to achieve transport rebalance",
              "viii. The rapid growth of private transport",
              "ix. Plans to reduce wealth inequality",
              "x. Restricting road use through charging policies alone",
              "xi. Transport trends in countries awaiting EU admission"
            ],
            answer: "D",
            explanation: "Paragraph I outlines the third approach: taking all the steps necessary (integrated approach) to change transport patterns."
          },
          { questionNumber: 22, type: "TRUE_FALSE_NOT_GIVEN", content: "The need for transport is growing, despite technological developments.", answer: "TRUE", explanation: "Paragraph A states that although information technologies can reduce the demand, the requirement for transport continues to increase." },
          { questionNumber: 23, type: "TRUE_FALSE_NOT_GIVEN", content: "To reduce production costs, some industries have been moved closer to their relevant consumers.", answer: "FALSE", explanation: "Paragraph B states that industries moved to reduce production costs, even though the production site is hundreds or thousands of kilometres away from users." },
          { questionNumber: 24, type: "TRUE_FALSE_NOT_GIVEN", content: "Cars are prohibitively expensive in some EU candidate countries.", answer: "NOT GIVEN", explanation: "The text discusses road transport and candidate countries but does not mention the price of cars." },
          { questionNumber: 25, type: "TRUE_FALSE_NOT_GIVEN", content: "The Gothenburg European Council was set up 30 years ago.", answer: "NOT GIVEN", explanation: "The text mentions the sustainable development objective agreed by the council and a 30-year target timeline, but not when the council itself was established." },
          { questionNumber: 26, type: "TRUE_FALSE_NOT_GIVEN", content: "By the end of this decade, CO2 emissions from transport are predicted to reach 739 billion tonnes.", answer: "FALSE", explanation: "The text predicts CO2 emissions will reach 1,113 billion tonnes, while 739 billion tonnes was the amount recorded in 1990." }
        ]
      },
      {
        sectionOrder: 3,
        title: "Passage 3: The Psychology of Innovation",
        passageText: `Innovation is key to business survival, and companies put substantial resources into inspiring employees to develop new ideas. There are, nevertheless, people working in luxurious, state-of-the-art centres designed to stimulate innovation who find that their environment doesn’t make them feel at all creative. And there are those who don’t have a budget, or much space, but who innovate successfully.\n\nFor Robert B. Cialdini, Professor of Psychology at Arizona State University, one reason that companies don’t succeed as often as they should is that innovation starts with recruitment. Research shows that the fit between an employee’s values and a company’s values makes a difference to what contribution they make and whether, two years after they join, they’re still at the company. Studies at Harvard Business School show that, although some individuals may be more creative than others, almost every individual can be creative in the right circumstances.\n\nOne of the most famous photographs in the story of rock’n’roll emphasises Cialdini’s views. The 1956 picture of singers Elvis Presley, Carl Perkins, Johnny Cash and Jerry Lee Lewis jamming at a piano in Sun Studios in Memphis tells a hidden story. Sun’s ‘million-dollar quartet’ could have been a quintet. Missing from the picture is Roy Orbison, a greater natural singer than Lewis, Perkins or Cash. Sam Phillips, who owned Sun, wanted to revolutionise popular music with songs that fused black and white music, and country and blues. Presley, Cash, Perkins and Lewis instinctively understood Phillips’s ambition and believed in it. Orbison wasn’t inspired by the goal, and only ever achieved one hit with the Sun label.\n\nThe value fit matters, says Cialdini, because innovation is, in part, a process of change, and under that pressure we, as a species, behave differently, ‘When things change, we are hard-wired to play it safe.’ Managers should therefore adopt an approach that appears counterintuitive – they should explain what stands to be lost if the company fails to seize a particular opportunity. Studies show that we invariably take more gambles when threatened with a loss than when offered a reward.\n\nManaging innovation is a delicate art. It’s easy for a company to be pulled in conflicting directions as the marketing, product development, and finance departments each get different feedback from different sets of people. And without a system which ensures collaborative exchanges within the company, it’s also easy for small ‘pockets of innovation’ to disappear. Innovation is a contact sport. You can’t brief people just by saying, ‘We’re going in this direction and I’m going to take you with me.’\n\nCialdini believes that this ‘follow-the-leader syndrome’ is dangerous, not least because it encourages bosses to go it alone. ‘It’s been scientifically proven that three people will be better than one at solving problems, even if that one person is the smartest person in the field.’ To prove his point, Cialdini cites an interview with molecular biologist James Watson. Watson, together with Francis Crick, discovered the structure of DNA, the genetic information carrier of all living organisms. ‘When asked how they had cracked the code ahead of an array of highly accomplished rival investigators, he said something that stunned me. He said he and Crick had succeeded because they were aware that they weren’t the most intelligent of the scientists pursuing the answer. The smartest scientist was called Rosalind Franklin who, Watson said, “was so intelligent she rarely sought advice”.\n\nTeamwork taps into one of the basic drivers of human behaviour. ‘The principle of social proof is so pervasive that we don’t even recognise it,’ says Cialdini. ‘If your project is being resisted, for example, by a group of veteran employees, ask another old-timer to speak up for it.’ Cialdini is not alone in advocating this strategy. Research shows that peer power, used horizontally not vertically, is much more powerful than any boss’s speech.\n\nWriting, visualising and prototyping can stimulate the flow of new ideas. Cialdini cites scores of research papers and historical events that prove that even something as simple as writing deepens every individual’s engagement in the project. It is, he says, the reason why all those competitions on breakfast cereal packets encouraged us to write in saying, in no more than 10 words: ‘I like Kellogg’s Corn Flakes because… .’ The very act of writing makes us more likely to believe it.\n\nAuthority doesn’t have to inhibit innovation but it often does. The wrong kind of leadership will lead to what Cialdini calls ‘captainitis, the regrettable tendency of team members to opt out of team responsibilities that are properly theirs. He calls it captainitis because, he says, ‘crew members of multipilot aircraft exhibit a sometimes deadly passivity when the flight captain makes a clearly wrong-headed decision”. This behaviour is not, he says, unique to air travel, but can happen in any workplace where the leader is overbearing.\n\nAt the other end of the scale is the 1980s Memphis design collective, a group of young designers for whom ‘the only rule was that there were no rules’. This environment encouraged a free interchange of ideas, which led to more creativity with form, function, colour and materials that revolutionised attitudes to furniture design.\n\nMany theorists believe the ideal boss should lead from behind, taking pride in collective accomplishment and giving credit where it is due. Cialdini says: “Leaders should encourage everyone to contribute and simultaneously assure all concerned that every recommendation is important to making the right decision and will be given full attention” The frustrating thing about innovation is that there are many approaches, but no magic formula. However, a manager who wants to create a truly innovative culture can make their job a lot easier by recognising these psychological realities.`,
        questions: [
          {
            questionNumber: 27,
            type: "MULTIPLE_CHOICE",
            content: "The example of the 'million-dollar quartet' underlines the writer's point about",
            options: [
              "A. recognising talent.",
              "B. working as a team.",
              "C. having a shared objective.",
              "D. being an effective leader."
            ],
            answer: "C",
            explanation: "The quartet illustrates value fit and having a shared objective, which Roy Orbison did not share."
          },
          {
            questionNumber: 28,
            type: "MULTIPLE_CHOICE",
            content: "James Watson suggests that he and Francis Crick won the race to discover the DNA code because they",
            options: [
              "A. were conscious of their own limitations.",
              "B. brought complementary skills to their partnership.",
              "C. were determined to outperform their brighter rivals.",
              "D. encouraged each other to realise their joint ambition."
            ],
            answer: "A",
            explanation: "Watson said they succeeded because they knew they weren't the smartest, so they sought advice."
          },
          {
            questionNumber: 29,
            type: "MULTIPLE_CHOICE",
            content: "The writer mentions competitions on breakfast cereal packets as an example of how to",
            options: [
              "A. inspire creative thinking.",
              "B. generate concise writing.",
              "C. promote loyalty to a group.",
              "D. strengthen commitment to an idea."
            ],
            answer: "D",
            explanation: "The act of writing makes people more likely to believe what they write, strengthening commitment."
          },
          {
            questionNumber: 30,
            type: "MULTIPLE_CHOICE",
            content: "In the last paragraph, the writer suggests that it is important for employees to",
            options: [
              "A. be aware of their company's goals.",
              "B. feel that their contributions are valued.",
              "C. have respect for their co-workers' achievements.",
              "D. understand why certain management decisions are made."
            ],
            answer: "B",
            explanation: "Managers should ensure every recommendation is treated as important to make them feel valued."
          },
          {
            questionNumber: 31,
            type: "MULTIPLE_CHOICE",
            content: "Employees whose values match those of their employers are more likely to",
            options: [
              "A. take chances.",
              "B. share their ideas.",
              "C. become competitive.",
              "D. get promotion.",
              "E. avoid risk.",
              "F. ignore their duties.",
              "G. remain in their jobs."
            ],
            answer: "G",
            explanation: "Matching values dictates whether an employee remains at the company (remain in their jobs)."
          },
          {
            questionNumber: 32,
            type: "MULTIPLE_CHOICE",
            content: "At times of change, people tend to",
            options: [
              "A. take chances.",
              "B. share their ideas.",
              "C. become competitive.",
              "D. get promotion.",
              "E. avoid risk.",
              "F. ignore their duties.",
              "G. remain in their jobs."
            ],
            answer: "E",
            explanation: "When things change, we are hard-wired to play it safe (avoid risk)."
          },
          {
            questionNumber: 33,
            type: "MULTIPLE_CHOICE",
            content: "If people are aware of what they might lose, they will often",
            options: [
              "A. take chances.",
              "B. share their ideas.",
              "C. become competitive.",
              "D. get promotion.",
              "E. avoid risk.",
              "F. ignore their duties.",
              "G. remain in their jobs."
            ],
            answer: "A",
            explanation: "People take more gambles (take chances) when threatened with a loss."
          },
          {
            questionNumber: 34,
            type: "MULTIPLE_CHOICE",
            content: "People working under a dominant boss are liable to",
            options: [
              "A. take chances.",
              "B. share their ideas.",
              "C. become competitive.",
              "D. get promotion.",
              "E. avoid risk.",
              "F. ignore their duties.",
              "G. remain in their jobs."
            ],
            answer: "F",
            explanation: "Dominant bosses lead to 'captainitis' where team members opt out of responsibilities (ignore their duties)."
          },
          {
            questionNumber: 35,
            type: "MULTIPLE_CHOICE",
            content: "Employees working in organisations with few rules are more likely to",
            options: [
              "A. take chances.",
              "B. share their ideas.",
              "C. become competitive.",
              "D. get promotion.",
              "E. avoid risk.",
              "F. ignore their duties.",
              "G. remain in their jobs."
            ],
            answer: "B",
            explanation: "An environment with no rules encourages a free interchange of ideas (share their ideas)."
          },
          {
            questionNumber: 36,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "The physical surroundings in which a person works play a key role in determining their creativity.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NO",
            explanation: "The text mentions that some in luxurious centres don't feel creative, while others in limited space succeed."
          },
          {
            questionNumber: 37,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Most people have the potential to be creative.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "YES",
            explanation: "The text says 'almost every individual can be creative in the right circumstances.'"
          },
          {
            questionNumber: 38,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Teams work best when their members are of equally matched intelligence.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "The passage does not comment on whether team members should have equally matched intelligence."
          },
          {
            questionNumber: 39,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "It is easier for smaller companies to be innovative.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "The passage doesn't mention whether it is easier for small companies to innovate compared to large ones."
          },
          {
            questionNumber: 40,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "A manager's approval of an idea is more persuasive than that of a colleague.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NO",
            explanation: "The text states 'peer power... is much more powerful than any boss's speech.'"
          }
        ]
      }
    ]
  },
  {
    title: "Cambridge IELTS 10 Test 2 Reading",
    description: "Reading Practice Test 2 from Cambridge IELTS 10 (Tea and the Industrial Revolution, Gifted Children, Museums of Fine Art)",
    type: "READING",
    duration: 60,
    sections: [
      {
        sectionOrder: 1,
        title: "Passage 1: Tea and the Industrial Revolution",
        passageText: `Alan Macfarlane, professor of anthropological science at King's College, Cambridge, has, like other historians, spent decades wrestling with the enigma of the Industrial Revolution. Why did this particular Big Bang - the world-changing birth of industry - happen in Britain? And why did it strike at the end of the 18th century?\n\nMacfarlane compares the puzzle to a combination lock. 'There are about 20 different factors and all of them need to be present before the revolution can happen,' he says. 'For industry to take off, there needs to be the technology and power to drive factories, large urban populations to provide cheap labour, easy transport to move goods around, an affluent middle-class willing to buy mass-produced objects, a market-driven economy and a political system that allows this to happen.'\n\nWhile this was the case for England, other nations, such as Japan, the Netherlands and France also met some of these criteria but were not industrialising. 'All these factors must have been necessary but not sufficient to cause the revolution,' says Macfarlane. 'After all, Holland had everything except coal, while China also had many of these factors. Most historians are convinced there are one or two missing factors that you need to open the lock.'\n\nThe missing factors, he proposes, are to be found in almost every kitchen cupboard. Tea and beer, two of the nation's favourite drinks, fuelled the revolution. The antiseptic properties of tannin, the active ingredient in tea, and of hops in beer, plus the fact that both are made with boiled water, allowed urban communities to flourish at close quarters without succumbing to water-borne diseases such as dysentery. The theory sounds eccentric but once he starts to explain the detective work that went into his deduction, the scepticism gives way to wary admiration. Macfarlane's case has been strengthened by support from notable quarters - Roy Porter, the distinguished medical historian, recently wrote a favourable appraisal of his research.\n\nMacfarlane had wondered for a long time how the Industrial Revolution came about. Historians had alighted on one interesting factor around the mid-18th century that required explanation. Between about 1650 and 1740, the population in Britain was static. But then there was a burst in population growth. Macfarlane says: 'The infant mortality rate halved in the space of 20 years, and this happened in both rural areas and cities, and across all classes. People suggested four possible causes. Was there a sudden change in the viruses and bacteria around? Unlikely. Was there a revolution in medical science? But this was a century before Lister's revolution. Was there a change in environmental conditions? There were improvements in agriculture that wiped out malaria, but these were small gains. Sanitation did not become widespread until the 19th century. The only option left is food.'\n\nBut the height and weight statistics show a decline. So the food must have got worse. Efforts to explain this sudden reduction in child deaths appeared to draw a blank.\n\nThis population burst seemed to happen at just the right time to provide labour for the Industrial Revolution. 'When you start moving towards an industrial revolution, it is economically efficient to have people close together,' says Macfarlane. 'But then you get disease, particularly from human waste. Some digging around in historical records revealed that there was a change in the incidence of water-borne disease at that time, especially dysentery.' Macfarlane deduced that whatever the British were drinking must have been important in regulating disease. He says: 'We drank beer. For a long time, the English were protected by the strong antibacterial agent in hops, which were added to help preserve the beer. But in the late 17th century a tax was introduced on malt, the basic ingredient of beer. The poor turned to water and gin and in the 1720s the mortality rate began to rise again. Then it suddenly dropped again. What caused this?'\n\nMacfarlane looked to Japan, which was also developing large cities about the same time, and also had no sanitation. Water-borne diseases had a much looser grip on the Japanese population than those in Britain. Could it be the prevalence of tea in their culture? Macfarlane then noted that the history of tea in Britain provided an extraordinary coincidence of dates. Tea was relatively expensive until Britain started a direct clipper trade with China in the early 18th century. By the 1740s, about the time that infant mortality was dipping, the drink was common. Macfarlane guessed that the fact that water had to be boiled, together with the stomach-purifying properties of tea, meant that the breast milk provided by mothers was healthier than it had ever been. No other European nation sipped tea like the British, which, by Macfarlane's logic, pushed these other countries out of contention for the revolution.\n\nBut, if tea is a factor in the combination lock, why didn't Japan forge ahead in a tea-soaked industrial revolution of its own? Macfarlane notes that even though 17th-century Japan had large cities, high literacy rates, even a futures market, it had turned its back on the essence of any work-based revolution by giving up labour-saving devices such as animals, afraid that they would put people out of work. So, the nation that we now think of as one of the most technologically advanced entered the 19th century having abandoned the wheel.`,
        questions: [
          {
            questionNumber: 1,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph A from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "D",
            explanation: "Paragraph A introduces the enigma of why and when the Industrial Revolution occurred in Britain, matching heading iv."
          },
          {
            questionNumber: 2,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph B from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "H",
            explanation: "Paragraph B lists the various factors and conditions (such as transport, population, middle class) necessary for industry to take off, matching heading viii."
          },
          {
            questionNumber: 3,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph C from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "G",
            explanation: "Paragraph C introduces the two missing factors or keys (tea and beer) that were required to open the combination lock, matching heading vii."
          },
          {
            questionNumber: 4,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph D from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "A",
            explanation: "Paragraph D outlines the sudden burst in population growth after 1740 and the search for explanations for this change, matching heading i."
          },
          {
            questionNumber: 5,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph E from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "F",
            explanation: "Paragraph E details the historical shifts in drinking habits, from beer to gin and finally to tea, matching heading vi."
          },
          {
            questionNumber: 6,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph F from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "I",
            explanation: "Paragraph F compares Britain with Japan to show how their tea-drinking culture similarly helped regulate water-borne diseases, matching heading ix."
          },
          {
            questionNumber: 7,
            type: "MULTIPLE_CHOICE",
            content: "Choose the correct heading for Paragraph G from the list of headings below.",
            options: [
              "i. The search for the reasons for an increase in population",
              "ii. Industrialisation and the fear of unemployment",
              "iii. The development of cities in Japan",
              "iv. The time and place of the Industrial Revolution",
              "v. The cases of Holland, France and China",
              "vi. Changes in drinking habits in Britain",
              "vii. Two keys to Britain's industrial revolution",
              "viii. Conditions required for industrialisation",
              "ix. Comparisons with Japan lead to the answer"
            ],
            answer: "B",
            explanation: "Paragraph G explains that Japan turned its back on the work-based revolution and labor-saving devices due to a fear of unemployment, matching heading ii."
          },
          {
            questionNumber: 8,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "China's transport system was not suitable for industry in the 18th century.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "The passage notes that China had many of the necessary factors for industrialization, but it does not make any statement regarding the suitability of its transport system specifically."
          },
          {
            questionNumber: 9,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Tea and beer both helped to prevent dysentery in Britain.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "The text explains that the antiseptic properties of tannin in tea and hops in beer, alongside boiling the water, allowed communities to survive without succumbing to water-borne diseases like dysentery."
          },
          {
            questionNumber: 10,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Roy Porter disagreed with Macfarlane's findings.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "FALSE",
            explanation: "The text states that Macfarlane's case was strengthened by support from Roy Porter, who wrote a favourable appraisal of his research."
          },
          {
            questionNumber: 11,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "After 1740, there was a reduction in population in Britain.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "FALSE",
            explanation: "The passage indicates that after 1740, there was a sudden 'burst in population growth' rather than a reduction."
          },
          {
            questionNumber: 12,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "People in Britain used to make beer at home.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "While the passage discusses beer drinking and taxes on malt, it does not mention whether beer was commonly brewed at home."
          },
          {
            questionNumber: 13,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "The tax on malt indirectly caused a rise in the death rate.",
            options: ["TRUE", "FALSE", "NOT GIVEN"],
            answer: "TRUE",
            explanation: "The text notes that when the tax on malt was introduced, the poor turned to water and gin, causing the mortality rate to begin to rise again in the 1720s."
          }
        ]
      },
      {
        sectionOrder: 2,
        title: "Passage 2: Gifted Children and Learning",
        passageText: `A\nInternationally, 'giftedness' is most frequently determined by a score on a general intelligence test, known as an IQ test, which is above a chosen cut-off point, usually at around the top 2-5%. Children's educational environment contributes to the IQ score and the way intelligence is used. For example, a very close positive relationship was found when children's IQ scores were compared with their home educational provision (Freeman, 2010). The higher the children's IQ scores, especially over IQ 130, the better the quality of their educational backup, measured in terms of reported verbal interactions with parents, number of books and activities in their home etc. Because IQ tests are decidedly influenced by what the child has learned, they are to some extent measures of current achievement based on age-norms, that is, how well the children have learned to manipulate their knowledge and know-how within the terms of the test. The vocabulary aspect, for example, is dependent on having heard those words. But IQ tests can neither identify the processes of learning and thinking nor predict creativity.\n\nB\nExcellence does not emerge without appropriate help. To reach an exceptionally high standard in any area very able children need the means to learn, which includes material to work with, focused challenging tuition, and the encouragement to follow their dream. There appears to be a qualitative difference in the way the intellectually highly able think, compared with more average-ability or older pupils, for whom external regulation by the teacher often compensates for lack of internal regulation. To be at their most effective in their self-regulation, all children can be helped to identify their own ways of learning (metacognition), which will include strategies of planning, monitoring, evaluation, and choice of what to learn. Emotional awareness is part of metacognition, so children should be helped to be aware of their feelings around the area to be learned, feelings of curiosity or confidence, for example.\n\nC\nHigh achievers have been found to use self-regulatory learning strategies more often and more effectively than lower achievers, and are better able to transfer these strategies to deal with unfamiliar tasks. This happens to such a high degree in some children that they appear to be demonstrating talent in particular areas. Overviewing research on the thinking process of highly able children, (Shore and Kanevsky, 1993) put the instructor's problem succinctly: 'If they [the gifted] merely think more quickly, then we need only teach more quickly. If they merely make fewer errors, then we can shorten the practice.' But of course, this is not entirely the case; adjustments have to be made in methods of learning and teaching to take account of the many ways individuals think.\n\nD\nYet in order to learn by themselves, the gifted do need some support from their teachers. Conversely, teachers who have a tendency to 'overdirect' can diminish their pupils' learning autonomy. Although 'spoon-feeding' can produce extremely high examination results, these are not always followed by equally impressive life successes. Too much dependence on the teacher risks loss of autonomy and motivation to discover. However, when teachers help pupils to reflect on their own learning and thinking activities, they increase their pupils' self-regulation. For a young child, it may be just the simple question 'What have you learned today?' which helps them to recognise what they are doing. Given that a fundamental goal of education is to transfer the control of learning from teachers to pupils, improving pupils' learning-to-learn techniques should be a major outcome of the school experience, especially for the highly competent. There are quite a number of new methods which can help, such as child-initiated learning, ability-peer tutoring, etc. Such practices have been found to be particularly useful for bright children from deprived areas.\n\nE\nBut scientific progress is not all theoretical, knowledge is also vital to outstanding performance: individuals who know a great deal about a specific domain will achieve at a higher level than those who do not (Elshout, 1995). Research with creative scientists by Simonton (1988) brought him to the conclusion that above a certain high level, characteristics such as independence seemed to contribute more to reaching the highest levels of expertise than intellectual skills, due to the great demands of effort and time needed for learning and practice. Creativity in all forms can be seen as expertise mixed with high levels of motivation (Weisberg, 1993).\n\nF\nTo sum up, learning is affected by emotions of both the individual and significant others. Positive emotions facilitate the creative aspects of learning and negative emotions inhibit it. Fear, for example, can limit the development of curiosity, which is a strong force in scientific advance, because it motivates problem-solving behaviour. In Boekaerts' (1991) review of emotion in the learning of high IQ and highly achieving children, she found emotional forces in harness. They were not only curious, but often had a strong desire to control their environment, improve their learning efficiency, and increase their own learning resources.`,
        questions: [
          {
            questionNumber: 14,
            type: "MULTIPLE_CHOICE",
            content: "Which paragraph contains a reference to the influence of the domestic background on the gifted child?",
            options: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E", "Paragraph F"],
            answer: "A",
            explanation: "Paragraph A states that a very close positive relationship was found when children's IQ scores were compared with their home educational provision."
          },
          {
            questionNumber: 15,
            type: "MULTIPLE_CHOICE",
            content: "Which paragraph contains a reference to what can be lost if learners are given too much guidance?",
            options: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E", "Paragraph F"],
            answer: "D",
            explanation: "Paragraph D mentions that teachers who tend to 'overdirect' diminish pupils' learning autonomy and risk loss of motivation."
          },
          {
            questionNumber: 16,
            type: "MULTIPLE_CHOICE",
            content: "Which paragraph contains a reference to the damaging effects of anxiety?",
            options: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E", "Paragraph F"],
            answer: "F",
            explanation: "Paragraph F discusses how emotions affect learning, noting that negative emotions (like fear or anxiety) inhibit the creative aspects of learning."
          },
          {
            questionNumber: 17,
            type: "MULTIPLE_CHOICE",
            content: "Which paragraph contains examples of classroom techniques which favour socially-disadvantaged children?",
            options: ["Paragraph A", "Paragraph B", "Paragraph C", "Paragraph D", "Paragraph E", "Paragraph F"],
            answer: "D",
            explanation: "Paragraph D notes that practices like child-initiated learning and peer tutoring are particularly useful for bright children from deprived areas."
          },
          {
            questionNumber: 18,
            type: "MULTIPLE_CHOICE",
            content: "Match the statement to the correct person: Less time can be spent on exercises with gifted pupils who produce accurate work.",
            options: [
              "A. Freeman",
              "B. Shore and Kanevsky",
              "C. Elshout",
              "D. Simonton",
              "E. Boekaerts"
            ],
            answer: "B",
            explanation: "Shore and Kanevsky state: 'If they merely make fewer errors, then we can shorten the practice.'"
          },
          {
            questionNumber: 19,
            type: "MULTIPLE_CHOICE",
            content: "Match the statement to the correct person: Self-reliance is a valuable tool that helps gifted students reach their goals.",
            options: [
              "A. Freeman",
              "B. Shore and Kanevsky",
              "C. Elshout",
              "D. Simonton",
              "E. Boekaerts"
            ],
            answer: "D",
            explanation: "Simonton concluded that characteristics such as independence (self-reliance) contribute more to reaching high expertise than intellectual skills."
          },
          {
            questionNumber: 20,
            type: "MULTIPLE_CHOICE",
            content: "Match the statement to the correct person: Gifted children know how to channel their feelings to assist their learning.",
            options: [
              "A. Freeman",
              "B. Shore and Kanevsky",
              "C. Elshout",
              "D. Simonton",
              "E. Boekaerts"
            ],
            answer: "E",
            explanation: "Boekaerts found emotional forces in harness, showing how gifted children use emotions to regulate and improve learning efficiency."
          },
          {
            questionNumber: 21,
            type: "MULTIPLE_CHOICE",
            content: "Match the statement to the correct person: The very gifted child benefits from appropriate support from close relatives.",
            options: [
              "A. Freeman",
              "B. Shore and Kanevsky",
              "C. Elshout",
              "D. Simonton",
              "E. Boekaerts"
            ],
            answer: "A",
            explanation: "Freeman discusses the positive relationship between IQ scores and the child's home educational backup (provided by parents/relatives)."
          },
          {
            questionNumber: 22,
            type: "MULTIPLE_CHOICE",
            content: "Match the statement to the correct person: Really successful students have learnt a considerable amount about their subject.",
            options: [
              "A. Freeman",
              "B. Shore and Kanevsky",
              "C. Elshout",
              "D. Simonton",
              "E. Boekaerts"
            ],
            answer: "C",
            explanation: "Elshout states that individuals who know a great deal about a specific domain (knowledge) achieve at a higher level."
          },
          {
            questionNumber: 23,
            type: "FILL_IN_BLANKS",
            content: "One study found a strong connection between children's IQ and the availability of 23. _______ and activities at home.",
            answer: "books",
            explanation: "The passage notes that educational backup is measured in terms of verbal interactions, 'number of books and activities in their home etc.'"
          },
          {
            questionNumber: 24,
            type: "FILL_IN_BLANKS",
            content: "Children of average ability seem to need more direction from teachers because they do not have 24. _______.",
            answer: "internal regulation",
            explanation: "Paragraph B mentions average-ability pupils depend on external regulation because they lack internal regulation."
          },
          {
            questionNumber: 25,
            type: "FILL_IN_BLANKS",
            content: "Metacognition involves children understanding their own learning strategies, as well as developing 25. _______.",
            answer: "emotional awareness",
            explanation: "Paragraph B states that metacognition includes planning/monitoring strategies and also that 'emotional awareness is part of metacognition'."
          },
          {
            questionNumber: 26,
            type: "FILL_IN_BLANKS",
            content: "Teachers who rely on 26. _______ run the risk of reducing their pupils' learning autonomy.",
            answer: "spoon-feeding",
            explanation: "Paragraph D states that although 'spoon-feeding' produces high exam results, it risks a loss of learning autonomy."
          }
        ]
      },
      {
        sectionOrder: 3,
        title: "Passage 3: Museums of Fine Art and Their Public",
        passageText: `The fact that people go to the Louvre museum in Paris to see the original painting Mona Lisa when they can see a reproduction anywhere leads us to question some assumptions about the role of museums of fine art in today's world.\n\nOne of the most famous works of art in the world is Leonardo da Vinci's Mona Lisa. Nearly everyone who goes to see the original will already be familiar with it from reproductions, but they accept that fine art is more rewardingly viewed in its original form. However, if Mona Lisa was a famous novel, few people would bother to go to a museum to read the writer's actual manuscript rather than a printed reproduction. This might be explained by the fact that the novel evolved precisely because of technological developments that made it possible to print out huge numbers of texts, whereas oil paintings have always been produced as unique objects. In addition, it could be argued that the practice of interpreting or 'reading' each medium follows different conventions. With novels, the reader attends mainly to the meaning of words rather than the way they are printed on the page, whereas the 'reader' of a painting must attend just as closely to the material form of marks and shapes in the picture as to any ideas they may signify.\n\nYet it has always been possible to make very accurate facsimiles of pretty well any fine art work. The seven surviving versions of Mona Lisa bear witness to the fact that in the 16th century, artists seemed perfectly content to assign the reproduction of their creations to their workshop apprentices as regular 'bread and butter' work. And today the task of reproducing pictures is incomparably more simple and reliable, with reprographic techniques that allow the production of high-quality prints made exactly to the original scale, with faithful colour values, and even with duplication of the surface relief of the painting. But despite an implicit recognition that the spread of good reproductions can be culturally valuable, museums continue to promote the special status of original work. Unfortunately, this seems to place severe limitations on the kind of experience offered to visitors.\n\nOne limitation is related to the way the museum presents its exhibits. As repositories of unique historical objects, art museums are often called 'treasure houses'. We are reminded of this even before we view a collection by the presence of security guards, attendants, ropes and display cases to keep us away from the exhibits. In many cases, the architectural style of the building further reinforces that notion. In addition, a major collection like that of London's National Gallery is housed in numerous rooms, each with dozens of works, each of which is likely to be worth more than all the average visitor possesses. In a society that judges the personal status of the individual so much by their material worth, it is therefore difficult not to be impressed by one's own relative 'worthlessness' in such an environment.\n\nFurthermore, consideration of the 'value' of the original work in its treasure house impresses upon the viewer that, since these were originally produced, they have been assigned a monetary value by some person or institution more powerful than themselves. Evidently, nothing the viewer thinks about the work is going to alter that value, and so today's viewer is deterred from trying to extend that spontaneous, immediate, self-reliant kind of criticism which would originally have met the work.\n\nThe visitor may then be struck by the strangeness of seeing such diverse paintings, drawings and sculptures brought together in an environment for which they were not originally created. This 'displacement effect' is further heightened by the sheer volume of exhibits. In the case of a major collection, there are probably more works on display than we could realistically view in weeks or even months.\n\nThis is particularly distressing because time seems to be a vital factor in the appreciation of all art forms. A fundamental difference between paintings and other art forms is that there is no prescribed time over which a painting is viewed. By contrast, the audience encounters an opera or a play over a specific time, which is the duration of the performance. Similarly, novels and poems are read in a prescribed temporal sequence, whereas a picture has no clear place at which to start or at which to finish. Thus art works themselves encourage us to view them superficially, without appreciating the richness of detail and labour that is involved.\n\nConsequently, the dominant critical approach becomes that of the art historian, a specialised academic approach devoted to discovering the meaning of art within the cultural context of its time. This is in perfect harmony with the museum's function, since the approach is dedicated to seeking out and conserving authentic 'original' readings of the exhibits. Again, this seems to put a limit to that spontaneous, participatory criticism which would originally have met the work, which can be found in abundance in criticism of classic works of literature, but is absent from most art history.\n\nThe displays of art museums serve as a warning of what critical practices can emerge when spontaneous criticism is suppressed. The museum public, like any other audience, experience art more rewardingly when given the confidence to express their views. If appropriate works of fine art could be rendered permanently accessible to the public by means of high-fidelity reproductions, they may feel somewhat less in awe of them. Unfortunately, that may be too much to ask from those who seek to maintain and control the art establishment.`,
        questions: [
          {
            questionNumber: 27,
            type: "MULTIPLE_CHOICE",
            content: "Complete the summary: But they do not go to museums to read original manuscripts of novels, perhaps because the availability of novels has depended on 27. _______ for so long...",
            options: [
              "A. institution",
              "B. mass production",
              "C. mechanical processes",
              "D. public",
              "E. paints",
              "F. artist",
              "G. size",
              "H. underlying ideas",
              "I. basic technology",
              "J. readers",
              "K. picture frames",
              "L. assistants"
            ],
            answer: "B",
            explanation: "The novel evolved due to mass production printing methods that allowed huge numbers of texts to be printed."
          },
          {
            questionNumber: 28,
            type: "MULTIPLE_CHOICE",
            content: "Complete the summary: ...and also because with novels, the 28. _______ are the most important thing.",
            options: [
              "A. institution",
              "B. mass production",
              "C. mechanical processes",
              "D. public",
              "E. paints",
              "F. artist",
              "G. size",
              "H. underlying ideas",
              "I. basic technology",
              "J. readers",
              "K. picture frames",
              "L. assistants"
            ],
            answer: "H",
            explanation: "In literature, readers attend to the meaning of the words (underlying ideas) rather than the physical layout of the page."
          },
          {
            questionNumber: 29,
            type: "MULTIPLE_CHOICE",
            content: "Complete the summary: However, in historical times artists such as Leonardo were happy to instruct 29. _______ to produce copies of their work...",
            options: [
              "A. institution",
              "B. mass production",
              "C. mechanical processes",
              "D. public",
              "E. paints",
              "F. artist",
              "G. size",
              "H. underlying ideas",
              "I. basic technology",
              "J. readers",
              "K. picture frames",
              "L. assistants"
            ],
            answer: "L",
            explanation: "Historically, artists commonly assigned creations to workshop apprentices (assistants) to copy."
          },
          {
            questionNumber: 30,
            type: "MULTIPLE_CHOICE",
            content: "Complete the summary: ...and these days new methods of reproduction allow excellent replication of surface relief features as well as colour and 30. _______.",
            options: [
              "A. institution",
              "B. mass production",
              "C. mechanical processes",
              "D. public",
              "E. paints",
              "F. artist",
              "G. size",
              "H. underlying ideas",
              "I. basic technology",
              "J. readers",
              "K. picture frames",
              "L. assistants"
            ],
            answer: "G",
            explanation: "Modern reprographic systems replicate color, texture, and exact original scale (size)."
          },
          {
            questionNumber: 31,
            type: "MULTIPLE_CHOICE",
            content: "Complete the summary: It is regrettable that museums still promote the superiority of original works of art, since this may not be in the interests of the 31. _______.",
            options: [
              "A. institution",
              "B. mass production",
              "C. mechanical processes",
              "D. public",
              "E. paints",
              "F. artist",
              "G. size",
              "H. underlying ideas",
              "I. basic technology",
              "J. readers",
              "K. picture frames",
              "L. assistants"
            ],
            answer: "D",
            explanation: "Promoting original superiority places limitations on the kind of experience offered to visitors (the public)."
          },
          {
            questionNumber: 32,
            type: "MULTIPLE_CHOICE",
            content: "The writer mentions London's National Gallery to illustrate",
            options: [
              "A. the undesirable cost to a nation of maintaining a huge collection of art.",
              "B. the conflict that may arise in society between financial and artistic values.",
              "C. a negative effect a museum can have on visitors' opinions of themselves.",
              "D. the need to put individual well-being above large-scale artistic schemes."
            ],
            answer: "C",
            explanation: "The immense worth of items on display can make visitors feel a sense of relative 'worthlessness' regarding their own status."
          },
          {
            questionNumber: 33,
            type: "MULTIPLE_CHOICE",
            content: "The writer says that today, viewers may be unwilling to criticise a work because",
            options: [
              "A. they lack the knowledge needed to support an opinion.",
              "B. they fear it may have financial implications.",
              "C. they have no real concept of the work's value.",
              "D. they feel their personal reaction is of no significance."
            ],
            answer: "D",
            explanation: "Art value is predetermined by institutions, making viewers feel that nothing they think about the work will alter its value, rendering their response insignificant."
          },
          {
            questionNumber: 34,
            type: "MULTIPLE_CHOICE",
            content: "According to the writer, the 'displacement effect' on the visitor is caused by",
            options: [
              "A. the variety of works on display and the way they are arranged.",
              "B. the impossibility of viewing particular works of art over a long period.",
              "C. the similar nature of the paintings and the lack of great works.",
              "D. the inappropriate nature of the individual works selected for exhibition."
            ],
            answer: "A",
            explanation: "The displacement effect comes from seeing diverse paintings brought together in a setting for which they were not originally created."
          },
          {
            questionNumber: 35,
            type: "MULTIPLE_CHOICE",
            content: "The writer says that unlike other forms of art, a painting does not",
            options: [
              "A. involve direct contact with an audience.",
              "B. require a specific location for a performance.",
              "C. need the involvement of other professionals.",
              "D. have a specific beginning or end."
            ],
            answer: "D",
            explanation: "Paintings do not have a prescribed temporal sequence or viewing time; they have no clear starting or ending point."
          },
          {
            questionNumber: 36,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Art history should focus on discovering the meaning of art using a range of media.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "The text explains what art history does focus on (discovering the meaning of art in context), but does not state whether it should use a range of media."
          },
          {
            questionNumber: 37,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "The approach of art historians conflicts with that of art museums.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NO",
            explanation: "The text states that the approach of the art historian is in 'perfect harmony with the museum's function'."
          },
          {
            questionNumber: 38,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "People should be encouraged to give their opinions openly on works of art.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "YES",
            explanation: "The author asserts that the museum public experience art more rewardingly when given the confidence to express their views."
          },
          {
            questionNumber: 39,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "Reproductions of fine art should only be sold to the public if they are of high quality.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NOT GIVEN",
            explanation: "Although the text mentions high-fidelity reproductions as a way to make art accessible, it does not comment on sales restrictions or quality conditions."
          },
          {
            questionNumber: 40,
            type: "TRUE_FALSE_NOT_GIVEN",
            content: "In the future, those with power are likely to encourage more people to enjoy art.",
            options: ["YES", "NO", "NOT GIVEN"],
            answer: "NO",
            explanation: "The text concludes that encouraging wider enjoyment through reproductions is probably 'too much to ask from those who seek to maintain and control the art establishment'."
          }
        ]
      }
    ]
  },  {
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
