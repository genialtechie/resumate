import { parseResume } from '../lib/parser/parse-text';
import { ResumeContentObject } from '@/types/resume';

describe('parseResume', () => {
  describe('Basic Parsing', () => {
    let parsedResume: ResumeContentObject;

    beforeEach(() => {
      const sampleResume = `John Doe
New York, NY
john.doe@email.com • (123) 456-7890 • linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development.

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker

EXPERIENCE
Senior Software Engineer • ABC Tech • 01/2020 - Present
• Led development of microservices architecture
• Mentored junior developers
• Implemented CI/CD pipelines

Software Engineer • XYZ Corp • 03/2018 - 12/2019
• Developed REST APIs
• Improved application performance by 40%

EDUCATION
University of Technology • 09/2014 - 05/2018
Bachelor of Science in Computer Science`;

      parsedResume = parseResume(sampleResume);
      // Log the parsed resume for debugging
      console.log('Parsed Resume:', JSON.stringify(parsedResume, null, 2));
    });

    test('parses header information correctly', () => {
      expect(parsedResume).toBeDefined();
      expect(parsedResume.name).toBe('John Doe');
      expect(parsedResume.location).toBe('New York, NY');
    });

    test('parses contact information correctly', () => {
      expect(parsedResume.contact).toBeDefined();
      expect(parsedResume.contact.email).toBe('john.doe@email.com');
      expect(parsedResume.contact.phone).toBe('(123) 456-7890');
      expect(parsedResume.contact.linkedin).toBe('linkedin.com/in/johndoe');
    });

    test('parses summary correctly', () => {
      expect(parsedResume.summary).toBeDefined();
      expect(parsedResume.summary).toContain('Experienced software engineer');
    });

    test('parses skills correctly', () => {
      expect(parsedResume.skills).toBeDefined();
      expect(parsedResume.skills).toEqual([
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Python',
        'AWS',
        'Docker',
      ]);
    });

    test('parses experience correctly', () => {
      expect(parsedResume.experience).toBeDefined();
      expect(parsedResume.experience).toHaveLength(2);

      // First experience entry
      const firstExp = parsedResume.experience[0];
      expect(firstExp).toBeDefined();
      expect(firstExp.title).toBe('Senior Software Engineer');
      expect(firstExp.company).toBe('ABC Tech');
      expect(firstExp.dates).toBe('01/2020 - Present');
      expect(firstExp.details).toEqual([
        'Led development of microservices architecture',
        'Mentored junior developers',
        'Implemented CI/CD pipelines',
      ]);

      // Second experience entry
      const secondExp = parsedResume.experience[1];
      expect(secondExp).toBeDefined();
      expect(secondExp.title).toBe('Software Engineer');
      expect(secondExp.company).toBe('XYZ Corp');
      expect(secondExp.dates).toBe('03/2018 - 12/2019');
      expect(secondExp.details).toEqual([
        'Developed REST APIs',
        'Improved application performance by 40%',
      ]);
    });

    test('parses education correctly', () => {
      expect(parsedResume.education).toBeDefined();
      expect(parsedResume.education).toHaveLength(1);

      const edu = parsedResume.education[0];
      expect(edu).toBeDefined();
      expect(edu.institution).toBe('University of Technology');
      expect(edu.degree).toBe('Bachelor of Science in Computer Science');
      expect(edu.dates).toBe('09/2014 - 05/2018');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty input', () => {
      const result = parseResume('');
      expect(result).toBeDefined();
      expect(result.name).toBe('');
      expect(result.location).toBe('');
      expect(result.summary).toBe('');
      expect(result.skills).toEqual([]);
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
    });

    test('handles missing sections', () => {
      const partialResume = `John Smith
New York
john@email.com

EXPERIENCE
Software Developer • Tech Co • 01/2020 - Present
• Built features`;

      const result = parseResume(partialResume);
      expect(result).toBeDefined();
      expect(result.name).toBe('John Smith');
      expect(result.location).toBe('New York');
      expect(result.contact.email).toBe('john@email.com');
      expect(result.skills).toEqual([]);
      expect(result.experience).toHaveLength(1);
      expect(result.education).toEqual([]);
    });

    test('handles different date formats', () => {
      const resumeWithDates = `EXPERIENCE
Developer • Company A • January 2020 - Present
• Task 1
Engineer • Company B • 03/2018 - 12/2019
• Task 2`;

      const result = parseResume(resumeWithDates);
      expect(result.experience).toBeDefined();
      expect(result.experience).toHaveLength(2);
      expect(result.experience[0].dates).toBe('January 2020 - Present');
      expect(result.experience[1].dates).toBe('03/2018 - 12/2019');
      expect(result.experience[0].details).toEqual(['Task 1']);
      expect(result.experience[1].details).toEqual(['Task 2']);
      expect(result.experience[0].title).toBe('Developer');
      expect(result.experience[1].title).toBe('Engineer');
      expect(result.experience[0].company).toBe('Company A');
      expect(result.experience[1].company).toBe('Company B');
    });
  });

  describe('Special Characters', () => {
    test('handles different bullet points', () => {
      const resumeWithBullets = `EXPERIENCE
Developer • Company • 01/2020 - Present
• First bullet
- Second bullet
* Third bullet
› Fourth bullet
⁃ Fifth bullet`;

      const result = parseResume(resumeWithBullets);
      expect(result.experience).toBeDefined();
      expect(result.experience).toHaveLength(1);
      expect(result.experience[0].details).toHaveLength(5);
      expect(result.experience[0].details).toContain('First bullet');
      expect(result.experience[0].details).toContain('Second bullet');
    });

    test('handles special characters in contact info', () => {
      const resumeWithSpecialChars = `John Doe
New York
john.doe+test@email.com • (123) 456-7890 • https://linkedin.com/in/john-doe`;

      const result = parseResume(resumeWithSpecialChars);
      expect(result.contact).toBeDefined();
      expect(result.contact.email).toBe('john.doe+test@email.com');
      expect(result.contact.linkedin).toBe('https://linkedin.com/in/john-doe');
    });

    test('handles real resume format with complex formatting', () => {
      const realResume = `HALEEM BELLO  SOFTWARE ENGINEER  P   (470)   549 - 2477   E   thehaleembello@gmail.com   A   Atlanta, GA, USA   W   http://genialtechie.xyz

I have a solid background in full - stack development, leveraging core technologies such as Python, JavaScript, and  TypeScript. My experience ranges from web technologies like React and Next.js to back - end tools like Node .js, AWS, and  MongoDB. I'm interested in blockchain development and decentralized applications, and I've worked with Web3.js and  Solidity smart contracts. My commitment to web accessibility, SEO, and responsive design ensures that applications are  easy to   use and accessible. A desire for excellence,   professional development as a software engineer, and a commitment  to lifelong learning drive my motivation.

KEY SKILLS
Python,   HTML5, CSS3, JavaScript,   TypeScript,   Solidity,   React, Node.js, Express, Web3.js, Next.js, APIs, Git, MongoDB,  Graphql, Decentralized Apps, Blockchain   Development,   Web Accessibility   and SEO, Responsive   Web   Design, Firewall and  Network Security,   Leadership.

EXPERIENCE
Partner & Lead Developer |   Magpollo • 01/2023 - PRESENT
• Launched a web development and custom software solutions company focused on serving local businesses, successfully completing projects for two clients within the first quarter.
• Designed and developed modern, responsive websites for two clients, resulting in increased online orders and growth in customer engagement.
• Implemented advanced features such as real-time online reservations with SMS notifications, dynamic ordering systems, and seamless API integrations with existing POS and order management platforms, boosting operational efficiency.
• Collaborated with clients through effective communication, active listening, and empathy to understand their unique requirements, providing tailored solutions and ensuring project success and client satisfaction.
• Established and maintained strong client relationships through excellent interpersonal skills, resulting in potential future projects and positive word-of-mouth marketing for the company.
• Developed project management and leadership skills by coordinating a small team, ensuring on-time project delivery, and maintaining high-quality standards across all deliverables.

EDUCATION
Georgia Gwinnett College | B.Sc. in Info Tech (Software Development) • 01/2021 - PRESENT
• GPA: 3.0/4
• Relevant coursework: Web Application Development, Data Structures and Algorithms, Distributed Systems.
• Learned asynchronous, and remote teamwork, and meeting deadlines.

University Of Lagos, Nigeria | B.Sc. in Electrical & Electronics Engineering • 12/2016 - 08/2020
• Active member of the Developer Students Club.
• Completed coursework in programming languages, circuit design, and digital signal processing.
• Did not obtain degree due to relocation outside the country.`;

      const result = parseResume(realResume);
      expect(result).toBeDefined();
      expect(result.name).toBe('HALEEM BELLO');
      expect(result.location).toBe('Atlanta, GA, USA');
      expect(result.contact).toBeDefined();
      expect(result.contact.phone).toBe('(470) 549 - 2477');
      expect(result.contact.email).toBe('thehaleembello@gmail.com');
      expect(result.contact.website).toBe('http://genialtechie.xyz');

      // Test summary section
      expect(result.summary).toBeDefined();
      expect(result.summary).toContain(
        'solid background in full - stack development'
      );
      expect(result.summary).toContain(
        'blockchain development and decentralized applications'
      );

      // Test skills section
      expect(result.skills).toBeDefined();
      expect(result.skills).toContain('Python');
      expect(result.skills).toContain('JavaScript');
      expect(result.skills).toContain('TypeScript');
      expect(result.skills).toContain('React');
      expect(result.skills).toContain('Node.js');
      expect(result.skills).toContain('MongoDB');

      // Test experience section
      expect(result.experience).toBeDefined();
      expect(result.experience).toHaveLength(1);

      const firstExp = result.experience[0];
      expect(firstExp.title).toBe('Partner & Lead Developer');
      expect(firstExp.company).toBe('Magpollo');
      expect(firstExp.dates).toBe('01/2023 - PRESENT');
      expect(firstExp.details).toHaveLength(6);
      expect(firstExp.details).toContain(
        'Launched a web development and custom software solutions company focused on serving local businesses, successfully completing projects for two clients within the first quarter.'
      );
      expect(firstExp.details).toContain(
        'Designed and developed modern, responsive websites for two clients, resulting in increased online orders and growth in customer engagement.'
      );

      // Test education section
      expect(result.education).toBeDefined();
      expect(result.education).toHaveLength(2);

      const firstEdu = result.education[0];
      expect(firstEdu.institution).toBe('Georgia Gwinnett College');
      expect(firstEdu.degree).toBe('B.Sc. in Info Tech (Software Development)');
      expect(firstEdu.dates).toBe('01/2021 - PRESENT');

      const secondEdu = result.education[1];
      expect(secondEdu.institution).toBe('University Of Lagos, Nigeria');
      expect(secondEdu.degree).toBe(
        'B.Sc. in Electrical & Electronics Engineering'
      );
      expect(secondEdu.dates).toBe('12/2016 - 08/2020');
    });
  });
});
