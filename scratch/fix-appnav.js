const fs = require('fs');
const file = 'frontend/src/navigation/AppNavigator.js';
let content = fs.readFileSync(file, 'utf8');

const conflict1Regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [^\r\n]+\r?\n?/;
content = content.replace(conflict1Regex, '$1\n');

const conflict2Regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [^\r\n]+\r?\n?/;
content = content.replace(conflict2Regex, (match, headPart) => {
    return headPart + '            <Stack.Screen name="Mentors" component={MentorsScreen} />\n';
});

const importRegex = /import AdminScreen\s+from '\.\.\/screens\/AdminScreen';/;
content = content.replace(importRegex, "import AdminScreen    from '../screens/AdminScreen';\nimport MentorsScreen  from '../screens/MentorsScreen';");

const tabNavRegex = /    <Tab\.Screen\s+name="Profile"/;
const mentorsTab = `    <Tab.Screen
      name="Mentors"
      component={MentorsScreen}
      options={{
        title: 'Gia sư',
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name="practice" // Fallback icon since mentors might not exist in HEAD
            size={24}
            color={focused ? COLORS.tabActive : COLORS.tabInactive}
          />
        ),
        tabBarLabel: ({ focused }) => <TabLabel label="Gia sư" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"`;

content = content.replace(tabNavRegex, mentorsTab);

fs.writeFileSync(file, content);
console.log('Fixed AppNavigator');
